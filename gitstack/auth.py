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

# -------------------------
# Config
# -------------------------
CLI_AUTH_CALLBACK_PATH = "/cli-auth-success"
CLI_AUTH_CALLBACK_PORT = 8000
SESSION_FILE = os.path.expanduser("~/.gitstack/session.json")
SERVICE_NAME = "gitstack"
GITSTACK_WEB_URL = "https://gitstack.xyz"  # Change if you deploy elsewhere

# Try to import keyring (secure storage), auto-install if missing
try:
    import keyring
except ImportError:
    try:
        subprocess.check_call([os.sys.executable, "-m", "pip", "install", "keyring"])
        import keyring
    except Exception:
        keyring = None

received_auth_data = {}


# -------------------------
# Session Handling
# -------------------------
def save_session_data(clerk_session_token: str, convex_user_id: str, clerk_user_id: str):
    """Save session securely using keyring or fallback to JSON."""
    try:
        if keyring:
            keyring.set_password(SERVICE_NAME, "clerk_session_token", clerk_session_token)
            keyring.set_password(SERVICE_NAME, "convex_user_id", convex_user_id)
            keyring.set_password(SERVICE_NAME, "clerk_user_id", clerk_user_id)
            return
    except Exception:
        pass

    os.makedirs(os.path.dirname(SESSION_FILE), exist_ok=True)
    with open(SESSION_FILE, "w") as f:
        json.dump(
            {
                "clerk_session_token": clerk_session_token,
                "convex_user_id": convex_user_id,
                "clerk_user_id": clerk_user_id,
            },
            f,
        )


def get_session_data():
    """Retrieve session credentials."""
    try:
        if keyring:
            clerk_session_token = keyring.get_password(SERVICE_NAME, "clerk_session_token")
            convex_user_id = keyring.get_password(SERVICE_NAME, "convex_user_id")
            clerk_user_id = keyring.get_password(SERVICE_NAME, "clerk_user_id")
            if clerk_session_token and convex_user_id and clerk_user_id:
                return {
                    "clerk_session_token": clerk_session_token,
                    "convex_user_id": convex_user_id,
                    "clerk_user_id": clerk_user_id,
                }
    except Exception:
        pass

    if os.path.exists(SESSION_FILE):
        with open(SESSION_FILE, "r") as f:
            return json.load(f)
    return {}


def clear_session_data():
    """Log out and clear all session data."""
    try:
        if keyring:
            keyring.delete_password(SERVICE_NAME, "clerk_session_token")
            keyring.delete_password(SERVICE_NAME, "convex_user_id")
            keyring.delete_password(SERVICE_NAME, "clerk_user_id")
    except Exception:
        pass

    if os.path.exists(SESSION_FILE):
        os.remove(SESSION_FILE)


# -------------------------
# Callback Server
# -------------------------
class CLIAuthHandler(BaseHTTPRequestHandler):
    """Handles the callback from the web app — now supports POST requests."""

    def do_POST(self):
        global received_auth_data
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data)
            clerk_session_token = data.get("clerk_session_token")
            clerk_user_id = data.get("clerk_user_id")
            convex_user_id = data.get("convex_user_id")

            if clerk_session_token and clerk_user_id and convex_user_id:
                received_auth_data = {
                    "clerk_session_token": clerk_session_token,
                    "clerk_user_id": clerk_user_id,
                    "convex_user_id": convex_user_id,
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
        """Optional: allow GET fallback for testing/debugging."""
        self.send_response(405)
        self.end_headers()
        self.wfile.write(b" Use POST for CLI auth callback.")


# -------------------------
# Auth Helpers
# -------------------------
def wait_for_auth(timeout=120):
    """Wait for the browser to complete authentication."""
    start_time = datetime.now()
    click.echo(f"⌛ Waiting for authentication to complete (timeout: {timeout}s)...")

    while (datetime.now() - start_time).total_seconds() < timeout:
        if received_auth_data:
            return True
        pytime.sleep(0.5)
    return False


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
    received_auth_data = {}

    redirect_uri = f"http://localhost:{CLI_AUTH_CALLBACK_PORT}{CLI_AUTH_CALLBACK_PATH}"
    auth_url = f"{GITSTACK_WEB_URL}/register?redirect_uri={redirect_uri}"

    click.echo("🌐 Opening browser for signup...")
    webbrowser.open_new_tab(auth_url)

    server = start_callback_server()
    success = wait_for_auth(timeout=180)
    server.shutdown()
    server.server_close()

    if success:
        save_session_data(
            received_auth_data["clerk_session_token"],
            received_auth_data["convex_user_id"],
            received_auth_data["clerk_user_id"],
        )
        click.echo("Signed up and authenticated successfully!")
    else:
        click.echo("Signup failed or timed out. Please try again.")


@click.command()
def login():
    """Log into your Gitstack account via browser."""
    global received_auth_data
    received_auth_data = {}

    redirect_uri = f"http://localhost:{CLI_AUTH_CALLBACK_PORT}{CLI_AUTH_CALLBACK_PATH}"
    auth_url = f"{GITSTACK_WEB_URL}/login?redirect_uri={redirect_uri}"

    click.echo("🌐 Opening browser for login...")
    webbrowser.open_new_tab(auth_url)

    server = start_callback_server()
    success = wait_for_auth(timeout=120)
    server.shutdown()
    server.server_close()

    if success:
        save_session_data(
            received_auth_data["clerk_session_token"],
            received_auth_data["convex_user_id"],
            received_auth_data["clerk_user_id"],
        )
        click.echo("Logged in successfully!")
    else:
        click.echo("Login failed or timed out.")


@click.command()
def logout():
    """Log out and clear all saved session data."""
    clear_session_data()
    click.echo("👋 Logged out successfully.")


@click.command()
def whoami():
    """Check which user is currently authenticated."""
    session = get_session_data()
    if session:
        click.echo("   Authenticated session found:")
        click.echo(f"  Clerk User ID: {session['clerk_user_id']}")
        click.echo(f"  Convex User ID: {session['convex_user_id']}")
    else:
        click.echo("No active session. Try `gitstack login`.")


# -------------------------
# CLI Entrypoint
# -------------------------
@click.group()
def cli():
    """Gitstack Authentication CLI."""
    pass





cli.add_command(whoami)

if __name__ == "__main__":
    cli()
