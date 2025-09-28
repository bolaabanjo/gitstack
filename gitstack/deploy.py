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
    respond # We'll use this in a later step for standardized responses
)

# --- DELETE the following duplicated code blocks ---
# Delete: def call_convex_function(...): ...
# Delete: def calculate_file_hash(...): ...
# --- END DELETE ---

@click.command()
def deploy():
    """Deploys code to the cloud"""
    # This will contain the deployment logic, interacting with Convex or other services
    click.echo('Deployment initiated (Convex integration needed)')
    # Example of how DEPLOYMENT_SCHEMA might be used
    # deployment_data = {
    #     "userId": get_authenticated_user_id(),
    #     "branch": "main", # Example
    #     "timestamp": datetime.now(timezone.utc).timestamp() * 1000,
    #     "status": "pending"
    # }
    # print(DEPLOYMENT_SCHEMA) # Placeholder to show schema is available
    # result = call_convex_function("mutation", "deployments:createDeployment", deployment_data)
    # if result:
    #     click.echo(f"Deployment created! ID: {result['value']}")
    # else:
    #     click.echo("Failed to create deployment.")

@click.command()
def push():
    """Pushes current snapshot metadata and file hashes to the Gitstack platform."""
    user_id = get_authenticated_user_id()
    if not user_id:
        click.echo("You must be logged in to push a snapshot.")
        return

    click.echo("Gathering files and calculating hashes for push...")
    files_to_snapshot = []
    file_hashes = []
    for root, dirs, filenames in os.walk('.'):
        # Exclude Gitstack's own metadata, .git, __pycache__, and venv
        dirs[:] = [d for d in dirs if ".gitstack" not in d and ".git" not in d and "__pycache__" not in d and "venv" not in d]
        for f in filenames:
            if ".gitstack" not in root and ".git" not in root and "__pycache__" not in root and "venv" not in root:
                filepath = os.path.join(root, f)
                files_to_snapshot.append(filepath)
                file_hashes.append({
                    "path": filepath,
                    "hash": calculate_file_hash(filepath)
                })
    
    timestamp = datetime.now(timezone.utc).timestamp() * 1000 # Convert to milliseconds for Convex
    
    click.echo("Pushing current snapshot metadata and file hashes to Gitstack Web...")
    result = call_convex_function("mutation", "snapshots:pushSnapshot", { # Note: This mutation is on 'snapshots' collection
        "userId": user_id,
        "timestamp": timestamp,
        "files": files_to_snapshot,
        "fileHashes": file_hashes
    })

    if result:
        click.echo(f"Snapshot pushed successfully! Snapshot ID: {result['value']}")
    else:
        click.echo("Failed to push snapshot.")

@click.command()
def pull():
    """Pulls current snapshot from the Gitstack Web."""
    click.echo("Pulling current snapshot from the Gitstack Web... (Convex integration needed)")
    click.echo("Snapshot pulled successfully.")

@click.command()
def join():
    """Joins a snapshot to the Gitstack Web."""
    click.echo("Joining current snapshot to the Gitstack Web... (Convex integration needed)")
    click.echo("Snapshot joined successfully.")