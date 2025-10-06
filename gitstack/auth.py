# gitstack/auth.py
import click
import os
import json
import webbrowser
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import threading
from datetime import datetime
import time as pytime
import uuid # NEW: Import uuid for generating cliAuthToken

# Import updated constants from config.py
from .config import (
    CLI_AUTH_CALLBACK_PATH,
    CLI_AUTH_CALLBACK_PORT,
    GITSTACK_WEB_APP_URL, # Renamed from GITSTACK_WEB_URL
    # API_BASE_URL is used in utils.py, not directly here.
)

# Import backend API caller and session handlers from utils.py
from .utils import save_session_data, get_session_data, clear_session_data, call_backend_api, respond

# -------------------------
# Config
# -------------------------
# CLI_AUTH_CALLBACK_PATH = "/cli-auth-success" # Already in config.py
# CLI_AUTH_CALLBACK_PORT = 8000 # Already in config.py
SESSION_FILE = os.path.expanduser("~/.gitstack/session.json")
SERVICE_NAME = "gitstack"
# GITSTACK_WEB_URL = "https://gitstack.xyz" # Moved to config.py

# Try to import keyring (secure storage), auto-install if missing
try:
    import keyring
except ImportError:
    try:
        # CORRECTED LINE: Removed the extra ']'
        subprocess.check_call([os.sys.executable, "-m", "pip", "install", "keyring"])
        import keyring
    except Exception:
        keyring = None

# This global will now be populated by the frontend's POST to the local server
# It's primarily used for the `CLISAuthHandler` to receive data.
# The polling mechanism will be the primary way the CLI gets auth data.
received_auth_data = {}


# -------------------------
# Session Handling (from utils, now imported directly)
# -------------------------
# save_session_data, get_session_data, clear_session_data are now imported from utils.py


# -------------------------
# Callback Server
# ------------------------
class CLIAuthHandler(BaseHTTPRequestHandler):
    """Handles the callback from the web app — now supports POST requests."""

    def do_POST(self):
        global received_auth_data # Keep this for direct browser callback
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data)
            clerk_session_token = data.get("clerk_session_token")
            clerk_user_id = data.get("clerk_user_id")
            # Note: The frontend sends pgUserId as "convex_user_id" for compatibility
            pg_user_id = data.get("convex_user_id")

            if clerk_session_token and clerk_user_id and pg_user_id:
                received_auth_data = {
                    "clerk_session_token": clerk_session_token,
                    "clerk_user_id": clerk_user_id,
                    "convex_user_id": pg_user_id, # Storing pg_user_id under this key
                }
                self.send_response(200)
                self.end_headers()
                self.wfile.write(
                    b"<html><body><h1>Authentication successful!</h1><p>You may close this tab and return to your terminal.</p></body></html>"
                )
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Missing required fields in POST data.")
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Server error parsing POST data: {e}".encode())

    def do_GET(self):
        """Handles initial GET request from browser."""
        # This means the browser has landed on our callback URL.
        # We should show a message indicating that the process is ongoing.
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        html_response = """
            <html>
            <head><title>Gitstack CLI Authentication</title></head>
            <body>
                <h1>Processing CLI Authentication...</h1>
                <p>Please wait while your authentication is being finalized.</p>
                <p>If this message persists, check your terminal for further instructions or errors.</p>
            </body>
            </html>
        """
        self.wfile.write(html_response.encode())


# -------------------------
# Auth Helpers
# -------------------------
def poll_for_auth_status(cli_auth_token, timeout=120):
    """Polls the backend API for the authentication request status."""
    start_time = datetime.now()
    click.echo(f"Waiting for web authentication to complete (timeout: {timeout}s)...")

    while (datetime.now() - start_time).total_seconds() < timeout:
        status_response = call_backend_api("GET", "/cli-auth/status", params={"cliAuthToken": cli_auth_token})
        
        if status_response and status_response.get("status") == "completed":
            click.echo("Web authentication completed!")
            return {
                "clerk_session_token": status_response.get("clerk_session_token"),
                "clerk_user_id": status_response.get("clerk_user_id"),
                "convex_user_id": status_response.get("pg_user_id"), # Backend returns pg_user_id
            }
        elif status_response and status_response.get("status") == "failed":
            click.echo("Web authentication failed on backend.")
            return None
        elif status_response and status_response.get("status") == "not_found":
            # This can happen if the request expires or is deleted on the backend
            click.echo("Authentication request not found on backend. It may have expired.")
            return None
        
        pytime.sleep(1) # Poll every 1 second
    
    click.echo("Authentication timed out.")
    return None

def start_callback_server():
    """Start a temporary HTTP server to receive the callback."""
    server = HTTPServer(("localhost", CLI_AUTH_CALLBACK_PORT), CLIAuthHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


# -------------------------
# CLI Commands
# -------------------------
@click.command()
def signup():
    """Sign up for Gitstack from the terminal."""
    global received_auth_data
    received_auth_data = {} # Clear any previous data

    # 1. Generate a unique CLI auth token
    cli_auth_token = str(uuid.uuid4())
    current_timestamp_ms = int(datetime.now().timestamp() * 1000)

    # 2. Create a pending auth request on the backend
    create_request_data = {
        "cliAuthToken": cli_auth_token,
        "createdAt": current_timestamp_ms,
    }
    backend_response = call_backend_api("POST", "/cli-auth/request", data=create_request_data)
    
    if not backend_response or not backend_response.get("id"):
        respond(False, "Failed to initiate CLI authentication with backend. Please try again.")
        return

    redirect_uri = f"http://localhost:{CLI_AUTH_CALLBACK_PORT}{CLI_AUTH_CALLBACK_PATH}"
    auth_url = f"{GITSTACK_WEB_APP_URL}/register?redirect_uri={redirect_uri}&cli_auth_token={cli_auth_token}"

    click.echo("Opening browser for signup...")
    webbrowser.open_new_tab(auth_url)

    # Start local callback server (still needed for frontend to POST to)
    server = start_callback_server()
    try:
        # 3. Poll the backend for auth status
        auth_result = poll_for_auth_status(cli_auth_token, timeout=180) # Increased timeout for signup
    finally:
        server.shutdown()
        server.server_close()

    if auth_result:
        save_session_data(
            auth_result["clerk_session_token"],
            auth_result["convex_user_id"], # This is pg_user_id
            auth_result["clerk_user_id"],
        )
        respond(True, "Signed up and authenticated successfully!")
    else:
        respond(False, "Signup failed or timed out. Please try again.")


@click.command()
def login():
    """Log into your Gitstack account via browser."""
    global received_auth_data
    received_auth_data = {} # Clear any previous data

    # 1. Generate a unique CLI auth token
    cli_auth_token = str(uuid.uuid4())
    current_timestamp_ms = int(datetime.now().timestamp() * 1000)

    # 2. Create a pending auth request on the backend
    create_request_data = {
        "cliAuthToken": cli_auth_token,
        "createdAt": current_timestamp_ms,
    }
    backend_response = call_backend_api("POST", "/cli-auth/request", data=create_request_data)
    
    if not backend_response or not backend_response.get("id"):
        respond(False, "Failed to initiate CLI authentication with backend. Please try again.")
        return

    redirect_uri = f"http://localhost:{CLI_AUTH_CALLBACK_PORT}{CLI_AUTH_CALLBACK_PATH}"
    auth_url = f"{GITSTACK_WEB_APP_URL}/login?redirect_uri={redirect_uri}&cli_auth_token={cli_auth_token}"

    click.echo("🌐 Opening browser for login...")
    webbrowser.open_new_tab(auth_url)

    # Start local callback server
    server = start_callback_server()
    try:
        # 3. Poll the backend for auth status
        auth_result = poll_for_auth_status(cli_auth_token, timeout=120)
    finally:
        server.shutdown()
        server.server_close()

    if auth_result:
        save_session_data(
            auth_result["clerk_session_token"],
            auth_result["convex_user_id"], # This is pg_user_id
            auth_result["clerk_user_id"],
        )
        respond(True, "Logged in successfully!")
    else:
        respond(False, "Login failed or timed out.")


@click.command()
def logout():
    """Log out and clear all saved session data."""
    clear_session_data()
    respond(True, "Logged out successfully.") # Use respond for consistency


@click.command()
def whoami():
    """Check which user is currently authenticated."""
    session = get_session_data()
    if session.get("clerk_user_id"): # Check for clerk_user_id to confirm active session
        respond(True, "Authenticated session found:", {
            "clerk_user_id": session["clerk_user_id"],
            "pg_user_id": session["convex_user_id"] # Presenting as pg_user_id
        })
    else:
        respond(False, "No active session. Try `gitstack login`.", {"status": "not_authenticated"})


# REMOVED: The @click.group() def cli(): ... and cli.add_command(...) lines
# These commands will now be added directly to the main CLI group in main.py
if __name__ == "__main__":
    # If auth.py is run directly, provide a helpful message or default to main's cli
    # This block might not be strictly necessary if auth.py is only imported by main.py
    # but it can prevent errors if someone tries to run 'python -m gitstack.auth'
    click.echo("This module is intended to be imported by gitstack.main for command registration.")
    click.echo("Please run 'gitstack --help' for available commands.")