import click
import os
import json
from datetime import datetime, timezone
import hashlib # Import hashlib for file hashing


from .auth import login, signup, logout

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
    # This entire block will be moved to snapshots.py later
    click.echo("Snap command (placeholder for now).")

@click.command()
def delete():
    """Deletes a snapshot."""
    # This entire block will be moved to snapshots.py later
    click.echo("Delete command (placeholder for now).")


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
        # This entire block will be moved to deploy.py later
        click.echo("Push command (placeholder for now).")

@click.command()
def pull():
        """Pulls current snapshot from the Gitstack Web."""
        # This entire block will be moved to deploy.py later
        click.echo("Pull command (placeholder for now).")

@click.command()
def join():
        """Joins a snapshot to the Gitstack Web."""
        # This entire block will be moved to deploy.py later
        click.echo("Join command (placeholder for now).")
@click.command()
def fix():
    """AI Suggests fixes if something breaks after restore."""
    click.echo("Suggesting fixes if something breaks after restore... (Convex integration needed)")
    click.echo("What fixes can be suggested?")


@click.command()
def restore():
        """Restore a snapshot."""
        # This entire block will be moved to snapshots.py later
        click.echo("Restore command (placeholder for now).")

@click.command()
def deploy(): 
    """Deploys code to the cloud"""
    click.echo('Deployment initiated (Convex integration needed)')

@click.command()
def list():
        """Lists all saved snapshots."""
        # This entire block will be moved to snapshots.py later
        click.echo("List command (placeholder for now).")

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