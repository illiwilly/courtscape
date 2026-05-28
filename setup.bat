@echo off
REM Bootstrap script for Windows to set up project directories and install dependencies

echo Setting up Courtscape project structure...

REM Create directory structure
mkdir server\config
mkdir server\db
mkdir server\routes
mkdir src\components
mkdir src\pages
mkdir src\hooks
mkdir src\services
mkdir public

echo. & echo [SUCCESS] Directories created

REM Install dependencies
echo Installing dependencies...
call npm install

echo. & echo [SUCCESS] Project setup complete!
echo.
echo Next steps:
echo 1. Copy .env.example to .env and update with your Databricks credentials
echo 2. Run 'npm run dev' to start the development server
