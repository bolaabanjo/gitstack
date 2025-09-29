# gitstack/config.py

import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# --- CLI Configuration ---
CLI_DEFAULT_PORT = 8000
SNAPSHOT_DIR = ".gitstack" # Added this
CONVEX_USE_POLLING = True # Added this

# --- Convex Configuration ---
CONVEX_SITE_URL = os.getenv("CONVEX_SITE_URL")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

# --- Shared Schemas ---
# Defines the structure of data for snapshots
SNAPSHOT_SCHEMA = {
    "userId": str,
    "timestamp": float,
    "files": list,  # List of file paths
    "fileHashes": list,  # List of file hashes
}

# Defines the structure of data for deployments
DEPLOYMENT_SCHEMA = {
    "userId": str,
    "branch": str,
    "timestamp": float,
    "status": str,
}
