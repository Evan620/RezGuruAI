#!/usr/bin/env python3
"""
RezGuruAI Application Testing Script

This script tests various features of the RezGuruAI application to identify non-functioning components.
It will document the issues found and provide recommendations for fixes.
"""

import os
import subprocess
import sys
import json
import time
import requests
import urllib.parse
import socket
import threading
import webbrowser
from urllib.parse import urlparse

# Issue tracking
issues = []
issue_counter = 0

def print_status(message):
    """Print a status message with timestamp"""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def add_issue(feature, description, priority="Medium", files_affected=None):
    """Add an issue to the issues list"""
    global issue_counter
    issue_counter += 1
    
    issues.append({
        "id": issue_counter,
        "feature": feature,
        "description": description,
        "priority": priority,
        "files_affected": files_affected or [],
        "status": "Identified"
    })
    
    print_status(f"Issue #{issue_counter} identified: {feature} - {description}")

def run_command(command):
    """Run a shell command and return the result"""
    print_status(f"Executing: {command}")
    try:
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print_status(f"Error executing command: {e}")
        print_status(f"Command output: {e.stderr}")
        return None

def detect_application_type():
    """Detect the type of application based on file structure"""
    print_status("Detecting application type...")
    
    has_python = os.path.exists("requirements.txt")
    has_node = os.path.exists("package.json")
    
    if has_python and has_node:
        return "hybrid"
    elif has_python:
        return "python"
    elif has_node:
        return "node"
    else:
        python_files = run_command("find . -name '*.py' | wc -l")
        javascript_files = run_command("find . -name '*.js' | wc -l")
        
        if python_files and int(python_files) > 0:
            return "python"
        elif javascript_files and int(javascript_files) > 0:
            return "node"
        else:
            return "unknown"

def find_entry_point():
    """Find the main entry point of the application"""
    print_status("Looking for application entry points...")
    
    entry_points = []
    
    # Check for common Python entry points
    python_candidates = ["app.py", "main.py", "run.py", "server.py", "api.py"]
    for candidate in python_candidates:
        if os.path.exists(candidate):
            entry_points.append(("python", candidate))
    
    # Check for Flask applications
    flask_files = run_command("grep -r 'from flask import' --include='*.py' . | wc -l")
    if flask_files and int(flask_files) > 0:
        flask_apps = run_command("grep -r 'app = Flask' --include='*.py' .").split("\n")
        for app in flask_apps:
            if app:
                file_path = app.split(":")[0]
                entry_points.append(("flask", file_path))
    
    # Check for Django applications
    if os.path.exists("manage.py"):
        entry_points.append(("django", "manage.py"))
    
    # Check for Node.js entry points
    if os.path.exists("package.json"):
        with open("package.json", "r") as f:
            try:
                package_data = json.load(f)
                if "main" in package_data:
                    entry_points.append(("node", package_data["main"]))
                if "scripts" in package_data and "start" in package_data["scripts"]:
                    entry_points.append(("npm", package_data["scripts"]["start"]))
            except json.JSONDecodeError:
                print_status("Error parsing package.json")
    
    # Check for common Node.js entry points
    node_candidates = ["index.js", "server.js", "app.js", "main.js"]
    for candidate in node_candidates:
        if os.path.exists(candidate):
            entry_points.append(("node", candidate))
    
    return entry_points

def identify_api_endpoints():
    """Identify API endpoints defined in the application"""
    print_status("Identifying API endpoints...")
    
    endpoints = []
    
    # Check for Flask/FastAPI routes
    flask_routes = run_command("grep -r '@app.route\\|@router.route\\|@app.get\\|@app.post\\|@app.put\\|@app.delete' --include='*.py' .")
    if flask_routes:
        for line in flask_routes.split("\n"):
            if line:
                file_path, route_def = line.split(":", 1)
                route_def = route_def.strip()
                if "route" in route_def or any(method in route_def for method in ["get", "post", "put", "delete"]):
                    endpoints.append({"file": file_path, "route": route_def})
    
    # Check for Express routes
    express_routes = run_command("grep -r 'app.get(\\|app.post(\\|app.put(\\|app.delete(\\|router.get(\\|router.post(\\|router.put(\\|router.delete(' --include='*.js' .")
    if express_routes:
        for line in express_routes.split("\n"):
            if line:
                file_path, route_def = line.split(":", 1)
                route_def = route_def.strip()
                endpoints.append({"file": file_path, "route": route_def})
    
    return endpoints

def start_application(entry_points):
    """Start the application using the identified entry point"""
    print_status("Attempting to start the application...")
    
    if not entry_points:
        print_status("No entry points found. Unable to start the application.")
        add_issue(
            "Application Startup", 
            "No entry points found to start the application.",
            "High"
        )
        return None
    
    # Try each entry point until one works
    for app_type, entry_point in entry_points:
        print_status(f"Trying to start with {app_type}: {entry_point}")
        
        if app_type == "python":
            cmd = f"python {entry_point}"
            try:
                # Start in a separate process
                process = subprocess.Popen(
                    cmd,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                # Give it some time to start
                time.sleep(5)
                
                # Check if it's running
                if process.poll() is None:
                    print_status(f"Application started successfully with command: {cmd}")
                    return process
                else:
                    stdout, stderr = process.communicate()
                    print_status(f"Application failed to start: {stderr}")
                    add_issue(
                        "Application Startup", 
                        f"Failed to start with command: {cmd}. Error: {stderr}",
                        "High",
                        [entry_point]
                    )
            except Exception as e:
                print_status(f"Error starting application: {e}")
                add_issue(
                    "Application Startup", 
                    f"Exception when starting with command: {cmd}. Error: {str(e)}",
                    "High",
                    [entry_point]
                )
        
        elif app_type == "flask":
            cmd = f"FLASK_APP={entry_point} FLASK_ENV=development flask run --host=0.0.0.0 --port=5000"
            try:
                process = subprocess.Popen(
                    cmd,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                time.sleep(5)
                
                if process.poll() is None:
                    print_status(f"Flask application started successfully with command: {cmd}")
                    return process
                else:
                    stdout, stderr = process.communicate()
                    print_status(f"Flask application failed to start: {stderr}")
                    add_issue(
                        "Application Startup", 
                        f"Failed to start Flask app with command: {cmd}. Error: {stderr}",
                        "High",
                        [entry_point]
                    )
            except Exception as e:
                print_status(f"Error starting Flask application: {e}")
                add_issue(
                    "Application Startup", 
                    f"Exception when starting Flask app with command: {cmd}. Error: {str(e)}",
                    "High",
                    [entry_point]
                )
        
        elif app_type == "django":
            cmd = f"python {entry_point} runserver 0.0.0.0:8000"
            try:
                process = subprocess.Popen(
                    cmd,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                time.sleep(5)
                
                if process.poll() is None:
                    print_status(f"Django application started successfully with command: {cmd}")
                    return process
                else:
                    stdout, stderr = process.communicate()
                    print_status(f"Django application failed to start: {stderr}")
                    add_issue(
                        "Application Startup", 
                        f"Failed to start Django app with command: {cmd}. Error: {stderr}",
                        "High",
                        [entry_point]
                    )
            except Exception as e:
                print_status(f"Error starting Django application: {e}")
                add_issue(
                    "Application Startup", 
                    f"Exception when starting Django app with command: {cmd}. Error: {str(e)}",
                    "High",
                    [entry_point]
                )
        
        elif app_type == "node":
            cmd = f"node {entry_point}"
            try:
                process = subprocess.Popen(
                    cmd,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                time.sleep(5)
                
                if process.poll() is None:
                    print_status(f"Node.js application started successfully with command: {cmd}")
                    return process
                else:
                    stdout, stderr = process.communicate()
                    print_status(f"Node.js application failed to start: {stderr}")
                    add_issue(
                        "Application Startup", 
                        f"Failed to start Node.js app with command: {cmd}. Error: {stderr}",
                        "High",
                        [entry_point]
                    )
            except Exception as e:
                print_status(f"Error starting Node.js application: {e}")
                add_issue(
                    "Application Startup", 
                    f"Exception when starting Node.js app with command: {cmd}. Error: {str(e)}",
                    "High",
                    [entry_point]
                )
        
        elif app_type == "npm":
            cmd = f"npm start"
            try:
                process = subprocess.Popen(
                    cmd,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                time.sleep(5)
                
                if process.poll() is None:
                    print_status(f"NPM start command executed successfully: {cmd}")
                    return process
                else:
                    stdout, stderr = process.communicate()
                    print_status(f"NPM start command failed: {stderr}")
                    add_issue(
                        "Application Startup", 
                        f"Failed to start app with npm start. Error: {stderr}",
                        "High",
                        ["package.json"]
                    )
            except Exception as e:
                print_status(f"Error executing NPM start command: {e}")
                add_issue(
                    "Application Startup", 
                    f"Exception when executing npm start. Error: {str(e)}",
                    "High",
                    ["package.json"]
                )
    
    print_status("All startup methods failed. Unable to start the application.")
    return None

def is_port_in_use(port):
    """Check if a port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def test_api_endpoint(url, method="GET", data=None, headers=None):
    """Test an API endpoint and return the result"""
    print_status(f"Testing endpoint: {method} {url}")
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            print_status(f"Unsupported method: {method}")
            return None
        
        print_status(f"Response: {response.status_code} - {response.text[:100]}...")
        return response
    except requests.exceptions.RequestException as e:
        print_status(f"Error making request: {e}")
        return None

def scan_for_frontend_issues():
    """Scan for frontend-related issues"""
    print_status("Scanning for frontend issues...")
    
    # Check for common frontend frameworks
    frameworks = {
        "React": ["react", "react-dom", "jsx"],
        "Vue": ["vue", "vue-router", "vuex"],
        "Angular": ["angular", "@angular", "ng"],
        "Svelte": ["svelte"],
        "jQuery": ["jquery", "$"]
    }
    
    # Look for framework usage
    for framework, keywords in frameworks.items():
        for keyword in keywords:
            result = run_command(f"grep -r '{keyword}' --include='*.js' --include='*.html' --include='*.jsx' --include='*.vue' --include='*.ts' . | wc -l")
            if result and int(result) > 0:
                print_status(f"Found {framework} framework usage")
    
    # Check for CSS frameworks
    css_frameworks = ["bootstrap", "tailwind", "bulma", "foundation", "materialize"]
    for framework in css_frameworks:
        result = run_command(f"grep -r '{framework}' --include='*.html' --include='*.css' --include='*.js' . | wc -l")
        if result and int(result) > 0:
            print_status(f"Found {framework} CSS framework usage")
    
    # Look for broken image links
    broken_images = run_command("grep -r 'src=[\"\\']' --include='*.html' --include='*.js' --include='*.jsx' --include='*.vue' . | grep -i 'img\\|image'")
    if broken_images:
        image_paths = []
        for line in broken_images.split("\n"):
            if line:
                # Extract src attribute
                parts = line.split("src=")
                if len(parts) > 1:
                    src = parts[1].split('"')[1] if '"' in parts[1] else parts[1].split("'")[1]
                    if not src.startswith(("http", "https", "data:", "//")):
                        image_paths.append(src)
        
        for path in image_paths:
            if not os.path.exists(path):
                print_status(f"Broken image link found: {path}")
                add_issue(
                    "Frontend - Broken Images", 
                    f"Image link '{path}' points to a non-existent file",
                    "Medium"
                )
    
    # Check for JavaScript errors
    js_errors = run_command("grep -r 'console.error\\|throw new Error' --include='*.js' --include='*.jsx' --include='*.vue' .")
    if js_errors:
        print_status("Potential JavaScript error handling found:")
        for line in js_errors.split("\n"):
            if line:
                print_status(f"  {line}")

def scan_for_backend_issues():
    """Scan for backend-related issues"""
    print_status("Scanning for backend issues...")
    
    # Look for database connection issues
    db_connections = run_command("grep -r 'connect\\|createConnection\\|MongoClient\\|mongoose.connect\\|new Sequelize\\|psycopg2\\|sqlite3\\|pymysql\\|mysql\\|postgres' --include='*.py' --include='*.js' .")
    if db_connections:
        print_status("Database connection code found:")
        for line in db_connections.split("\n"):
            if line:
                file_path = line.split(":")[0]
                # Check for hardcoded credentials
                if any(cred in line for cred in ["password", "passwd", "pwd", "user", "username", "root", "admin"]):
                    print_status(f"  Potential hardcoded database credentials in {file_path}")
                    add_issue(
                        "Backend - Database Security", 
                        f"Potential hardcoded database credentials in {file_path}",
                        "High",
                        [file_path]
                    )
    
    # Check for API key management
    api_keys = run_command("grep -r 'API_KEY\\|api_key\\|apiKey\\|api-key\\|OPENAI_API_KEY\\|key=\\|token=\\|auth=' --include='*.py' --include='*.js' --include='*.jsx' --include='*.vue' --include='*.env' .")
    if api_keys:
        print_status("API key references found:")
        for line in api_keys.split("\n"):
            if line:
                file_path = line.split(":")[0]
                # Skip .env files which are designed for env vars
                if not file_path.endswith(".env") and not "os.getenv" in line and not "process.env" in line:
                    print_status(f"  Potential hardcoded API key in {file_path}")
                    add_issue(
                        "Backend - API Security", 
                        f"Potential hardcoded API key in {file_path}",
                        "High",
                        [file_path]
                    )
    
    # Check for error handling
    error_handling = run_command("grep -r 'try\\|except\\|catch\\|throw' --include='*.py' --include='*.js' .")
    if not error_handling or int(run_command("echo " + error_handling + " | wc -l")) < 5:
        print_status("Limited error handling found in the codebase")
        add_issue(
            "Backend - Error Handling", 
            "Limited or missing error handling in the application code",
            "Medium"
        )

def test_application_features(app_process):
    """Test the main features of the application"""
    print_status("Testing application features...")
    
    # Check if app is running
    if app_process is None:
        print_status("Application is not running. Cannot test features.")
        return
    
    # Check if common ports are in use
    ports_to_check = [5000, 8000, 3000, 4000]
    active_ports = []
    
    for port in ports_to_check:
        if is_port_in_use(port):
            active_ports.append(port)
            print_status(f"Port {port} is in use - potential application endpoint")
    
    if not active_ports:
        print_status("No common web ports are in use. The application might not be running correctly.")
        add_issue(
            "Application Accessibility", 
            "Application does not seem to be binding to any common web ports",
            "High"
        )
        return
    
    # Try to connect to the application
    for port in active_ports:
        try:
            response = requests.get(f"http://localhost:{port}", timeout=5)
            print_status(f"Successfully connected to application on port {port} - Status: {response.status_code}")
            
            # Check if we got HTML or JSON
            content_type = response.headers.get('Content-Type', '')
            if 'html' in content_type:
                print_status("Application appears to serve an HTML frontend")
                # We could perform more specific frontend tests here
            elif 'json' in content_type:
                print_status("Application appears to serve a JSON API")
                # We could test specific API endpoints here
        except requests.exceptions.RequestException as e:
            print_status(f"Failed to connect to application on port {port}: {e}")
            add_issue(
                "Application Connectivity", 
                f"Cannot connect to the application on port {port}",
                "High"
            )
    
    # Scan for frontend and backend issues
    scan_for_frontend_issues()
    scan_for_backend_issues()

def save_issues_to_markdown():
    """Save the identified issues to the issues_tracker.md file"""
    print_status("Saving issues to issues_tracker.md...")
    
    markdown_content = """# RezGuruAI - Issues Tracker

This document tracks the issues identified in the RezGuruAI application and the implemented fixes.

## Issue Identification Date: {date}

## Non-functioning Features

| Issue ID | Feature | Description | Priority | Status |
|----------|---------|-------------|----------|--------|
{issues_table}

## Root Causes Analysis

| Issue ID | Root Cause | Files Affected |
|----------|------------|----------------|
{root_causes_table}

## Implemented Fixes

| Issue ID | Fix Description | Files Modified | Implementation Date | Status |
|----------|----------------|----------------|---------------------|--------|
{fixes_table}

## Testing Notes

| Issue ID | Test Procedure | Expected Result | Actual Result | Tester |
|----------|----------------|-----------------|---------------|--------|
{testing_table}

## Additional Notes

- Additional testing may be required to identify all issues
- Some issues might be interrelated and require coordinated fixes
- Consult the original repository documentation for expected functionality

""".format(
        date=time.strftime("%Y-%m-%d"),
        issues_table="\n".join([f"| {issue['id']} | {issue['feature']} | {issue['description']} | {issue['priority']} | {issue['status']} |" for issue in issues]),
        root_causes_table="\n".join([f"| {issue['id']} | To be analyzed | {', '.join(issue['files_affected'])} |" for issue in issues if issue['files_affected']]),
        fixes_table="\n".join([f"| {issue['id']} | | | | Pending |" for issue in issues]),
        testing_table="\n".join([f"| {issue['id']} | | | | |" for issue in issues])
    )
    
    # Save to the issues_tracker.md file in the parent directory
    with open("../issues_tracker.md", "w") as f:
        f.write(markdown_content)
    
    print_status(f"Saved {len(issues)} issues to ../issues_tracker.md")

def main():
    """Main function to test the application"""
    print_status("Starting RezGuruAI Application Testing")
    
    # Change to the repository directory if needed
    repo_dir = "RezGuruAI"
    if os.path.basename(os.getcwd()) != repo_dir and os.path.exists(repo_dir):
        os.chdir(repo_dir)
        print_status(f"Changed directory to {os.getcwd()}")
    
    # Detect application type
    app_type = detect_application_type()
    print_status(f"Detected application type: {app_type}")
    
    # Find entry points
    entry_points = find_entry_point()
    print_status(f"Found {len(entry_points)} potential entry points:")
    for app_type, entry_point in entry_points:
        print_status(f"  - {app_type}: {entry_point}")
    
    # Identify API endpoints
    endpoints = identify_api_endpoints()
    print_status(f"Found {len(endpoints)} potential API endpoints")
    
    # Start the application
    app_process = start_application(entry_points)
    
    # Test application features
    if app_process:
        test_application_features(app_process)
        
        # Stop the application
        print_status("Stopping the application...")
        app_process.terminate()
        app_process.wait()
    
    # Save issues to markdown
    save_issues_to_markdown()
    
    print_status("Testing completed. Check the issues_tracker.md file for identified issues.")

if __name__ == "__main__":
    main()
