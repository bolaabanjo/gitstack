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
    call_backend_api, # CORRECTED: Changed from call_convex_function
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

    # IMPORTANT: Before uncommenting and using this, we need to implement
    # the /api/snapshots/create endpoint in our backend (Task 8).
    # For now, this will just print a message.
    respond(True, "Snapshot functionality is pending backend implementation (Task 8).", {"snapshot_payload": snapshot_payload})

    # Example of how it *would* call the new backend (uncomment when backend is ready)
    # result = call_backend_api("POST", "/snapshots", data=snapshot_payload)
    # if result:
    #     respond(True, "Snapshot taken and saved!", {"snapshot_id": result.get("id")})
    # else:
    #     respond(False, "Failed to take snapshot.")


@click.command()
def list_snapshots():
    """Lists all saved snapshots."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to list snapshots.")
        return

    # IMPORTANT: Before uncommenting and using this, we need to implement
    # the /api/snapshots?userId=... endpoint in our backend (Task 8).
    # For now, this will just print a message.
    respond(True, "List snapshots functionality is pending backend implementation (Task 8).")

    # Example of how it *would* call the new backend (uncomment when backend is ready)
    # snapshots_data = call_backend_api("GET", "/snapshots", params={"userId": user_id})
    # if not snapshots_data:
    #     respond(False, "No snapshots found or failed to fetch snapshots.")
    #     return

    # formatted_snapshots = []
    # for i, snapshot in enumerate(snapshots_data): # Assuming backend returns a list of snapshots
    #     dt_object = datetime.fromtimestamp(snapshot['timestamp'] / 1000, tz=timezone.utc)
    #     formatted_snapshots.append({
    #         "index": i + 1,
    #         "id": snapshot['id'], # Use 'id' from backend
    #         "userId": snapshot['userId'],
    #         "timestamp": dt_object.isoformat(),
    #         "file_count": snapshot.get('file_count', 0), # Assuming backend provides file_count
    #         "file_hashes_count": snapshot.get('file_hashes_count', 0) # Assuming backend provides hash count
    #     })
    # respond(True, "Saved snapshots:", {"snapshots": formatted_snapshots})

@click.command()
def restore():
    """Restore a snapshot."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to restore a snapshot.")
        return
    
    # IMPORTANT: Needs /api/snapshots?userId=... and /api/snapshots/:id endpoints
    respond(True, "Restore functionality is pending backend implementation (Task 8).")
    respond(True, "File restoration logic is a TODO for now.", {"files_to_restore_count": 0})


@click.command()
def delete():
    """Deletes a snapshot."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to delete a snapshot.")
        return

    # IMPORTANT: Needs /api/snapshots?userId=... and /api/snapshots/:id (DELETE) endpoints
    respond(True, "Delete snapshot functionality is pending backend implementation (Task 8).")