#!/usr/bin/env python3
"""
RezGuruAI Starter Script

This script sets up the environment and starts the RezGuruAI application
"""

import os
import subprocess
import time
import sys
import json
from flask import Flask, request, jsonify
from web_scraper import get_website_text_content, get_structured_website_content
import threading

# Create Flask app for the Python web scraper API
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

def print_status(message):
    print(f"\n[INFO] {message}")

@app.route('/api/scraper/extract', methods=['POST'])
def extract_content():
    """API endpoint to extract content from a URL using trafilatura"""
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        url = data['url']
        extracted_text = get_website_text_content(url)
        
        return jsonify({
            "success": True,
            "url": url,
            "extracted_text": extracted_text,
            "length": len(extracted_text) if extracted_text else 0
        })
    except Exception as e:
        print(f"Error extracting content: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scraper/structured', methods=['POST'])
def extract_structured_content():
    """API endpoint to extract and analyze structured content from a URL"""
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        url = data['url']
        print(f"Extracting structured content from {url}...")
        
        # Get structured content with our enhanced scraper
        extracted_data = get_structured_website_content(url)
        
        # Count properties found
        property_count = len(extracted_data.get('structured_data', {}).get('properties', []))
        content_type = extracted_data.get('structured_data', {}).get('content_type', 'unknown')
        
        print(f"Found {property_count} properties of type {content_type}")
        
        return jsonify({
            "success": True,
            "url": url,
            "content_type": content_type,
            "property_count": property_count,
            "data": extracted_data,
            "text_length": len(extracted_data.get('text', '')) if extracted_data.get('text') else 0
        })
    except Exception as e:
        print(f"Error extracting structured content: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def start_python_server():
    """Start the Flask server for the Python web scraper API"""
    app.run(host='0.0.0.0', port=5001)

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
        f.write(f"SCRAPER_API_URL=http://localhost:5001/api/scraper/extract\n")
    
    # Start the Python web scraper server in a separate thread
    print_status("Starting Python web scraper service on port 5001...")
    scraper_thread = threading.Thread(target=start_python_server, daemon=True)
    scraper_thread.start()
    
    # Wait for the scraper server to start
    time.sleep(2)
    print_status("Python web scraper service is now running on http://localhost:5001")
    
    # Start the Node.js server
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