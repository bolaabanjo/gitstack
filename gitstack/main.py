# gitstack/main.py
import click
import os # Still needed for os.path.exists in temporary make() command placeholder
import json # Still needed for json in temporary make() command placeholder
from datetime import datetime, timezone # Still needed for date() and time() commands

# Import commands from our new modules
from .auth import login, signup, logout
from .snapshots import snap, restore, delete, list_snapshots
from .deploy import deploy, push, pull, join
from .ai import explain, fix

# Import utility functions from utils.py for commands that are still placeholders here
from .utils import ensure_snapshot_dir # Used by the make command placeholder

# --- DELETE the following duplicated code blocks ---
# Delete: SNAPSHOT_DIR = ".gitstack"
# Delete: def ensure_snapshot_dir(): ...
# Delete: def calculate_file_hash(...): ...
# --- END DELETE ---

@click.group()
def main():
    """Gitstack - An advanced modern version control system."""
    pass

@click.command()
def make():
    """Initializes a new gitstack repository. Now mainly ensures local dir."""
    ensure_snapshot_dir() # Now imported from utils.py
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
def diff():
    """Compares two snapshots."""
    click.echo("Comparing two snapshots... (Convex integration needed)")
    click.echo("What changed between snapshots?")

main.add_command(login)
main.add_command(signup)
main.add_command(logout)
main.add_command(snap)
main.add_command(restore)
main.add_command(delete)
main.add_command(list_snapshots)
main.add_command(deploy)
main.add_command(push)
main.add_command(pull)
main.add_command(join)
main.add_command(explain)
main.add_command(fix)
main.add_command(make) # Ensure make is added to the main group
main.add_command(date)
main.add_command(time)
main.add_command(diff)


if __name__ == "__main__":
    main()