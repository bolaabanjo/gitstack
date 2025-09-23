import click
import os
import json
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
import hashlib # Import hashlib for file hashing

load_dotenv()

# Directory where snapshots will be stored
SNAPSHOT_DIR = ".gitstack"
SNAPSHOT_FILE = os.path.join(SNAPSHOT_DIR, "snapshots.json")
CONVEX_URL = os.getenv("CONVEX_URL", "YOUR_CONVEX_DEPLOYMENT_URL_HERE")

# Clerk Authentication Configuration
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "sk_test_YOUR_CLERK_SECRET_KEY")
CLERK_API_URL = os.getenv("CLERK_API_URL", "https://api.clerk.com/v1/")

# Local storage for Clerk session token and Convex userId
SESSION_FILE = os.path.join(SNAPSHOT_DIR, "session.json")

def ensure_snapshot_dir():
    """Make sure the .gitstack/ folder exists."""
    if not os.path.exists(SNAPSHOT_DIR):
        os.makedirs(SNAPSHOT_DIR)

def get_session_data():
    if os.path.exists(SESSION_FILE):
        with open(SESSION_FILE, "r") as f:
            return json.load(f)
    return {"clerk_session_token": None, "convex_user_id": None, "clerk_user_id": None}

def save_session_data(clerk_session_token, convex_user_id, clerk_user_id):
    with open(SESSION_FILE, "w") as f:
        json.dump({
            "clerk_session_token": clerk_session_token,
            "convex_user_id": convex_user_id,
            "clerk_user_id": clerk_user_id
        }, f, indent=2)

def clear_session_data():
    if os.path.exists(SESSION_FILE):
        os.remove(SESSION_FILE)

def get_authenticated_user_id():
    session = get_session_data()
    return session.get("convex_user_id")

def calculate_file_hash(filepath):
    """Calculates the SHA256 hash of a given file."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192): # Read in 8KB chunks
            hasher.update(chunk)
    return hasher.hexdigest()

def call_convex_function(function_type, function_name, args=None):
    if args is None:
        args = {}
    
    headers = {"Content-Type": "application/json"}
    endpoint = "mutation" if function_type == "mutation" else "query"
    payload = {"function": function_name, "args": args}
    
    try:
        response = requests.post(f"{CONVEX_URL}/api/{endpoint}", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        click.echo(f"Error calling Convex function {function_name}: {e}")
        return None

def call_clerk_api(endpoint, method="GET", json_data=None, include_token=False):
    headers = {"Content-Type": "application/json"}
    if include_token:
        session_token = get_session_data().get("clerk_session_token")
        if not session_token:
            click.echo("Error: Not logged in. Please log in first.")
            return None
        headers["Authorization"] = f"Bearer {session_token}"
    else:
        # For requests that don't need a user session token but need secret key (e.g., creating a user)
        headers["Authorization"] = f"Bearer {CLERK_SECRET_KEY}"

    url = f"{CLERK_API_URL}{endpoint}"
    
    try:
        if method == "POST":
            response = requests.post(url, headers=headers, json=json_data)
        elif method == "PUT": # Clerk might use PUT for updating users/sessions
            response = requests.put(url, headers=headers, json=json_data)
        else:
            response = requests.get(url, headers=headers)
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        click.echo(f"Clerk API error ({e.response.status_code}) for {endpoint}: {e.response.text}")
        return None
    except requests.exceptions.RequestException as e:
        click.echo(f"Error calling Clerk API {endpoint}: {e}")
        return None

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
def login():
    """Logs in to the Gitstack platform."""
    click.echo("Logging in to the Gitstack platform...")
    email = click.prompt("Enter your email")
    password = click.prompt("Enter your password", hide_input=True)

    # 1. Authenticate with Clerk
    try:
        clerk_response = call_clerk_api("client/sessions", method="POST", json_data={
            "identifier": email,
            "password": password
        }, include_token=False) # Secret key for direct session creation

        if not clerk_response or not clerk_response.get("jwt"):
            click.echo("Login failed with Clerk. Please check your credentials.")
            return
        
        clerk_session_token = clerk_response["jwt"]
        clerk_user_id = clerk_response["user_id"]

    except Exception as e:
        click.echo(f"An error occurred during Clerk login: {e}")
        return

    # 2. Link/get user in Convex
    convex_user_data = call_convex_function("query", "users:getUserByClerkId", {"clerkUserId": clerk_user_id})
    convex_user_id = None

    if convex_user_data and convex_user_data.get("value"):
        convex_user_id = convex_user_data["value"]["_id"]
        # Update last login timestamp in Convex
        call_convex_function("mutation", "users:updateLastLogin", {"clerkUserId": clerk_user_id})
    else:
        # If user doesn't exist in Convex, create them
        click.echo("User not found in Convex, creating a new entry.")
        new_convex_user = call_convex_function("mutation", "users:createUser", {
            "clerkUserId": clerk_user_id,
            "email": email
        })
        if new_convex_user:
            convex_user_id = new_convex_user["value"]
        else:
            click.echo("Failed to create user entry in Convex.")
            return

    # 3. Save session locally
    save_session_data(clerk_session_token, convex_user_id, clerk_user_id)

    click.echo("Logged in successfully.")
    click.echo(f"Welcome, {email}!")

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
def logout():
    """Logs out of the Gitstack."""
    click.echo("Logging out of Gitstack ...")
    clear_session_data()
    click.echo("Logged out successfully.")
    click.echo("See you soon!")

@click.command()
def signup():
    """Signs up for the Gitstack."""
    click.echo("Signing up for Gitstack...")
    email = click.prompt("Enter your email")
    password = click.prompt("Enter your password", hide_input=True)

    # 1. Create user in Clerk
    try:
        clerk_response = call_clerk_api("users", method="POST", json_data={
            "email_address": [email],
            "password": password
        }, include_token=False) # Secret key for direct user creation

        if not clerk_response or not clerk_response.get("id"):
            click.echo("Clerk signup failed. User might already exist or invalid credentials.")
            return
        
        clerk_user_id = clerk_response["id"]

    except Exception as e:
        click.echo(f"An error occurred during Clerk signup: {e}")
        return

    # 2. Create user in Convex and link with Clerk ID
    new_convex_user = call_convex_function("mutation", "users:createUser", {
        "clerkUserId": clerk_user_id,
        "email": email
    })

    if new_convex_user:
        convex_user_id = new_convex_user["value"]
        # For signup, we also log them in directly
        click.echo("Signed up successfully. Attempting to log you in...")
        
        # After signup, simulate login to get a session token and save it
        login_response = call_clerk_api("client/sessions", method="POST", json_data={
            "identifier": email,
            "password": password
        }, include_token=False)

        if login_response and login_response.get("jwt"):
            clerk_session_token = login_response["jwt"]
            save_session_data(clerk_session_token, convex_user_id, clerk_user_id)
            click.echo(f"Welcome, {email}!")
        else:
            click.echo("Signed up successfully, but failed to automatically log in. Please try `gitstack login`.")

    else:
        click.echo("Failed to create user entry in Convex after Clerk signup.")

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