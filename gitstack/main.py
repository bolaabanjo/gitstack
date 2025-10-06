# gitstack/main.py
import click
import os
import json
from datetime import datetime, timezone

# Import commands from our new modules
from .auth import login, signup, logout, whoami
from .snapshots import snap, restore, delete, list_snapshots, debug_create_snapshot # NEW: Added debug_create_snapshot
from .deploy import deploy, push, pull, join
from .ai import explain, fix

# Import utility functions from utils.py for commands that are still placeholders here
from .utils import ensure_snapshot_dir, respond

@click.group()
def main():
    """Gitstack - An advanced modern version control system."""
    pass

@click.command()
def make():
    """Initializes a new gitstack repository. Now mainly ensures local dir."""
    ensure_snapshot_dir()
    respond(True, "Local .gitstack directory ensured.") # Use respond

@click.command()
def date():
    """Prints the current date and time."""
    now = datetime.now(timezone.utc)
    respond(True, "Current date (UTC):", {"date": now.date().isoformat()}) # Use respond

@click.command()
def time():
    """Prints the current time."""
    now = datetime.now(timezone.utc)
    respond(True, "Current time (UTC):", {"time": now.time().isoformat()}) # Use respond

@click.command()
def diff():
    """Compares two snapshots."""
    respond(True, "Comparing two snapshots... (Convex integration needed)") # Use respond
    respond(True, "What changed between snapshots?") # Use respond

# Add authentication commands to the main group
main.add_command(login)
main.add_command(signup)
main.add_command(logout)
main.add_command(whoami)

# Add snapshot commands to the main group
main.add_command(snap)
main.add_command(list_snapshots)
main.add_command(restore)
main.add_command(delete)
main.add_command(debug_create_snapshot) # NEW: Added debug_create_snapshot to main commands

# Add deployment commands to the main group
main.add_command(deploy)
main.add_command(push)
main.add_command(pull)
main.add_command(join)

# Add AI commands to the main group
main.add_command(explain)
main.add_command(fix)

# Add other utility commands
main.add_command(make)
main.add_command(date)
main.add_command(time)
main.add_command(diff)


if __name__ == "__main__":
    main()