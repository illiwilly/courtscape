#!/bin/bash
# Bootstrap script to set up project directories and install dependencies

echo "Setting up Courtscape project structure..."

# Create directory structure
mkdir -p server/config
mkdir -p server/db
mkdir -p server/routes
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/hooks
mkdir -p src/services
mkdir -p public

echo "✓ Directories created"

# Install dependencies
echo "Installing dependencies..."
npm install

echo "✓ Project setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and update with your Databricks credentials"
echo "2. Run 'npm run dev' to start the development server"
