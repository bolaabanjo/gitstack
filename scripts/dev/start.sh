#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")/../../"

# Install dependencies
pnpm install

# Start the development server
pnpm dev