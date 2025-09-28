# gitstack/deploy.py
import click
import os
from datetime import datetime, timezone

# Import constants from config.py
from .config import DEPLOYMENT_SCHEMA

# Import utility functions from utils.py
from .utils import (
    get_authenticated_user_id,
    calculate_file_hash,
    call_convex_function,
    respond # Make sure this is imported
)

@click.command()
def deploy():
    """Deploys code to the cloud"""
    respond(True, 'Deployment initiated (Convex integration needed)') # Use respond
    # Example of how DEPLOYMENT_SCHEMA might be used
    # user_id = get_authenticated_user_id()
    # if not user_id:
    #     respond(False, "You must be logged in to deploy.")
    #     return
    # deployment_data = {
    #     "userId": user_id,
    #     "branch": "main", # Example
    #     "timestamp": datetime.now(timezone.utc).timestamp() * 1000,
    #     "status": "pending"
    # }
    # print(DEPLOYMENT_SCHEMA) # Placeholder to show schema is available
    # result = call_convex_function("mutation", "deployments:createDeployment", deployment_data)
    # if result:
    #     respond(True, "Deployment created!", {"deployment_id": result['value']})
    # else:
    #     respond(False, "Failed to create deployment.")

@click.command()
def push():
    """Pushes current snapshot metadata and file hashes to the Gitstack platform."""
    user_id = get_authenticated_user_id()
    if not user_id:
        respond(False, "You must be logged in to push a snapshot.") # Use respond
        return

    respond(True, "Gathering files and calculating hashes for push...") # Use respond
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
    
    respond(True, "Pushing current snapshot metadata and file hashes to Gitstack Web...") # Use respond
    result = call_convex_function("mutation", "snapshots:pushSnapshot", {
        "userId": user_id,
        "timestamp": timestamp,
        "files": files_to_snapshot,
        "fileHashes": file_hashes
    })

    if result:
        respond(True, "Snapshot pushed successfully!", {"snapshot_id": result['value']}) # Use respond
    else:
        respond(False, "Failed to push snapshot.") # Use respond

@click.command()
def pull():
    """Pulls current snapshot from the Gitstack Web."""
    respond(True, "Pulling current snapshot from the Gitstack Web... (Convex integration needed)") # Use respond
    respond(True, "Snapshot pulled successfully.") # Use respond

@click.command()
def join():
    """Joins a snapshot to the Gitstack Web."""
    respond(True, "Joining current snapshot to the Gitstack Web... (Convex integration needed)") # Use respond
    respond(True, "Snapshot joined successfully.") # Use respond