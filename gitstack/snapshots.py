# gitstack/snapshots.py
import click
import os
from datetime import datetime, timezone
import json # Import json for parsing backend responses

# Import constants from config.py
from .config import SNAPSHOT_SCHEMA

# Import utility functions from utils.py
from .utils import (
    get_authenticated_user_id,
    ensure_snapshot_dir,
    calculate_file_hash,
    call_backend_api,
    respond
)

@click.command()
def snap():
    """Captures current code, dependencies, and environment and saves."""
    ensure_snapshot_dir()
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to take a snapshot.")
        return

    files_to_snapshot = []
    for root, dirs, filenames in os.walk('.'):
        # Exclude common directories like .git, .gitstack, __pycache__, venv, and node_modules
        dirs[:] = [d for d in dirs if d not in ['.git', '.gitstack', '__pycache__', 'venv', 'node_modules']]
        for f in filenames:
            filepath = os.path.join(root, f)
            # Further filter out files within excluded directories if any slipped through
            if not any(excluded_dir in filepath for excluded_dir in ['.git', '.gitstack', '__pycache__', 'venv', 'node_modules']):
                files_to_snapshot.append(filepath)
    
    file_hashes = []
    for filepath in files_to_snapshot:
        file_hashes.append({
            "path": filepath,
            "hash": calculate_file_hash(filepath)
        })

    timestamp = int(datetime.now(timezone.utc).timestamp() * 1000) # Ensure integer timestamp

    # Construct the snapshot data
    snapshot_payload = {
        "userId": user_id,
        "timestamp": timestamp,
        "files": files_to_snapshot,
        "fileHashes": file_hashes,
    }

    # Now that backend is ready, we can uncomment this block to use the API
    result = call_backend_api("POST", "/snapshots", data=snapshot_payload)
    if result:
        respond(True, "Snapshot taken and saved!", {"snapshot_id": result.get("id")})
    else:
        respond(False, "Failed to take snapshot.")


@click.command()
def list_snapshots():
    """Lists all saved snapshots."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to list snapshots.")
        return

    snapshots_data = call_backend_api("GET", "/snapshots", params={"userId": user_id})
    if not snapshots_data:
        respond(False, "No snapshots found or failed to fetch snapshots.")
        return

    formatted_snapshots = []
    for i, snapshot in enumerate(snapshots_data): # Assuming backend returns a list of snapshots
        dt_object = datetime.fromtimestamp(snapshot['timestamp'] / 1000, tz=timezone.utc)
        formatted_snapshots.append({
            "index": i + 1,
            "id": snapshot['id'], # Use 'id' from backend
            "projectId": snapshot['project_id'], # Include project_id for context
            "userId": snapshot['user_id'],
            "title": snapshot['title'],
            "timestamp": dt_object.isoformat(),
            "file_count": snapshot.get('file_count', 0),
            "external_id": snapshot.get('external_id')
        })
    respond(True, "Saved snapshots:", {"snapshots": formatted_snapshots})


@click.command()
def restore():
    """Restore a snapshot."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to restore a snapshot.")
        return
    
    respond(True, "Restore functionality is pending full CLI implementation.")
    respond(True, "File restoration logic is a TODO for now.", {"files_to_restore_count": 0})


@click.command()
def delete():
    """Deletes a snapshot."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to delete a snapshot.")
        return

    # First, list snapshots to allow user to choose
    snapshots_data = call_backend_api("GET", "/snapshots", params={"userId": user_id})
    if not snapshots_data:
        respond(False, "No snapshots found to delete.")
        return
    
    click.echo("Available snapshots:")
    for i, snapshot in enumerate(snapshots_data):
        dt_object = datetime.fromtimestamp(snapshot['timestamp'] / 1000, tz=timezone.utc)
        click.echo(f"  {i+1}. ID: {snapshot['id'][:8]}... Project: {snapshot['project_id'][:8]}... Title: {snapshot['title'] or 'N/A'} ({dt_object.isoformat()})")

    try:
        snapshot_num = click.prompt("Enter the number of the snapshot to delete", type=int)
    except click.exceptions.Abort:
        respond(False, "Delete cancelled by user.")
        return

    if 1 <= snapshot_num <= len(snapshots_data):
        snapshot_to_delete = snapshots_data[snapshot_num - 1]
        
        result = call_backend_api("DELETE", f"/snapshots/{snapshot_to_delete['id']}")
        if result:
            respond(True, f"Snapshot {snapshot_to_delete['id']} deleted successfully.", {"snapshot_id": snapshot_to_delete['id']})
        else:
            respond(False, "Failed to delete snapshot.", {"snapshot_id": snapshot_to_delete['id']})
    else:
        respond(False, "Invalid snapshot number.")


@click.command()
@click.option('--project-id', required=True, help='The ID of the project to associate the snapshot with.')
@click.option('--title', default='Debug Snapshot', help='Title for the debug snapshot.')
@click.option('--description', default='A snapshot created for debugging purposes.', help='Description for the debug snapshot.')
def debug_create_snapshot(project_id, title, description):
    """Creates a dummy snapshot for a given project for debugging purposes."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to create a snapshot.")
        return

    timestamp = int(datetime.now(timezone.utc).timestamp() * 1000)

    # Create some dummy file data
    dummy_files = [
        {"path": "src/main.py", "hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2", "size": 1234, "mode": 644},
        {"path": "README.md", "hash": "f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2", "size": 567, "mode": 644},
    ]

    snapshot_payload = {
        "projectId": project_id,
        "userId": user_id,
        "title": title,
        "description": description,
        "timestamp": timestamp,
        "externalId": f"debug-snap-{timestamp}",
        "files": dummy_files,
    }

    result = call_backend_api("POST", "/snapshots", data=snapshot_payload)
    if result:
        respond(True, "Debug snapshot created successfully!", {"snapshot_id": result.get("id"), "project_id": project_id})
    else:
        respond(False, "Failed to create debug snapshot.")