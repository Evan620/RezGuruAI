#!/usr/bin/env python3
"""
RezGuruAI Starter Script

This script sets up the environment and starts the RezGuruAI application
"""

import os
import subprocess
import time
import sys

def print_status(message):
    print(f"\n[INFO] {message}")

def main():
    # Check if RezGuruAI directory exists
    if not os.path.exists("RezGuruAI"):
        print_status("RezGuruAI directory not found. Cloning repository...")
        subprocess.run(["git", "clone", "https://github.com/Evan620/RezGuruAI.git"], check=True)
    
    # Change to RezGuruAI directory
    os.chdir("RezGuruAI")
    print_status(f"Working directory: {os.getcwd()}")
    
    # Create .env file with environment variables
    print_status("Setting up environment variables...")
    with open(".env", "w") as f:
        f.write(f"DATABASE_URL={os.environ.get('DATABASE_URL', '')}\n")
        f.write(f"AZURE_OPENAI_API_KEY={os.environ.get('AZURE_OPENAI_API_KEY', '')}\n")
        f.write(f"AZURE_OPENAI_ENDPOINT=https://models.inference.ai.azure.com\n")
        f.write(f"SESSION_SECRET={os.environ.get('SESSION_SECRET', '')}\n")
    
    # Ensure npm dependencies are installed
    print_status("Installing npm dependencies...")
    try:
        subprocess.run(["npm", "install"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print_status(f"Warning: npm install failed: {e}")
        print_status("Continuing anyway...")
    
    # Create database schema if needed
    print_status("Creating database schema...")
    try:
        subprocess.run(["npm", "run", "db:push"], check=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except Exception as e:
        print_status(f"Warning: Database schema creation failed: {e}")
        print_status("Continuing anyway...")
    
    # Start the application directly (foreground process)
    print_status("Starting RezGuruAI application on port 5000...")
    print_status("Application will run on 0.0.0.0:5000")
    
    # Execute in foreground to keep the process alive
    subprocess.run(["npx", "tsx", "server/index.ts"])
    
    # If we get here, the process has exited
    print_status("RezGuruAI application has exited")

if __name__ == "__main__":
    main()