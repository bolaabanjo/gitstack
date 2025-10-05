# gitstack/utils.py
import os
import json
import hashlib
import socket
import requests
import click # For click.echo
from datetime import datetime, timezone
import uuid # For generating CLI auth token

# Import constants from config.py
from .config import (
    CLI_DEFAULT_PORT,
    SNAPSHOT_DIR,
    API_BASE_URL, # NEW: Import API_BASE_URL
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

def save_session_data(clerk_session_token, pg_user_id, clerk_user_id):
    """Saves the session data to the session file.
    Note: pg_user_id is stored under 'convex_user_id' key for CLI compatibility."""
    # Ensure the snapshot directory exists before saving the session file
    ensure_snapshot_dir()
    with open(SESSION_FILE, "w") as f:
        json.dump({
            "clerk_session_token": clerk_session_token,
            "convex_user_id": pg_user_id, # Storing pg_user_id here for now
            "clerk_user_id": clerk_user_id
        }, f, indent=2)

def clear_session_data():
    """Clears the session data by deleting the session file."""
    if os.path.exists(SESSION_FILE):
        os.remove(SESSION_FILE)

def get_authenticated_user_id():
    """Retrieves the authenticated PostgreSQL user ID from session data."""
    session = get_session_data()
    return session.get("convex_user_id") # Still fetching from 'convex_user_id' key

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

def call_backend_api(method: str, path: str, data: dict = None, params: dict = None):
    """
    Helper to call our Node.js backend API.
    """
    url = f"{API_BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    
    if params:
        query_string = "&".join([f"{key}={value}" for key, value in params.items()])
        url = f"{url}?{query_string}"

    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data)
        # Add other HTTP methods as needed (PUT, DELETE)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        click.echo(f"Error calling backend API {url} ({method}): {e}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_detail = e.response.json()
                click.echo(f"Backend error details: {json.dumps(error_detail, indent=2)}")
            except json.JSONDecodeError:
                click.echo(f"Backend responded with: {e.response.text}")
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