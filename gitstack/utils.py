# gitstack/utils.py
import os
import json
import hashlib
import socket
import requests
import click # For click.echo
from datetime import datetime, timezone

# Import constants from config.py
from .config import (
    CLI_DEFAULT_PORT,
    CONVEX_SITE_URL,
    CLERK_SECRET_KEY,
    SNAPSHOT_DIR,
    CONVEX_USE_POLLING
)

# --- Session Management ---
SESSION_FILE = os.path.join(SNAPSHOT_DIR, "session.json") # Define SESSION_FILE here

def get_session_data():
    """Retrieves the full session data from the session file."""
    if os.path.exists(SESSION_FILE):
        try:
            with open(SESSION_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {"clerk_session_token": None, "convex_user_id": None, "clerk_user_id": None}
    return {"clerk_session_token": None, "convex_user_id": None, "clerk_user_id": None}

def save_session_data(clerk_session_token, convex_user_id, clerk_user_id):
    """Saves the session data to the session file."""
    # Ensure the snapshot directory exists before saving the session file
    ensure_snapshot_dir()
    with open(SESSION_FILE, "w") as f:
        json.dump({
            "clerk_session_token": clerk_session_token,
            "convex_user_id": convex_user_id,
            "clerk_user_id": clerk_user_id
        }, f, indent=2)

def clear_session_data():
    """Clears the session data by deleting the session file."""
    if os.path.exists(SESSION_FILE):
        os.remove(SESSION_FILE)

def get_authenticated_user_id():
    """Retrieves the authenticated Convex user ID from session data."""
    session = get_session_data()
    return session.get("convex_user_id")

# --- End Session Management ---


def ensure_snapshot_dir():
    """Make sure the .gitstack/ folder exists."""
    if not os.path.exists(SNAPSHOT_DIR):
        os.makedirs(SNAPSHOT_DIR)

def calculate_file_hash(filepath):
    """Calculates the SHA256 hash of a given file."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()

def pick_available_port(preferred_port=CLI_DEFAULT_PORT):
    """Picks an available port for the local server."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("localhost", preferred_port))
        s.listen(1)
        port = s.getsockname()[1]
        s.close()
        return port
    except OSError:
        s.close()
        s2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s2.bind(("localhost", 0))
        port = s2.getsockname()[1]
        s2.close()
        return port

def call_convex_function(function_type, function_name, args=None, include_auth_header=True):
    """
    Helper to call Convex functions.
    """
    if args is None:
        args = {}
    
    headers = {"Content-Type": "application/json"}
    if include_auth_header:
        headers["Authorization"] = f"Bearer {CLERK_SECRET_KEY}"
    
    endpoint = "mutation" if function_type == "mutation" else "query"
    payload = {"function": function_name, "args": args}
    
    try:
        response = requests.post(f"{CONVEX_SITE_URL}/api/{endpoint}", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        click.echo(f"Error calling Convex function {function_name}: {e}")
        return None

def respond(success, message, data=None):
    """
    Standardizes CLI command responses to always output JSON.
    """
    response = {
        "success": success,
        "message": message,
        "data": data or {}
    }
    click.echo(json.dumps(response, indent=2))