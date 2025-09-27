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
import uuid
import time as pytime

# Import constants from config.py
from .config import (
    CLI_DEFAULT_PORT,
    CONVEX_SITE_URL,
    CLERK_SECRET_KEY,
    GITSTACK_WEB_APP_URL
)

# CLI Authentication Configuration specific to auth.py
CLI_AUTH_CALLBACK_PATH = "/auth-success"
CLI_AUTH_CALLBACK_PORT = 8000 # Port for the local CLI server to listen on
CLERK_API_URL = os.getenv("CLERK_API_URL", "https://api.clerk.com/v1/")

# Local storage for Clerk session token and Convex userId
SNAPSHOT_DIR = ".gitstack" # Ensure this is defined for SESSION_FILE
SESSION_FILE = os.path.join(SNAPSHOT_DIR, "session.json")

# Global variables used by the authentication flow
received_auth_data = {}
expected_cli_token = None


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

def call_convex_function(function_type, function_name, args=None):
    """
    Helper to call Convex functions.
    (This function is currently in main.py, but auth functions need it.
    We will move this to utils.py later, but for now, keep a copy here
    until main.py is fully refactored.)
    """
    if args is None:
        args = {}
    
    headers = {"Content-Type": "application/json"}
    endpoint = "mutation" if function_type == "mutation" else "query"
    payload = {"function": function_name, "args": args}
    
    try:
        response = requests.post(f"{CONVEX_SITE_URL}/api/{endpoint}", json=payload, headers=headers)
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

@click.command()
def login():
    """Logs in to Gitstack via browser."""
    click.echo("Initializing Browser to log into Gitstack...")

    # We now import CLI_AUTH_CALLBACK_PORT and CLI_AUTH_CALLBACK_PATH directly
    redirect_uri = f"http://localhost:{CLI_AUTH_CALLBACK_PORT}{CLI_AUTH_CALLBACK_PATH}"

    # Construct the URL for the web app's login page
    auth_url = f"{GITSTACK_WEB_APP_URL}/login?redirect_uri={redirect_uri}"

    try:
        webbrowser.open_new_tab(auth_url)
    except webbrowser.Error:
        click.echo(f"Could not open web browser. Please open this URL manually:")
        click.echo(auth_url)
    
    click.echo(f"Waiting for authentication to complete in your browser on {redirect_uri}...")

    server = None
    try:
        server = HTTPServer(("localhost", CLI_AUTH_CALLBACK_PORT), CLIAuthHandler)
        server_thread = threading.Thread(target=server.serve_forever)
        server_thread.daemon = True
        server_thread.start()

        timeout_seconds = 60
        start_time = datetime.now()
        
        global received_auth_data
        received_auth_data = {} # Clear any previous data

        while (datetime.now() - start_time).total_seconds() < timeout_seconds:
            if received_auth_data:
                break
            server_thread.join(1)
    
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
            click.echo(f"Welcome, Clerk User ID: {clerk_user_id}!")
        else:
            click.echo("Failed to retrieve complete authentication data from browser callback.")
    else:
        click.echo("Authentication timed out or failed to receive callback from browser.")

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

    # We assume ensure_snapshot_dir exists and is accessible.
    # For now, we'll keep it here, but it will be moved to utils.py later.
    if not os.path.exists(SNAPSHOT_DIR):
        os.makedirs(SNAPSHOT_DIR)

    # 1) Choose port and build redirect URI
    port = pick_available_port(CLI_DEFAULT_PORT)
    redirect_uri = f"http://localhost:{port}{CLI_AUTH_CALLBACK_PATH}"

    # 2) generate pairing token
    cli_token = str(uuid.uuid4())
    expected_cli_token = cli_token

    # 3) register pending auth request with Convex (optional/defensive)
    try:
        _ = call_convex_function("mutation", "cliAuth:createAuthRequest", {
            "cliAuthToken": cli_token,
            "requestedAt": int(datetime.now(timezone.utc).timestamp() * 1000)
        })
    except Exception as e:
        click.echo("Warning: could not register CLI auth request in Convex (continuing local flow).")

    # 4) open browser to register URL with redirect_uri and cli_auth_token
    auth_url = f"{GITSTACK_WEB_APP_URL}/register?redirect_uri={redirect_uri}&cli_auth_token={cli_token}"
    click.echo(f"Opening browser for registration... (if it doesn't open, visit this URL manually)\n{auth_url}")
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

    # CONVEX_USE_POLLING is still in main.py, we'll address this later when moving to config.py
    # For now, we will assume it's true or handle its absence.
    # It should ideally be imported from config.py
    CONVEX_USE_POLLING = True # TEMPORARY: this needs to come from config.py eventually

    while (datetime.now() - start_time).total_seconds() < timeout_seconds:
        if received_auth_data:
            break

        if CONVEX_USE_POLLING:
            try:
                resp = call_convex_function("query", "cliAuth:getAuthRequestStatus", {"cliAuthToken": cli_token})
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
