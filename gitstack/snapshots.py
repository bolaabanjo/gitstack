# gitstack/snapshots.py
import click
import os
import json
import hashlib # Needed for calculate_file_hash
import requests # Moved to top-level import
from datetime import datetime, timezone

# Import utility functions and constants from other modules
from .auth import get_authenticated_user_id # To check if user is logged in
from .config import SNAPSHOT_SCHEMA, CLI_DEFAULT_PORT, CONVEX_SITE_URL, CLERK_SECRET_KEY # Import necessary constants

# --- TEMPORARY: These will be moved to utils.py later ---

# SNAPSHOT_DIR definition - for now, directly used/defined as it's needed by ensure_snapshot_dir
# and will eventually be moved to config.py
SNAPSHOT_DIR = ".gitstack"

def ensure_snapshot_dir():
    """Make sure the .gitstack/ folder exists."""
    if not os.path.exists(SNAPSHOT_DIR):
        os.makedirs(SNAPSHOT_DIR)

def call_convex_function(function_type, function_name, args=None):
    """
    Helper to call Convex functions.
    This is a temporary copy from main.py, it will be moved to utils.py later.
    """
    if args is None:
        args = {}
    
    headers = {"Content-Type": "application/json"}
    headers["Authorization"] = f"Bearer {CLERK_SECRET_KEY}" # Use imported CLERK_SECRET_KEY
    
    endpoint = "mutation" if function_type == "mutation" else "query"
    payload = {"function": function_name, "args": args}
    
    try:
        response = requests.post(f"{CONVEX_SITE_URL}/api/{endpoint}", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        click.echo(f"Error calling Convex function {function_name}: {e}")
        return None

def calculate_file_hash(filepath):
    """Calculates the SHA256 hash of a given file."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192): # Read in 8KB chunks
            hasher.update(chunk)
    return hasher.hexdigest()
# --- END TEMPORARY ---

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
    
    file_hashes = []
    for filepath in files_to_snapshot:
        file_hashes.append({
            "path": filepath,
            "hash": calculate_file_hash(filepath)
        })

    timestamp = datetime.now(timezone.utc).timestamp() * 1000 # Convert to milliseconds for Convex

    result = call_convex_function("mutation", "snapshots:createSnapshot", {
        "userId": user_id,
        "timestamp": timestamp,
        "files": files_to_snapshot,
        "fileHashes": file_hashes
    })
    if result:
        click.echo(f"Snapshot taken and saved to Convex! Snapshot ID: {result['value']}")
    else:
        click.echo("Failed to take snapshot.")

@click.command()
def list_snapshots(): # Renamed from 'list' to avoid conflict with Python's built-in list
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