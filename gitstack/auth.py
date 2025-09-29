# gitstack/auth.py
import click
import os
import json
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import threading
import uuid
import requests
from datetime import datetime, timezone
import time as pytime

# Import constants from config.py
from .config import (
    CLI_DEFAULT_PORT,
    CLERK_SECRET_KEY,
    GITSTACK_WEB_APP_URL,
    CONVEX_USE_POLLING
)

# Import ALL necessary utility functions from utils.py
from .utils import (
    get_session_data,
    save_session_data,
    clear_session_data,
    pick_available_port,
    call_convex_function,
    ensure_snapshot_dir,
    respond
)

# CLI Authentication Configuration specific to auth.py
CLI_AUTH_CALLBACK_PATH = "/auth-success"
CLI_AUTH_CALLBACK_PORT = 8000
CLERK_API_URL = os.getenv("CLERK_API_URL", "https://api.clerk.com/v1/")

received_auth_data = {}
expected_cli_token = None

def call_clerk_api(endpoint, method="GET", json_data=None, include_token=False):
    """
    Helper to call Clerk API. This remains in auth.py as it's specific to Clerk interaction
    and directly uses session data functions.
    """
    headers = {"Content-Type": "application/json"}
    if include_token:
        session = get_session_data() # Use the centralized utility from utils.py
        session_token = session.get("clerk_session_token")

        if not session_token:
            respond(False, "Error: Not logged in. Please log in first.")
            return None
        headers["Authorization"] = f"Bearer {session_token}"
    else:
        # For requests that don't need a user session token but need secret key
        headers["Authorization"] = f"Bearer {CLERK_SECRET_KEY}"

    url = f"{CLERK_API_URL}{endpoint}"
    
    try:
        if method == "POST":
            response = requests.post(url, headers=headers, json=json_data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=json_data)
        else:
            response = requests.get(url, headers=headers)
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        respond(False, f"Clerk API error ({e.response.status_code}) for {endpoint}: {e.response.text}")
        return None
    except requests.exceptions.RequestException as e:
        respond(False, f"Error calling Clerk API {endpoint}: {e}")
        return None


class CLIAuthHandler(BaseHTTPRequestHandler):
    """
    HTTP Handler for the local CLI authentication callback server.
    This class remains in auth.py as it's directly tied to the authentication flow.
    """
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

        qs = parse_qs(urlparse(self.path).query)
        cli_token_qs = qs.get("cli_auth_token", [None])[0]
        cli_token = payload.get("cli_auth_token") or cli_token_qs or expected_cli_token

        clerk_session_token = payload.get("clerk_session_token")
        clerk_user_id = payload.get("clerk_user_id")
        convex_user_id = payload.get("convex_user_id")

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


@click.command()
def login():
    """Logs in to Gitstack via browser."""
    respond(True, "Initializing Browser to log into Gitstack...")

    redirect_uri = f"http://localhost:{CLI_AUTH_CALLBACK_PORT}{CLI_AUTH_CALLBACK_PATH}"
    auth_url = f"{GITSTACK_WEB_APP_URL}/login?redirect_uri={redirect_uri}"

    try:
        webbrowser.open_new_tab(auth_url)
    except webbrowser.Error:
        respond(False, "Could not open web browser. Please open this URL manually:", {"url": auth_url})
    
    respond(True, f"Waiting for authentication to complete in your browser on {redirect_uri}...")

    server = None
    try:
        server = HTTPServer(("localhost", CLI_AUTH_CALLBACK_PORT), CLIAuthHandler)
        server_thread = threading.Thread(target=server.serve_forever)
        server_thread.daemon = True
        server_thread.start()

        timeout_seconds = 60
        start_time = datetime.now()
        
        global received_auth_data
        received_auth_data = {}

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
            respond(True, "Logged in successfully via browser!", {"clerk_user_id": clerk_user_id, "convex_user_id": convex_user_id})
        else:
            respond(False, "Failed to retrieve complete authentication data from browser callback.")
    else:
        respond(False, "Authentication timed out or failed to receive callback from browser.")

@click.command()
def logout():
    """Logs out of the Gitstack."""
    respond(True, "Logging out of Gitstack ...")
    clear_session_data()
    respond(True, "Logged out successfully. See you soon!")

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

    respond(True, "Starting Gitstack signup flow...")

    ensure_snapshot_dir() # Now from utils.py

    port = pick_available_port(CLI_DEFAULT_PORT)
    redirect_uri = f"http://localhost:{port}{CLI_AUTH_CALLBACK_PATH}"

    cli_token = str(uuid.uuid4())
    expected_cli_token = cli_token

    try:
        _ = call_convex_function("mutation", "cliAuth:createAuthRequest", {
            "cliAuthToken": cli_token,
            "requestedAt": int(datetime.now(timezone.utc).timestamp() * 1000)
        })
    except Exception as e:
        respond(False, "Warning: could not register CLI auth request in Convex (continuing local flow).", {"error": str(e)})

    auth_url = f"{GITSTACK_WEB_APP_URL}/register?redirect_uri={redirect_uri}&cli_auth_token={cli_token}"
    respond(True, f"Opening browser for registration... (if it doesn't open, visit this URL manually)", {"url": auth_url})
    try:
        webbrowser.open_new_tab(auth_url)
    except webbrowser.Error:
        respond(False, "Failed to open browser automatically. Please open the URL above manually.", {"url": auth_url})

    server = None
    received_auth_data = {}
    server_thread = None
    try:
        server = HTTPServer(("localhost", port), CLIAuthHandler)
        server_thread = threading.Thread(target=server.serve_forever, daemon=True)
        server_thread.start()
    except Exception as e:
        respond(False, f"Error: could not start local callback server on port {port}: {e}", {"port": port, "error": str(e)})
        return

    timeout_seconds = 120
    start_time = datetime.now()
    respond(True, f"Waiting for authentication to complete (timeout in {timeout_seconds}s)...")

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

    if server:
        try:
            server.shutdown()
            server.server_close()
        except Exception:
            pass

    if not received_auth_data:
        respond(False, "Signup timed out or failed to receive callback from browser.")
        return

    clerk_session_token = received_auth_data.get("clerk_session_token")
    clerk_user_id = received_auth_data.get("clerk_user_id")
    convex_user_id = received_auth_data.get("convex_user_id")

    if clerk_session_token and clerk_user_id and convex_user_id:
        save_session_data(clerk_session_token, convex_user_id, clerk_user_id)
        respond(True, "Signed up and logged in successfully via browser!", {"clerk_user_id": clerk_user_id, "convex_user_id": convex_user_id})
    else:
        respond(False, "Failed to retrieve complete authentication data from browser callback.")
