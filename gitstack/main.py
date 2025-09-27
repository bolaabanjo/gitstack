import click
import os
import json
from datetime import datetime, timezone
import hashlib # Import hashlib for file hashing

SNAPSHOT_DIR = ".gitstack"


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



@click.group()
def main():
    """Gitstack - An advanced modern version control system."""
    pass


@click.command()
def make():
    """Initializes a new gitstack repository. Now mainly ensures local dir."""
    ensure_snapshot_dir()
    click.echo("Local .gitstack directory ensured.")


@click.command()
def date():
    """Prints the current date and time."""
    now = datetime.now(timezone.utc)
    click.echo("Current date (UTC): {}".format(now.date().isoformat()))

@click.command()
def time():
    """Prints the current time."""
    now = datetime.now(timezone.utc)
    click.echo("Current time (UTC): {}".format(now.time().isoformat()))


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
    
    result = call_convex_function("mutation", "snapshots:createSnapshot", {"userId": user_id, "files": files_to_snapshot})
    if result:
        click.echo(f"Snapshot taken and saved to Convex! Snapshot ID: {result['value']}")
    else:
        click.echo("Failed to take snapshot.")


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


@click.command()
def explain():
    """AI Summarizes what changed between snapshots."""
    click.echo("Summarizing what changed between snapshots... (Convex integration needed)")
    click.echo("What changed between snapshots?")

@click.command()
def diff():
    """Compares two snapshots."""
    click.echo("Comparing two snapshots... (Convex integration needed)")
    click.echo("What changed between snapshots?")

@click.command()
def push():
    """Pushes current snapshot metadata and file hashes to the Gitstack platform."""
    user_id = get_authenticated_user_id()
    if not user_id:
        click.echo("You must be logged in to push a snapshot.")
        return

    click.echo("Gathering files and calculating hashes...")
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
    result = call_convex_function("mutation", "snapshots:pushSnapshot", {
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

@click.command()
def fix():
    """AI Suggests fixes if something breaks after restore."""
    click.echo("Suggesting fixes if something breaks after restore... (Convex integration needed)")
    click.echo("What fixes can be suggested?")


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
def deploy(): 
    """Deploys code to the cloud"""
    click.echo('Deployment initiated (Convex integration needed)')

@click.command()
def list():
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

main.add_command(snap)
main.add_command(restore)
main.add_command(date)
main.add_command(time)
main.add_command(make)
main.add_command(deploy)
main.add_command(list)
main.add_command(diff)
main.add_command(explain)
main.add_command(push)
main.add_command(pull)
main.add_command(join)
main.add_command(fix)
main.add_command(delete)
main.add_command(logout)
main.add_command(signup)
main.add_command(login)

if __name__ == "__main__":
    main()