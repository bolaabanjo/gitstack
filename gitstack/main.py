import click
import os
import json
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import threading
import socket
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
import hashlib # Import hashlib for file hashing
import uuid
import time as pytime

load_dotenv()

def ensure_snapshot_dir():
    """Make sure the .gitstack/ folder exists."""
    if not os.path.exists(SNAPSHOT_DIR):
        os.makedirs(SNAPSHOT_DIR)

def get_session_data():
    if os.path.exists(SESSION_FILE):
        with open(SESSION_FILE, "r") as f:
            return json.load(f)
    return {"clerk_session_token": None, "convex_user_id": None, "clerk_user_id": None}

def save_session_data(clerk_session_token, convex_user_id, clerk_user_id):
    with open(SESSION_FILE, "w") as f:
        json.dump({
            "clerk_session_token": clerk_session_token,
            "convex_user_id": convex_user_id,
            "clerk_user_id": clerk_user_id
        }, f, indent=2)

def clear_session_data():
    if os.path.exists(SESSION_FILE):
        os.remove(SESSION_FILE)

def get_authenticated_user_id():
    session = get_session_data()
    return session.get("convex_user_id")

def calculate_file_hash(filepath):
    """Calculates the SHA256 hash of a given file."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192): # Read in 8KB chunks
            hasher.update(chunk)
    return hasher.hexdigest()

# Directory where snapshots will be stored
SNAPSHOT_DIR = ".gitstack"
CLI_DEFAULT_PORT = 8000
CLI_AUTH_CALLBACK_PATH = "/auth-callback"
SNAPSHOT_FILE = os.path.join(SNAPSHOT_DIR, "snapshots.json")
GITSTACK_WEB_APP_URL = os.getenv("GITSTACK_WEB_APP_URL", "http://localhost:3000")
CONVEX_URL = os.getenv("CONVEX_URL", "NEXT_PUBLIC_CONVEX_URL")
CONVEX_USE_POLLING = True

# Global store used by handler
received_auth_data = {}
expected_cli_token = None

# Gitstack Web App URL
GITSTACK_WEB_APP_URL = os.getenv("GITSTACK_WEB_APP_URL", "http://localhost:3000")
CLI_AUTH_CALLBACK_PORT = 8000 # Port for the local CLI server to listen on
CLI_AUTH_CALLBACK_PATH = "/auth-callback" # Path for the local CLI server

# Clerk Authentication Configuration
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "sk_test_YOUR_CLERK_SECRET_KEY")
CLERK_API_URL = os.getenv("CLERK_API_URL", "https://api.clerk.com/v1/")

# Local storage for Clerk session token and Convex userId
SESSION_FILE = os.path.join(SNAPSHOT_DIR, "session.json")

def pick_available_port(preferred_port=CLI_DEFAULT_PORT):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("localhost", preferred_port))
        s.listen(1)
        port = s.getsockname()[1]
        s.close()
        return port
    except OSError:
        # preferred port unavailable--let OS pick a free ephemeral port
        s.close()
        s2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s2.bind(("localhost", 0))
        port = s2.getsockname()[1]
        s2.close()
        return port

def call_convex_function(function_type, function_name, args=None):
    if args is None:
        args = {}
    
    headers = {"Content-Type": "application/json"}
    endpoint = "mutation" if function_type == "mutation" else "query"
    payload = {"function": function_name, "args": args}
    
    try:
        response = requests.post(f"{CONVEX_URL}/api/{endpoint}", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        click.echo(f"Error calling Convex function {function_name}: {e}")
        return None

def call_clerk_api(endpoint, method="GET", json_data=None, include_token=False):
    headers = {"Content-Type": "application/json"}
    if include_token:
        session_token = get_session_data().get("clerk_session_token")
        if not session_token:
            click.echo("Error: Not logged in. Please log in first.")
            return None
        headers["Authorization"] = f"Bearer {session_token}"
    else:
        # For requests that don't need a user session token but need secret key (e.g., creating a user)
        headers["Authorization"] = f"Bearer {CLERK_SECRET_KEY}"

    url = f"{CLERK_API_URL}{endpoint}"
    
    try:
        if method == "POST":
            response = requests.post(url, headers=headers, json=json_data)
        elif method == "PUT": # Clerk might use PUT for updating users/sessions
            response = requests.put(url, headers=headers, json=json_data)
        else:
            response = requests.get(url, headers=headers)
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        click.echo(f"Clerk API error ({e.response.status_code}) for {endpoint}: {e.response.text}")
        return None
    except requests.exceptions.RequestException as e:
        click.echo(f"Error calling Clerk API {endpoint}: {e}")
        return None

# Global variable to store the received auth token and user ID
received_auth_data = {}

class CLIAuthHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_POST(self):
        global received_auth_data, expected_cli_token
        # Only accept POSTs to the callback path
        if not self.path.startswith(CLI_AUTH_CALLBACK_PATH):
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b""
        try:
            payload = json.loads(body.decode("utf-8") or "{}")
        except Exception:
            payload = {}

        # Accept either token in body or query for pairing safety
        qs = parse_qs(urlparse(self.path).query)
        cli_token_qs = qs.get("cli_auth_token", [None])[0]
        cli_token = payload.get("cli_auth_token") or cli_token_qs or expected_cli_token

        clerk_session_token = payload.get("clerk_session_token")
        clerk_user_id = payload.get("clerk_user_id")
        convex_user_id = payload.get("convex_user_id")

        # Basic validation: token must match expected
        if expected_cli_token and cli_token != expected_cli_token:
            self.send_response(403)
            self._set_cors_headers()
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid cli_auth_token"}).encode("utf-8"))
            return

        if clerk_session_token and clerk_user_id and convex_user_id:
            received_auth_data = {
                "clerk_session_token": clerk_session_token,
                "clerk_user_id": clerk_user_id,
                "convex_user_id": convex_user_id,
                "cli_auth_token": cli_token,
            }
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Authentication received. You can close this tab and return to the terminal.</h1></body></html>")
        else:
            self.send_response(400)
            self._set_cors_headers()
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Missing required auth fields"}).encode("utf-8"))

    def do_GET(self):
        # Fallback GET support (for redirects that put params in URL)
        global received_auth_data, expected_cli_token
        if not self.path.startswith(CLI_AUTH_CALLBACK_PATH):
            self.send_response(404)
            self.end_headers()
            return

        qs = parse_qs(urlparse(self.path).query)
        clerk_session_token = qs.get("clerk_session_token", [None])[0]
        clerk_user_id = qs.get("clerk_user_id", [None])[0]
        convex_user_id = qs.get("convex_user_id", [None])[0]
        cli_token = qs.get("cli_auth_token", [None])[0] or expected_cli_token

        if expected_cli_token and cli_token != expected_cli_token:
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b"Invalid cli_auth_token")
            return

        if clerk_session_token and clerk_user_id and convex_user_id:
            received_auth_data = {
                "clerk_session_token": clerk_session_token,
                "clerk_user_id": clerk_user_id,
                "convex_user_id": convex_user_id,
                "cli_auth_token": cli_token,
            }
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Authentication received. You can close this tab and return to the terminal.</h1></body></html>")
        else:
            self.send_response(400)
            self._set_cors_headers()
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Authentication failed: missing params.</h1></body></html>")


@click.group()
def main():
    """Gitstack - An advanced modern version control system."""
    pass


@click.command()
def make():
    """Initializes a new gitstack repository. Now mainly ensures local dir."""
    ensure_snapshot_dir()
    click.echo("Local .gitstack directory ensured.")


@click.command()
def date():
    """Prints the current date and time."""
    now = datetime.now(timezone.utc)
    click.echo("Current date (UTC): {}".format(now.date().isoformat()))

@click.command()
def time():
    """Prints the current time."""
    now = datetime.now(timezone.utc)
    click.echo("Current time (UTC): {}".format(now.time().isoformat()))

@click.command()
def login():
    """Logs in to Gitstack via browser."""
    click.echo("Iniializing Browser to log into Gitstack...")

    redirect_uri = f"http://localhost:{CLI_AUTH_CALLBACK_PORT}{CLI_AUTH_CALLBACK_PATH}"

    # Construct the URL for the web app's sign-in page
    # We pass the redirect_uri to the web app so it knows where to send the user back
    auth_url = f"{GITSTACK_WEB_APP_URL}/sign-in?redirect_uri={redirect_uri}"

    try:
        webbrowser.open_new_tab(auth_url)
    except webbrowser.Error:
        click.echo(f"Could not open web browser. Please open this URL manually:")
        click.echo(auth_url)
    
    click.echo(f"Waiting for authentication to complete in your browser on {redirect_uri}...")

    # Start a local HTTP server in a separate thread to listen for the callback
    # We need a free port, so we try a few or let the system assign one.
    server = None
    try:
        server = HTTPServer(("localhost", CLI_AUTH_CALLBACK_PORT), CLIAuthHandler)
        server_thread = threading.Thread(target=server.serve_forever)
        server_thread.daemon = True # Allow main program to exit even if thread is running
        server_thread.start()

        # Wait for a short period, checking if auth data has been received
        timeout_seconds = 60
        start_time = datetime.now()
        
        global received_auth_data
        received_auth_data = {} # Clear any previous data

        while (datetime.now() - start_time).total_seconds() < timeout_seconds:
            if received_auth_data:
                break
            server_thread.join(1) # Wait 1 second, then check again
    
    finally:
        if server:
            server.shutdown()
            server.server_close()
        
    if received_auth_data:
        clerk_session_token = received_auth_data.get("clerk_session_token")
        clerk_user_id = received_auth_data.get("clerk_user_id")
        convex_user_id = received_auth_data.get("convex_user_id")

        if clerk_session_token and clerk_user_id and convex_user_id:
            save_session_data(clerk_session_token, convex_user_id, clerk_user_id)
            click.echo("Logged in successfully via browser!")
            # We don't have the email easily here, but the user is logged in.
            click.echo(f"Welcome, Clerk User ID: {clerk_user_id}!")
        else:
            click.echo("Failed to retrieve complete authentication data from browser callback.")
    else:
        click.echo("Authentication timed out or failed to receive callback from browser.")

@click.command()
def snap():
    """Captures current code, dependencies, and environment and saves to Convex."""
    ensure_snapshot_dir()
    user_id = get_authenticated_user_id()
    if not user_id:
        click.echo("You must be logged in to take a snapshot.")
        return

    files_to_snapshot = []
    for root, dirs, filenames in os.walk('.'):
        for f in filenames:
            if ".gitstack" not in root and ".git" not in root and "__pycache__" not in root and "venv" not in root:
                files_to_snapshot.append(os.path.join(root, f))
    
    result = call_convex_function("mutation", "snapshots:createSnapshot", {"userId": user_id, "files": files_to_snapshot})
    if result:
        click.echo(f"Snapshot taken and saved to Convex! Snapshot ID: {result['value']}")
    else:
        click.echo("Failed to take snapshot.")

@click.command()
def logout():
    """Logs out of the Gitstack."""
    click.echo("Logging out of Gitstack ...")
    clear_session_data()
    click.echo("Logged out successfully.")
    click.echo("See you soon!")

@click.command()
def signup():
    """
    Starts the CLI signup flow:
     - picks a free port
     - creates a cli_auth_token
     - starts a local HTTP server to wait for the browser callback
     - opens the browser to the web sign-up with redirect_uri & cli_auth_token
     - waits for callback OR polls Convex for completion
    """
    global expected_cli_token, received_auth_data

    click.echo("Starting Gitstack signup flow...")

    ensure_snapshot_dir()

    # 1) Choose port and build redirect URI
    port = pick_available_port(CLI_DEFAULT_PORT)
    redirect_uri = f"http://localhost:{port}{CLI_AUTH_CALLBACK_PATH}"

    # 2) generate pairing token
    cli_token = str(uuid.uuid4())
    expected_cli_token = cli_token

    # 3) register pending auth request with Convex (optional/defensive)
    # This requires a Convex mutation `cliAuth:createAuthRequest` to exist.
    try:
        _ = call_convex_function("mutation", "cliAuth:createAuthRequest", {
            "cliAuthToken": cli_token,
            "requestedAt": int(datetime.now(timezone.utc).timestamp() * 1000)
        })
    except Exception as e:
        # not fatal - we still continue, but polling may be unavailable
        click.echo("Warning: could not register CLI auth request in Convex (continuing local flow).")

    # 4) open browser to sign-up URL with redirect_uri and cli_auth_token
    auth_url = f"{GITSTACK_WEB_APP_URL}/sign-up?redirect_uri={redirect_uri}&cli_auth_token={cli_token}"
    click.echo(f"Opening browser for signup... (if it doesn't open, visit this URL manually)\n{auth_url}")
    try:
        webbrowser.open_new_tab(auth_url)
    except webbrowser.Error:
        click.echo("Failed to open browser automatically. Please open the URL above manually.")

    # 5) start local server in a background thread
    server = None
    received_auth_data = {}
    server_thread = None
    try:
        server = HTTPServer(("localhost", port), CLIAuthHandler)
        server_thread = threading.Thread(target=server.serve_forever, daemon=True)
        server_thread.start()
    except Exception as e:
        click.echo(f"Error: could not start local callback server on port {port}: {e}")
        return

    # 6) Wait loop: accept callback via local POST/GET OR poll Convex if enabled
    timeout_seconds = 120
    start_time = datetime.now()
    click.echo(f"Waiting for authentication to complete (timeout in {timeout_seconds}s)...")

    while (datetime.now() - start_time).total_seconds() < timeout_seconds:
        if received_auth_data:
            break

        # Poll Convex as a fallback if server-side registration exists
        if CONVEX_USE_POLLING:
            try:
                resp = call_convex_function("query", "cliAuth:getAuthRequestStatus", {"cliAuthToken": cli_token})
                # Expected response shape: {"value": {"status":"completed", "convexUserId": "...", "clerkUserId": "...", "clerkSessionToken":"..."}}
                if resp and resp.get("value") and resp["value"].get("status") == "completed":
                    val = resp["value"]
                    received_auth_data = {
                        "clerk_session_token": val.get("clerkSessionToken"),
                        "clerk_user_id": val.get("clerkUserId"),
                        "convex_user_id": val.get("convexUserId"),
                        "cli_auth_token": cli_token,
                    }
                    break
            except Exception:
                # ignore transient errors
                pass

        pytime.sleep(0.5)

    # 7) tear down server
    if server:
        try:
            server.shutdown()
            server.server_close()
        except Exception:
            pass

    # 8) handle result
    if not received_auth_data:
        click.echo("Signup timed out or failed to receive callback from browser.")
        return

    clerk_session_token = received_auth_data.get("clerk_session_token")
    clerk_user_id = received_auth_data.get("clerk_user_id")
    convex_user_id = received_auth_data.get("convex_user_id")

    if clerk_session_token and clerk_user_id and convex_user_id:
        save_session_data(clerk_session_token, convex_user_id, clerk_user_id)
        click.echo("Signed up and logged in successfully via browser!")
        click.echo(f"Welcome, Clerk User ID: {clerk_user_id}!")
    else:
        click.echo("Failed to retrieve complete authentication data from browser callback.")

@click.command()
def delete():
    """Deletes a snapshot."""
    user_id = get_authenticated_user_id()
    if not user_id:
        click.echo("You must be logged in to delete a snapshot.")
        return

    snapshots_data = call_convex_function("query", "snapshots:getSnapshots", {"userId": user_id})
    if not snapshots_data or not snapshots_data['value']:
        click.echo("No snapshots found to delete.")
        return
    
    click.echo("Available snapshots:")
    for i, snapshot in enumerate(snapshots_data['value']):
        dt_object = datetime.fromtimestamp(snapshot['timestamp'] / 1000, tz=timezone.utc)
        click.echo(f"  {i + 1}: ID: {snapshot['_id']}, Timestamp: {dt_object.isoformat()}")
    
    snapshot_num = click.prompt("Enter the number of the snapshot to delete", type=int)
    if 1 <= snapshot_num <= len(snapshots_data['value']):
        snapshot_to_delete = snapshots_data['value'][snapshot_num - 1]
        result = call_convex_function("mutation", "snapshots:deleteSnapshot", {"snapshotId": snapshot_to_delete['_id'], "userId": user_id})
        if result is not None:
            click.echo(f"Snapshot {snapshot_to_delete['_id']} deleted successfully.")
        else:
            click.echo("Failed to delete snapshot.")
    else:
        click.echo("Invalid snapshot number.")


@click.command()
def explain():
    """AI Summarizes what changed between snapshots."""
    click.echo("Summarizing what changed between snapshots... (Convex integration needed)")
    click.echo("What changed between snapshots?")

@click.command()
def diff():
    """Compares two snapshots."""
    click.echo("Comparing two snapshots... (Convex integration needed)")
    click.echo("What changed between snapshots?")

@click.command()
def push():
    """Pushes current snapshot metadata and file hashes to the Gitstack platform."""
    user_id = get_authenticated_user_id()
    if not user_id:
        click.echo("You must be logged in to push a snapshot.")
        return

    click.echo("Gathering files and calculating hashes...")
    files_to_snapshot = []
    file_hashes = []
    for root, dirs, filenames in os.walk('.'):
        # Exclude Gitstack's own metadata, .git, __pycache__, and venv
        dirs[:] = [d for d in dirs if ".gitstack" not in d and ".git" not in d and "__pycache__" not in d and "venv" not in d]
        for f in filenames:
            if ".gitstack" not in root and ".git" not in root and "__pycache__" not in root and "venv" not in root:
                filepath = os.path.join(root, f)
                files_to_snapshot.append(filepath)
                file_hashes.append({
                    "path": filepath,
                    "hash": calculate_file_hash(filepath)
                })
    
    timestamp = datetime.now(timezone.utc).timestamp() * 1000 # Convert to milliseconds for Convex
    
    click.echo("Pushing current snapshot metadata and file hashes to Gitstack Web...")
    result = call_convex_function("mutation", "snapshots:pushSnapshot", {
        "userId": user_id,
        "timestamp": timestamp,
        "files": files_to_snapshot,
        "fileHashes": file_hashes
    })

    if result:
        click.echo(f"Snapshot pushed successfully! Snapshot ID: {result['value']}")
    else:
        click.echo("Failed to push snapshot.")

@click.command()
def pull():
    """Pulls current snapshot from the Gitstack Web."""
    click.echo("Pulling current snapshot from the Gitstack Web... (Convex integration needed)")
    click.echo("Snapshot pulled successfully.")

@click.command()
def join():
    """Joins a snapshot to the Gitstack Web."""
    click.echo("Joining current snapshot to the Gitstack Web... (Convex integration needed)")
    click.echo("Snapshot joined successfully.")

@click.command()
def fix():
    """AI Suggests fixes if something breaks after restore."""
    click.echo("Suggesting fixes if something breaks after restore... (Convex integration needed)")
    click.echo("What fixes can be suggested?")


@click.command()
def restore():
    """Restore a snapshot."""
    user_id = get_authenticated_user_id()
    if not user_id:
        click.echo("You must be logged in to restore a snapshot.")
        return
    
    snapshots_data = call_convex_function("query", "snapshots:getSnapshots", {"userId": user_id})
    if not snapshots_data or not snapshots_data['value']:
        click.echo("No snapshots found to restore.")
        return
    
    click.echo("Available snapshots:")
    for i, snapshot in enumerate(snapshots_data['value']):
        dt_object = datetime.fromtimestamp(snapshot['timestamp'] / 1000, tz=timezone.utc)
        click.echo(f"  {i + 1}: ID: {snapshot['_id']}, Timestamp: {dt_object.isoformat()}")
    
    snapshot_num = click.prompt("Enter the number of the snapshot to restore", type=int)
    if 1 <= snapshot_num <= len(snapshots_data['value']):
        snapshot_to_restore = snapshots_data['value'][snapshot_num - 1]
        
        click.echo(f"Restoring snapshot from (ID: {snapshot_to_restore['_id']}) from: {datetime.fromtimestamp(snapshot_to_restore['timestamp'] / 1000, tz=timezone.utc).isoformat()}")
        click.echo("Files included:")
        for f in snapshot_to_restore["files"]:
            click.echo(f)
        # TODO: Implement actual file restoration (e.g., download files, overwrite local)
    else:
        click.echo("Invalid snapshot number.")

@click.command()
def deploy(): 
    """Deploys code to the cloud"""
    click.echo('Deployment initiated (Convex integration needed)')

@click.command()
def list():
    """Lists all saved snapshots."""
    user_id = get_authenticated_user_id()
    if not user_id:
        click.echo("You must be logged in to list snapshots.")
        return

    snapshots_data = call_convex_function("query", "snapshots:getSnapshots", {"userId": user_id})
    if not snapshots_data or not snapshots_data['value']:
        click.echo("No snapshots found.")
        return

    click.echo("Saved snapshots:")
    for i, snapshot in enumerate(snapshots_data['value']):
        dt_object = datetime.fromtimestamp(snapshot['timestamp'] / 1000, tz=timezone.utc)
        click.echo(f"  {i + 1}: ID: {snapshot['_id']}, Timestamp: {dt_object.isoformat()}")

main.add_command(snap)
main.add_command(restore)
main.add_command(date)
main.add_command(time)
main.add_command(make)
main.add_command(deploy)
main.add_command(list)
main.add_command(diff)
main.add_command(explain)
main.add_command(push)
main.add_command(pull)
main.add_command(join)
main.add_command(fix)
main.add_command(delete)
main.add_command(logout)
main.add_command(signup)
main.add_command(login)

if __name__ == "__main__":
    main()