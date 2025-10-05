# gitstack/deploy.py
import click
import os
from datetime import datetime, timezone
import json # Import json for parsing backend responses

# Import constants from config.py
from .config import DEPLOYMENT_SCHEMA

# Import utility functions from utils.py
from .utils import (
    get_authenticated_user_id,
    calculate_file_hash,
    call_backend_api, # CORRECTED: Changed from call_convex_function
    respond
)

@click.command()
def deploy():
    """Deploys code to the cloud"""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to deploy.")
        return

    # Prompt for deployment details (example)
    try:
        branch = click.prompt("Enter the branch to deploy", type=str, default="main")
        status = click.prompt("Enter initial deployment status", type=str, default="pending")
    except click.exceptions.Abort:
        respond(False, "Deployment cancelled by user.")
        return

    timestamp = int(datetime.now(timezone.utc).timestamp() * 1000) # Ensure integer timestamp

    # Construct the deployment data
    deployment_payload = {
        "userId": user_id,
        "branch": branch,
        "timestamp": timestamp,
        "status": status,
    }

    # IMPORTANT: Before uncommenting and using this, we need to implement
    # the /api/deployments/create endpoint in our backend (Task 8).
    # For now, this will just print a message.
    respond(True, 'Deployment initiated (Backend integration needed - Task 8).', {"deployment_payload": deployment_payload})
    
    # Example integration with backend (uncomment and implement when ready)
    # result = call_backend_api("POST", "/deployments", data=deployment_payload)
    # if result:
    #     respond(True, "Deployment created!", {"deployment_id": result.get("id")})
    # else:
    #     respond(False, "Failed to create deployment.")


@click.command()
def push():
    """Pushes current snapshot metadata and file hashes to the Gitstack platform."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to push a snapshot.")
        return

    respond(True, "Gathering files and calculating hashes for push...")
    files_to_snapshot = []
    file_hashes = []
    for root, dirs, filenames in os.walk('.'):
        dirs[:] = [d for d in dirs if ".gitstack" not in d and ".git" not in d and "__pycache__" not in d and "venv" not in d]
        for f in filenames:
            if ".gitstack" not in root and ".git" not in root and "__pycache__" not in root and "venv" not in root:
                filepath = os.path.join(root, f)
                files_to_snapshot.append(filepath)
                file_hashes.append({
                    "path": filepath,
                    "hash": calculate_file_hash(filepath)
                })
    
    timestamp = int(datetime.now(timezone.utc).timestamp() * 1000) # Ensure integer timestamp
    
    respond(True, "Pushing current snapshot metadata and file hashes to Gitstack Web... (Backend integration needed - Task 8)")
    # IMPORTANT: Before uncommenting and using this, we need to implement
    # the /api/snapshots/push endpoint in our backend (Task 8).
    # result = call_backend_api("POST", "/snapshots/push", data={
    #     "userId": user_id,
    #     "timestamp": timestamp,
    #     "files": files_to_snapshot,
    #     "fileHashes": file_hashes
    # })

    # if result:
    #     respond(True, "Snapshot pushed successfully! (Task 8 pending)", {"snapshot_id": result.get("id"), "user_id": user_id, "timestamp": timestamp, "files_count": len(files_to_snapshot)})
    # else:
    #     respond(False, "Failed to push snapshot. (Task 8 pending)", {"user_id": user_id})


@click.command()
def pull():
    """Pulls current snapshot from the Gitstack Web."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to pull a snapshot.")
        return
    respond(True, "Pulling current snapshot from the Gitstack Web... (Backend integration needed - Task 8)", {"user_id": user_id})
    # Placeholder for actual pull logic, e.g., fetching from backend and restoring files
    # IMPORTANT: Needs /api/snapshots/pull endpoint in backend (Task 8)
    respond(True, "Snapshot pulled successfully. (Task 8 pending)", {"user_id": user_id, "status": "completed"})


@click.command()
def join():
    """Joins a snapshot to the Gitstack Web."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to join a snapshot.")
        return
    respond(True, "Joining current snapshot to the Gitstack Web... (Backend integration needed - Task 8)", {"user_id": user_id})
    # Placeholder for actual join logic
    # IMPORTANT: Needs /api/snapshots/join endpoint in backend (Task 8)
    respond(True, "Snapshot joined successfully. (Task 8 pending)", {"user_id": user_id, "status": "completed"})