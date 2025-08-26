#!/bin/bash

# This script is used to run database migrations for the AI-Powered Developer Workspace.

# Navigate to the Supabase migrations directory
cd ../supabase/migrations

# Run the migrations using Supabase CLI
supabase db push

# Check the status of the migrations
supabase db status

echo "Database migrations completed."