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
    
    # Start the server directly using node
    print_status("Starting RezGuruAI application on port 5000...")
    os.environ['PORT'] = '5000'
    
    # Execute tsx directly
    cmd = ["npx", "tsx", "server/index.ts"]
    print_status(f"Running command: {' '.join(cmd)}")
    
    # This will keep the server running in the foreground
    server_process = subprocess.Popen(cmd)
    
    # Wait for the server to start
    time.sleep(2)
    print_status("Server should now be running on http://localhost:5000")
    
    # Keep the script running to maintain the server process
    try:
        server_process.wait()
    except KeyboardInterrupt:
        print_status("Shutting down server...")
        server_process.terminate()
        server_process.wait()
    
    print_status("Server has been shut down")

if __name__ == "__main__":
    main()