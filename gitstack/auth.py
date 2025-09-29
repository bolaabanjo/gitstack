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

# Config
CLI_AUTH_CALLBACK_PATH = "/auth-success"
CLI_AUTH_CALLBACK_PORT = 8000
SESSION_FILE = os.path.expanduser("~/.gitstack/session.json")
SERVICE_NAME = "gitstack"

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
def save_session_data(clerk_session_token, convex_user_id, clerk_user_id):
    """Save session to keyring (preferred) or JSON fallback."""
    try:
        if keyring:
            keyring.set_password(SERVICE_NAME, "clerk_session_token", clerk_session_token)
            keyring.set_password(SERVICE_NAME, "convex_user_id", convex_user_id)
            keyring.set_password(SERVICE_NAME, "clerk_user_id", clerk_user_id)
            return
    except Exception:
        pass

    # fallback JSON
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
    """Retrieve session from keyring or JSON fallback."""
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
    """Clear session from both keyring and JSON fallback."""
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
# Local Callback Handler
# -------------------------
class CLIAuthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global received_auth_data
        if not self.path.startswith(CLI_AUTH_CALLBACK_PATH):
            self.send_response(404)
            self.end_headers()
            return

        qs = parse_qs(urlparse(self.path).query)
        clerk_session_token = qs.get("clerk_session_token", [None])[0]
        clerk_user_id = qs.get("clerk_user_id", [None])[0]
        convex_user_id = qs.get("convex_user_id", [None])[0]

        if clerk_session_token and clerk_user_id and convex_user_id:
            received_auth_data = {
                "clerk_session_token": clerk_session_token,
                "clerk_user_id": clerk_user_id,
                "convex_user_id": convex_user_id,
            }
            self.send_response(200)
            self.end_headers()
            self.wfile.write(
                b"<html><body><h1>Authentication successful! You can close this tab.</h1></body></html>"
            )
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Authentication failed.</h1></body></html>")


# -------------------------
# CLI Commands
# -------------------------
@click.command()
def signup():
    """Sign up for Gitstack via browser."""
    global received_auth_data
    received_auth_data = {}

    redirect_uri = f"http://localhost:{CLI_AUTH_CALLBACK_PORT}{CLI_AUTH_CALLBACK_PATH}"
    auth_url = f"https://gitstack.xyz/register?redirect_uri={redirect_uri}"

    click.echo("Opening browser for signup...")
    webbrowser.open_new_tab(auth_url)

    server = HTTPServer(("localhost", CLI_AUTH_CALLBACK_PORT), CLIAuthHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    timeout = 120
    start = datetime.now()
    click.echo(f"Waiting for signup to complete (timeout in {timeout}s)...")

    while (datetime.now() - start).total_seconds() < timeout:
        if received_auth_data:
            break
        pytime.sleep(0.5)

    server.shutdown()
    server.server_close()

    if received_auth_data:
        save_session_data(
            received_auth_data["clerk_session_token"],
            received_auth_data["convex_user_id"],
            received_auth_data["clerk_user_id"],
        )
        click.echo("Signed up & logged in successfully!")
    else:
        click.echo("Signup failed or timed out.")


@click.command()
def login():
    """Login to Gitstack via browser."""
    global received_auth_data
    received_auth_data = {}

    redirect_uri = f"http://localhost:{CLI_AUTH_CALLBACK_PORT}{CLI_AUTH_CALLBACK_PATH}"
    auth_url = f"https://gitstack.xyz/login?redirect_uri={redirect_uri}"

    click.echo("Opening browser for login...")
    webbrowser.open_new_tab(auth_url)

    server = HTTPServer(("localhost", CLI_AUTH_CALLBACK_PORT), CLIAuthHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    timeout = 60
    start = datetime.now()
    click.echo(f"Waiting for login to complete (timeout in {timeout}s)...")

    while (datetime.now() - start).total_seconds() < timeout:
        if received_auth_data:
            break
        pytime.sleep(0.5)

    server.shutdown()
    server.server_close()

    if received_auth_data:
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
    """Logout from Gitstack."""
    clear_session_data()
    click.echo("Logged out successfully.")
