# gitstack/config.py

import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# --- CLI Configuration ---
CLI_DEFAULT_PORT = 8000
SNAPSHOT_DIR = ".gitstack"
GITSTACK_WEB_APP_URL = "https://gitstack.xyz"  # Your deployed frontend URL
# Production Backend API Base URL as default, can be overridden by env var
API_BASE_URL = os.getenv("API_BASE_URL", "https://gitstack-backend-production.up.railway.app/api")

# NEW: Re-added CLI Auth Callback configuration
CLI_AUTH_CALLBACK_PATH = "/cli-auth-success"
CLI_AUTH_CALLBACK_PORT = 8000

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