# gitstack/snapshots.py
import click
import os
from datetime import datetime, timezone

# Import constants from config.py
from .config import SNAPSHOT_SCHEMA # Ensure SNAPSHOT_SCHEMA is imported

# Import utility functions from utils.py
from .utils import (
    get_authenticated_user_id,
    ensure_snapshot_dir,
    calculate_file_hash,
    call_convex_function,
    respond
)

@click.command()
def snap():
    """Captures current code, dependencies, and environment and saves to Convex."""
    ensure_snapshot_dir()
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to take a snapshot.")
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

    timestamp = datetime.now(timezone.utc).timestamp() * 1000

    # Construct the snapshot data explicitly using SNAPSHOT_SCHEMA as a guide
    snapshot_payload = {
        "userId": user_id,
        "timestamp": timestamp,
        "files": files_to_snapshot,
        "fileHashes": file_hashes,
    }

    # Optional: Basic validation against the schema (demonstrative)
    # This is a basic type check; for full validation, a library like Pydantic or jsonschema would be used.
    if not isinstance(snapshot_payload["userId"], SNAPSHOT_SCHEMA["userId"]):
        respond(False, "Schema validation failed: userId is not a string.", {"field": "userId", "expected": str(SNAPSHOT_SCHEMA["userId"])})
        return
    if not isinstance(snapshot_payload["timestamp"], SNAPSHOT_SCHEMA["timestamp"]):
        respond(False, "Schema validation failed: timestamp is not a float.", {"field": "timestamp", "expected": str(SNAPSHOT_SCHEMA["timestamp"])})
        return
    if not isinstance(snapshot_payload["files"], SNAPSHOT_SCHEMA["files"]):
        respond(False, "Schema validation failed: files is not a list.", {"field": "files", "expected": str(SNAPSHOT_SCHEMA["files"])})
        return
    if not isinstance(snapshot_payload["fileHashes"], SNAPSHOT_SCHEMA["fileHashes"]):
        respond(False, "Schema validation failed: fileHashes is not a list.", {"field": "fileHashes", "expected": str(SNAPSHOT_SCHEMA["fileHashes"])})
        return
    
    result = call_convex_function("mutation", "snapshots:createSnapshot", snapshot_payload)
    if result:
        respond(True, "Snapshot taken and saved to Convex!", {"snapshot_id": result['value']})
    else:
        respond(False, "Failed to take snapshot.")

@click.command()
def list_snapshots():
    """Lists all saved snapshots."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to list snapshots.")
        return

    snapshots_data = call_convex_function("query", "snapshots:getSnapshots", {"userId": user_id})
    if not snapshots_data or not snapshots_data.get('value'):
        respond(False, "No snapshots found.")
        return

    formatted_snapshots = []
    for i, snapshot in enumerate(snapshots_data['value']):
        dt_object = datetime.fromtimestamp(snapshot['timestamp'] / 1000, tz=timezone.utc)
        formatted_snapshots.append({
            "index": i + 1,
            "id": snapshot['_id'],
            "userId": snapshot['userId'], # Ensure userId is included in output
            "timestamp": dt_object.isoformat(),
            "files_count": len(snapshot.get('files', [])), # Add count of files
            "file_hashes_count": len(snapshot.get('fileHashes', [])) # Add count of file hashes
        })
    respond(True, "Saved snapshots:", {"snapshots": formatted_snapshots})

@click.command()
def restore():
    """Restore a snapshot."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to restore a snapshot.")
        return
    
    snapshots_data = call_convex_function("query", "snapshots:getSnapshots", {"userId": user_id})
    if not snapshots_data or not snapshots_data.get('value'):
        respond(False, "No snapshots found to restore.")
        return
    
    formatted_snapshots = []
    for i, snapshot in enumerate(snapshots_data['value']):
        dt_object = datetime.fromtimestamp(snapshot['timestamp'] / 1000, tz=timezone.utc)
        formatted_snapshots.append({
            "index": i + 1,
            "id": snapshot['_id'],
            "userId": snapshot['userId'], # Ensure userId is included in output
            "timestamp": dt_object.isoformat()
        })
    
    respond(True, "Available snapshots:", {"snapshots": formatted_snapshots})
    
    try:
        snapshot_num = click.prompt("Enter the number of the snapshot to restore", type=int)
    except click.exceptions.Abort:
        respond(False, "Restore cancelled by user.")
        return

    if 1 <= snapshot_num <= len(snapshots_data['value']):
        snapshot_to_restore = snapshots_data['value'][snapshot_num - 1]
        
        respond(True, f"Restoring snapshot (ID: {snapshot_to_restore['_id']}) from: {datetime.fromtimestamp(snapshot_to_restore['timestamp'] / 1000, tz=timezone.utc).isoformat()}", {
            "snapshot_id": snapshot_to_restore['_id'],
            "userId": snapshot_to_restore['userId'], # Ensure userId is included
            "timestamp": snapshot_to_restore['timestamp'],
            "files_count": len(snapshot_to_restore.get("files", [])),
            "file_hashes_count": len(snapshot_to_restore.get("fileHashes", []))
        })
        
        # TODO: Implement actual file restoration (e.g., download files, overwrite local)
        respond(True, "File restoration logic is a TODO for now.", {"files_to_restore_count": len(snapshot_to_restore.get("files", []))})
    else:
        respond(False, "Invalid snapshot number.")

@click.command()
def delete():
    """Deletes a snapshot."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to delete a snapshot.")
        return

    snapshots_data = call_convex_function("query", "snapshots:getSnapshots", {"userId": user_id})
    if not snapshots_data or not snapshots_data.get('value'):
        respond(False, "No snapshots found to delete.")
        return
    
    formatted_snapshots = []
    for i, snapshot in enumerate(snapshots_data['value']):
        dt_object = datetime.fromtimestamp(snapshot['timestamp'] / 1000, tz=timezone.utc)
        formatted_snapshots.append({
            "index": i + 1,
            "id": snapshot['_id'],
            "userId": snapshot['userId'], # Ensure userId is included in output
            "timestamp": dt_object.isoformat()
        })
    respond(True, "Available snapshots:", {"snapshots": formatted_snapshots})
    
    try:
        snapshot_num = click.prompt("Enter the number of the snapshot to delete", type=int)
    except click.exceptions.Abort:
        respond(False, "Delete cancelled by user.")
        return

    if 1 <= snapshot_num <= len(snapshots_data['value']):
        snapshot_to_delete = snapshots_data['value'][snapshot_num - 1]
        result = call_convex_function("mutation", "snapshots:deleteSnapshot", {"snapshotId": snapshot_to_delete['_id'], "userId": user_id})
        if result is not None:
            respond(True, f"Snapshot {snapshot_to_delete['_id']} deleted successfully.", {"snapshot_id": snapshot_to_delete['_id'], "userId": snapshot_to_delete['userId']})
        else:
            respond(False, "Failed to delete snapshot.", {"snapshot_id": snapshot_to_delete['_id'], "userId": snapshot_to_delete['userId']})
    else:
        respond(False, "Invalid snapshot number.")