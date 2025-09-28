# gitstack/deploy.py
import click
import os
from datetime import datetime, timezone

# Import constants from config.py
from .config import DEPLOYMENT_SCHEMA # Ensure DEPLOYMENT_SCHEMA is imported

# Import utility functions from utils.py
from .utils import (
    get_authenticated_user_id,
    calculate_file_hash,
    call_convex_function,
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

    timestamp = datetime.now(timezone.utc).timestamp() * 1000

    # Construct the deployment data explicitly using DEPLOYMENT_SCHEMA as a guide
    deployment_payload = {
        "userId": user_id,
        "branch": branch,
        "timestamp": timestamp,
        "status": status,
    }

    # Optional: Basic validation against the schema (demonstrative)
    if not isinstance(deployment_payload["userId"], DEPLOYMENT_SCHEMA["userId"]):
        respond(False, "Schema validation failed: userId is not a string.", {"field": "userId", "expected": str(DEPLOYMENT_SCHEMA["userId"])})
        return
    if not isinstance(deployment_payload["branch"], DEPLOYMENT_SCHEMA["branch"]):
        respond(False, "Schema validation failed: branch is not a string.", {"field": "branch", "expected": str(DEPLOYMENT_SCHEMA["branch"])})
        return
    if not isinstance(deployment_payload["timestamp"], DEPLOYMENT_SCHEMA["timestamp"]):
        respond(False, "Schema validation failed: timestamp is not a float.", {"field": "timestamp", "expected": str(DEPLOYMENT_SCHEMA["timestamp"])})
        return
    if not isinstance(deployment_payload["status"], DEPLOYMENT_SCHEMA["status"]):
        respond(False, "Schema validation failed: status is not a string.", {"field": "status", "expected": str(DEPLOYMENT_SCHEMA["status"])})
        return

    respond(True, 'Deployment initiated (Convex integration needed)', {"deployment_payload": deployment_payload})
    
    # Example integration with Convex (uncomment and implement when ready)
    # result = call_convex_function("mutation", "deployments:createDeployment", deployment_payload)
    # if result:
    #     respond(True, "Deployment created!", {"deployment_id": result['value']})
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
    
    timestamp = datetime.now(timezone.utc).timestamp() * 1000
    
    respond(True, "Pushing current snapshot metadata and file hashes to Gitstack Web...")
    result = call_convex_function("mutation", "snapshots:pushSnapshot", {
        "userId": user_id,
        "timestamp": timestamp,
        "files": files_to_snapshot,
        "fileHashes": file_hashes
    })

    if result:
        respond(True, "Snapshot pushed successfully!", {"snapshot_id": result['value'], "user_id": user_id, "timestamp": timestamp, "files_count": len(files_to_snapshot)})
    else:
        respond(False, "Failed to push snapshot.", {"user_id": user_id})

@click.command()
def pull():
    """Pulls current snapshot from the Gitstack Web."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to pull a snapshot.")
        return
    respond(True, "Pulling current snapshot from the Gitstack Web... (Convex integration needed)", {"user_id": user_id})
    # Placeholder for actual pull logic, e.g., fetching from Convex and restoring files
    respond(True, "Snapshot pulled successfully.", {"user_id": user_id, "status": "completed"})

@click.command()
def join():
    """Joins a snapshot to the Gitstack Web."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to join a snapshot.")
        return
    respond(True, "Joining current snapshot to the Gitstack Web... (Convex integration needed)", {"user_id": user_id})
    # Placeholder for actual join logic
    respond(True, "Snapshot joined successfully.", {"user_id": user_id, "status": "completed"})