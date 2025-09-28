# gitstack/ai.py
import click
from .utils import respond # Import respond

@click.command()
def explain():
    """AI Summarizes what changed between snapshots."""
    respond(True, "Summarizing what changed between snapshots... (Convex integration needed)") # Use respond
    respond(True, "What changed between snapshots?") # Use respond

@click.command()
def fix():
    """AI Suggests fixes if something breaks after restore."""
    respond(True, "Suggesting fixes if something breaks after restore... (Convex integration needed)") # Use respond
    respond(True, "What fixes can be suggested?") # Use respond