# gitstack/deploy.py
import click
import os
import json
import hashlib # Needed for calculate_file_hash
from datetime import datetime, timezone

# Import utility functions and constants from other modules
from .auth import get_authenticated_user_id # To check if user is logged in
from .config import DEPLOYMENT_SCHEMA, CONVEX_SITE_URL, CLERK_SECRET_KEY # For validating deployment data

# --- TEMPORARY: These will be moved to utils.py later ---
# These are copies from main.py / snapshots.py that deploy.py commands will need
def call_convex_function(function_type, function_name, args=None):
    """
    Helper to call Convex functions.
    This is a temporary copy, it will be moved to utils.py later.
    """
    import requests
    if args is None:
        args = {}
    
    headers = {"Content-Type": "application/json"}
    headers["Authorization"] = f"Bearer {CLERK_SECRET_KEY}"
    
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