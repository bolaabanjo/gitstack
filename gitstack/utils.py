# gitstack/utils.py
import os
import json
import hashlib
import socket
import requests
import click # For click.echo
from datetime import datetime, timezone # Needed for call_convex_function/snapshot handling

# Import constants from config.py
from .config import (
    CLI_DEFAULT_PORT,
    CONVEX_SITE_URL,
    CLERK_SECRET_KEY,
    SNAPSHOT_DIR, # Now importing SNAPSHOT_DIR from config
    CONVEX_USE_POLLING # For signup logic, will move this constant to config.py
)

def ensure_snapshot_dir():
    """Make sure the .gitstack/ folder exists."""
    if not os.path.exists(SNAPSHOT_DIR):
        os.makedirs(SNAPSHOT_DIR)

def calculate_file_hash(filepath):
    """Calculates the SHA256 hash of a given file."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192): # Read in 8KB chunks
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

def call_convex_function(function_type, function_name, args=None):
    """
    Helper to call Convex functions.
    """
    if args is None:
        args = {}
    
    headers = {"Content-Type": "application/json"}
    # Assuming CLERK_SECRET_KEY is used for server-to-server calls to Convex
    headers["Authorization"] = f"Bearer {CLERK_SECRET_KEY}"
    
    endpoint = "mutation" if function_type == "mutation" else "query"
    payload = {"function": function_name, "args": args}
    
    try:
        response = requests.post(f"{CONVEX_SITE_URL}/api/{endpoint}", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        # We use click.echo here because this is a CLI utility
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