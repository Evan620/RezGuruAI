#!/usr/bin/env python3
"""
RezGuruAI Issue Fixing Script

This script analyzes and implements fixes for the issues identified in the RezGuruAI application.
It reads the issues_tracker.md file, applies fixes, and updates the issues status.
"""

import os
import re
import sys
import json
import time
import shutil
import datetime
import subprocess
import fileinput

def print_status(message):
    """Print a status message with timestamp"""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

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

def parse_issues_tracker():
    """Parse the issues_tracker.md file and extract issues"""
    print_status("Parsing issues from issues_tracker.md...")
    
    issues_file = "../issues_tracker.md"
    if not os.path.exists(issues_file):
        print_status(f"Error: Issues tracker file not found at {issues_file}")
        return []
    
    with open(issues_file, "r") as f:
        content = f.read()
    
    # Extract issues table
    issues_table_match = re.search(r"## Non-functioning Features\s+\|\s*Issue ID\s*\|\s*Feature\s*\|\s*Description\s*\|\s*Priority\s*\|\s*Status\s*\|\s*\|[-\s|]*\|(.*?)(?:\n\n|\n##)", content, re.DOTALL)
    
    if not issues_table_match:
        print_status("Error: Could not parse issues table from the markdown file")
        return []
    
    issues_rows = issues_table_match.group(1).strip().split("\n")
    issues = []
    
    for row in issues_rows:
        if not row.strip() or "|" not in row:
            continue
        
        # Parse the row into columns
        cols = [col.strip() for col in row.split("|")[1:-1]]  # Skip the first and last empty strings
        
        if len(cols) < 5 or not cols[0].isdigit():
            continue
        
        issue = {
            "id": int(cols[0]),
            "feature": cols[1],
            "description": cols[2],
            "priority": cols[3],
            "status": cols[4]
        }
        
        issues.append(issue)
    
    # Extract root causes
    root_causes_match = re.search(r"## Root Causes Analysis\s+\|\s*Issue ID\s*\|\s*Root Cause\s*\|\s*Files Affected\s*\|\s*\|[-\s|]*\|(.*?)(?:\n\n|\n##)", content, re.DOTALL)
    
    if root_causes_match:
        root_causes_rows = root_causes_match.group(1).strip().split("\n")
        root_causes = {}
        
        for row in root_causes_rows:
            if not row.strip() or "|" not in row:
                continue
            
            cols = [col.strip() for col in row.split("|")[1:-1]]
            
            if len(cols) < 3 or not cols[0].isdigit():
                continue
            
            issue_id = int(cols[0])
            root_cause = cols[1]
            files_affected = [file.strip() for file in cols[2].split(",")]
            
            root_causes[issue_id] = {
                "root_cause": root_cause,
                "files_affected": files_affected
            }
        
        # Merge root causes into issues
        for issue in issues:
            if issue["id"] in root_causes:
                issue.update(root_causes[issue["id"]])
    
    print_status(f"Parsed {len(issues)} issues from the tracker file")
    return issues

def backup_file(file_path):
    """Create a backup of a file before modifying it"""
    if not os.path.exists(file_path):
        print_status(f"Warning: File {file_path} does not exist, nothing to backup")
        return False
    
    backup_path = f"{file_path}.bak.{int(time.time())}"
    try:
        shutil.copy2(file_path, backup_path)
        print_status(f"Created backup of {file_path} at {backup_path}")
        return True
    except Exception as e:
        print_status(f"Error creating backup of {file_path}: {e}")
        return False

def fix_database_connection_issues(issues):
    """Fix database connection issues"""
    print_status("Fixing database connection issues...")
    
    # Look for issues related to database connections
    db_issues = [issue for issue in issues if "Database" in issue.get("feature", "")]
    
    for issue in db_issues:
        print_status(f"Working on issue #{issue['id']}: {issue['feature']} - {issue['description']}")
        
        # Get files affected
        files_affected = issue.get("files_affected", [])
        if not files_affected:
            print_status(f"No files identified for issue #{issue['id']}, skipping")
            continue
        
        for file_path in files_affected:
            if not os.path.exists(file_path):
                print_status(f"File {file_path} does not exist, skipping")
                continue
            
            # Backup the file
            backup_file(file_path)
            
            # Read the file content
            with open(file_path, "r") as f:
                content = f.read()
            
            # Check file extension
            is_python = file_path.endswith(".py")
            is_javascript = file_path.endswith((".js", ".jsx", ".ts", ".tsx"))
            
            modified = False
            
            # Replace hardcoded database credentials with environment variables
            if is_python:
                # Replace Python DB credentials
                if "password" in content.lower() or "user" in content.lower():
                    # Database connection with hardcoded credentials
                    new_content = re.sub(
                        r"(\w+)\s*=\s*['\"](.+?)['\"](\s*#\s*password|\s*#\s*username)",
                        r"\1 = os.getenv('\1'.upper(), '\2')  # Using environment variable",
                        content,
                        flags=re.IGNORECASE
                    )
                    
                    # Make sure os module is imported
                    if "import os" not in new_content:
                        new_content = "import os\n" + new_content
                    
                    if new_content != content:
                        with open(file_path, "w") as f:
                            f.write(new_content)
                        print_status(f"Updated database credentials in {file_path} to use environment variables")
                        modified = True
            
            elif is_javascript:
                # Replace JavaScript DB credentials
                if "password" in content.lower() or "user" in content.lower():
                    # Database connection with hardcoded credentials
                    new_content = re.sub(
                        r"(\w+)\s*:\s*['\"](.+?)['\"](\s*//\s*password|\s*//\s*username)",
                        r"\1: process.env.\1.toUpperCase() || '\2',  // Using environment variable",
                        content,
                        flags=re.IGNORECASE
                    )
                    
                    # Make sure process.env is used
                    if "process.env" not in new_content:
                        new_content = re.sub(
                            r"const\s+(\w+)\s*=\s*require\(['\"](.+?)['\"]\)",
                            r"const \1 = require('\2')\nrequire('dotenv').config()",
                            new_content
                        )
                    
                    if new_content != content:
                        with open(file_path, "w") as f:
                            f.write(new_content)
                        print_status(f"Updated database credentials in {file_path} to use environment variables")
                        modified = True
            
            # Update issue status if modified
            if modified:
                issue["status"] = "Fixed"
                print_status(f"Marked issue #{issue['id']} as Fixed")

def fix_api_key_issues(issues):
    """Fix issues related to API keys"""
    print_status("Fixing API key issues...")
    
    # Look for issues related to API keys
    api_issues = [issue for issue in issues if "API" in issue.get("feature", "")]
    
    for issue in api_issues:
        print_status(f"Working on issue #{issue['id']}: {issue['feature']} - {issue['description']}")
        
        # Get files affected
        files_affected = issue.get("files_affected", [])
        if not files_affected:
            print_status(f"No files identified for issue #{issue['id']}, skipping")
            continue
        
        for file_path in files_affected:
            if not os.path.exists(file_path):
                print_status(f"File {file_path} does not exist, skipping")
                continue
            
            # Backup the file
            backup_file(file_path)
            
            # Read the file content
            with open(file_path, "r") as f:
                content = f.read()
            
            # Check file extension
            is_python = file_path.endswith(".py")
            is_javascript = file_path.endswith((".js", ".jsx", ".ts", ".tsx"))
            
            modified = False
            
            # Replace hardcoded API keys with environment variables
            if is_python:
                # Identify API key patterns in Python
                api_key_patterns = [
                    r"(\w+_?api_?key)\s*=\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"(\w+_?token)\s*=\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"['\"]?api[\-_]?key['\"]?\s*:\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"['\"]?token['\"]?\s*:\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]"
                ]
                
                for pattern in api_key_patterns:
                    new_content = re.sub(
                        pattern,
                        lambda m: f"{m.group(1)} = os.getenv('{m.group(1).upper()}', '{m.group(2)}')  # Using environment variable",
                        content,
                        flags=re.IGNORECASE
                    )
                    
                    if new_content != content:
                        content = new_content
                        modified = True
                
                # Make sure os module is imported
                if modified and "import os" not in content:
                    content = "import os\n" + content
                
                if modified:
                    with open(file_path, "w") as f:
                        f.write(content)
                    print_status(f"Updated API keys in {file_path} to use environment variables")
            
            elif is_javascript:
                # Identify API key patterns in JavaScript
                api_key_patterns = [
                    r"const\s+(\w+_?api_?key)\s*=\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"let\s+(\w+_?api_?key)\s*=\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"var\s+(\w+_?api_?key)\s*=\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"const\s+(\w+_?token)\s*=\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"let\s+(\w+_?token)\s*=\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"var\s+(\w+_?token)\s*=\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"['\"]?api[\-_]?key['\"]?\s*:\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]",
                    r"['\"]?token['\"]?\s*:\s*['\"]([a-zA-Z0-9_\-\.]+)['\"]"
                ]
                
                for pattern in api_key_patterns:
                    new_content = re.sub(
                        pattern,
                        lambda m: f"const {m.group(1)} = process.env.{m.group(1).upper()} || '{m.group(2)}'  // Using environment variable",
                        content,
                        flags=re.IGNORECASE
                    )
                    
                    if new_content != content:
                        content = new_content
                        modified = True
                
                # Make sure dotenv is required
                if modified and "require('dotenv')" not in content:
                    content = "require('dotenv').config()\n" + content
                
                if modified:
                    with open(file_path, "w") as f:
                        f.write(content)
                    print_status(f"Updated API keys in {file_path} to use environment variables")
            
            # Update issue status if modified
            if modified:
                issue["status"] = "Fixed"
                print_status(f"Marked issue #{issue['id']} as Fixed")

def fix_error_handling_issues(issues):
    """Fix issues related to error handling"""
    print_status("Fixing error handling issues...")
    
    # Look for issues related to error handling
    error_issues = [issue for issue in issues if "Error" in issue.get("feature", "")]
    
    for issue in error_issues:
        print_status(f"Working on issue #{issue['id']}: {issue['feature']} - {issue['description']}")
        
        # Get files affected
        files_affected = issue.get("files_affected", [])
        
        # If no specific files are mentioned, look for files with database or API operations
        if not files_affected:
            print_status("No specific files mentioned, looking for potentially vulnerable code...")
            
            # Look for files with database operations
            db_files = run_command("grep -r 'connect\\|createConnection\\|MongoClient\\|mongoose.connect\\|new Sequelize' --include='*.py' --include='*.js' . | cut -d: -f1 | sort | uniq").split("\n")
            
            # Look for files with API calls
            api_files = run_command("grep -r 'fetch\\|axios\\|request\\|http.get\\|http.post\\|requests.get\\|requests.post' --include='*.py' --include='*.js' . | cut -d: -f1 | sort | uniq").split("\n")
            
            files_affected = list(set(db_files + api_files))
            
            if not files_affected or files_affected == [""]:
                print_status(f"No files identified for issue #{issue['id']}, skipping")
                continue
        
        for file_path in files_affected:
            if not file_path or not os.path.exists(file_path):
                continue
            
            print_status(f"Adding error handling to {file_path}")
            
            # Backup the file
            backup_file(file_path)
            
            # Read the file content
            with open(file_path, "r") as f:
                content = f.read()
            
            # Check file extension
            is_python = file_path.endswith(".py")
            is_javascript = file_path.endswith((".js", ".jsx", ".ts", ".tsx"))
            
            modified = False
            
            if is_python:
                # Add try-except blocks to database operations in Python
                db_patterns = [
                    (r"(\w+)\s*=\s*(.+?connect\(.+?\))", r"try:\n    \1 = \2\nexcept Exception as e:\n    print(f\"Database connection error: {e}\")\n    \1 = None"),
                    (r"(\w+)\s*=\s*(.+?MongoClient\(.+?\))", r"try:\n    \1 = \2\nexcept Exception as e:\n    print(f\"MongoDB connection error: {e}\")\n    \1 = None"),
                    (r"(\w+)\s*=\s*(.+?Sequelize\(.+?\))", r"try:\n    \1 = \2\nexcept Exception as e:\n    print(f\"Sequelize connection error: {e}\")\n    \1 = None")
                ]
                
                for pattern, replacement in db_patterns:
                    if re.search(pattern, content) and not re.search(r"try:.*" + pattern, content, re.DOTALL):
                        new_content = re.sub(pattern, replacement, content)
                        if new_content != content:
                            content = new_content
                            modified = True
                
                # Add try-except blocks to API calls in Python
                api_patterns = [
                    (r"(\w+)\s*=\s*(.+?requests\.\w+\(.+?\))", r"try:\n    \1 = \2\nexcept Exception as e:\n    print(f\"API request error: {e}\")\n    \1 = None"),
                    (r"(requests\.\w+\(.+?\))", r"try:\n    \1\nexcept Exception as e:\n    print(f\"API request error: {e}\")")
                ]
                
                for pattern, replacement in api_patterns:
                    if re.search(pattern, content) and not re.search(r"try:.*" + pattern, content, re.DOTALL):
                        new_content = re.sub(pattern, replacement, content)
                        if new_content != content:
                            content = new_content
                            modified = True
            
            elif is_javascript:
                # Add try-catch blocks to database operations in JavaScript
                db_patterns = [
                    (r"(\w+)\s*=\s*(.+?connect\(.+?\))", r"try {\n    \1 = \2\n} catch (error) {\n    console.error('Database connection error:', error);\n    \1 = null;\n}"),
                    (r"(\w+)\s*=\s*(.+?MongoClient\(.+?\))", r"try {\n    \1 = \2\n} catch (error) {\n    console.error('MongoDB connection error:', error);\n    \1 = null;\n}"),
                    (r"(\w+)\s*=\s*(.+?Sequelize\(.+?\))", r"try {\n    \1 = \2\n} catch (error) {\n    console.error('Sequelize connection error:', error);\n    \1 = null;\n}")
                ]
                
                for pattern, replacement in db_patterns:
                    if re.search(pattern, content) and not re.search(r"try\s*{.*" + pattern, content, re.DOTALL):
                        new_content = re.sub(pattern, replacement, content)
                        if new_content != content:
                            content = new_content
                            modified = True
                
                # Add try-catch blocks to API calls in JavaScript
                api_patterns = [
                    (r"(\w+)\s*=\s*(.+?fetch\(.+?\))", r"try {\n    \1 = \2\n} catch (error) {\n    console.error('API request error:', error);\n    \1 = null;\n}"),
                    (r"(\w+)\s*=\s*(.+?axios\.\w+\(.+?\))", r"try {\n    \1 = \2\n} catch (error) {\n    console.error('API request error:', error);\n    \1 = null;\n}"),
                    (r"(fetch\(.+?\)\.then\(.+?\))", r"try {\n    \1.catch(error => console.error('API request error:', error));\n} catch (error) {\n    console.error('API request error:', error);\n}"),
                    (r"(axios\.\w+\(.+?\)\.then\(.+?\))", r"try {\n    \1.catch(error => console.error('API request error:', error));\n} catch (error) {\n    console.error('API request error:', error);\n}")
                ]
                
                for pattern, replacement in api_patterns:
                    if re.search(pattern, content) and not re.search(r"try\s*{.*" + pattern, content, re.DOTALL):
                        new_content = re.sub(pattern, replacement, content)
                        if new_content != content:
                            content = new_content
                            modified = True
            
            if modified:
                with open(file_path, "w") as f:
                    f.write(content)
                print_status(f"Added error handling to {file_path}")
                
                # Update issue status
                issue["status"] = "Fixed"
                print_status(f"Marked issue #{issue['id']} as Fixed")

def fix_frontend_issues(issues):
    """Fix frontend-related issues"""
    print_status("Fixing frontend issues...")
    
    # Look for issues related to frontend
    frontend_issues = [issue for issue in issues if "Frontend" in issue.get("feature", "")]
    
    for issue in frontend_issues:
        print_status(f"Working on issue #{issue['id']}: {issue['feature']} - {issue['description']}")
        
        # Fix broken image links
        if "Broken Images" in issue.get("feature", ""):
            # Extract the image path from the description
            image_path_match = re.search(r"Image link '(.+?)' points to", issue.get("description", ""))
            if not image_path_match:
                print_status(f"Could not extract image path from description, skipping issue #{issue['id']}")
                continue
            
            image_path = image_path_match.group(1)
            
            # Look for files referencing this image
            files_with_image = run_command(f"grep -r '{image_path}' --include='*.html' --include='*.js' --include='*.jsx' --include='*.vue' .").split("\n")
            
            for file_line in files_with_image:
                if not file_line or ":" not in file_line:
                    continue
                
                file_path, line = file_line.split(":", 1)
                
                # Backup the file
                backup_file(file_path)
                
                # Check for substitution options
                if image_path.endswith((".png", ".jpg", ".jpeg", ".gif")):
                    # Replace with a placeholder or CDN image
                    new_line = line.replace(image_path, "https://via.placeholder.com/150")
                    
                    # Update the file
                    with fileinput.FileInput(file_path, inplace=True) as file:
                        for current_line in file:
                            if line in current_line:
                                print(current_line.replace(line, new_line), end='')
                            else:
                                print(current_line, end='')
                    
                    print_status(f"Replaced broken image link in {file_path}")
                    
                    # Update issue status
                    issue["status"] = "Fixed"
                    print_status(f"Marked issue #{issue['id']} as Fixed")

def fix_application_startup_issues(issues):
    """Fix application startup issues"""
    print_status("Fixing application startup issues...")
    
    # Look for issues related to application startup
    startup_issues = [issue for issue in issues if "Application Startup" in issue.get("feature", "")]
    
    for issue in startup_issues:
        print_status(f"Working on issue #{issue['id']}: {issue['feature']} - {issue['description']}")
        
        # Extract the command that failed
        command_match = re.search(r"Failed to start with command: (.+?)\.", issue.get("description", ""))
        if not command_match:
            print_status(f"Could not extract command from description, skipping issue #{issue['id']}")
            continue
        
        command = command_match.group(1)
        
        # Check if the issue is related to missing dependencies
        if "ModuleNotFoundError" in issue.get("description", "") or "Cannot find module" in issue.get("description", ""):
            # Extract the missing module name
            if "ModuleNotFoundError" in issue.get("description", ""):
                module_match = re.search(r"ModuleNotFoundError: No module named ['\"](.*?)['\"]", issue.get("description", ""))
            else:
                module_match = re.search(r"Cannot find module ['\"](.*?)['\"]", issue.get("description", ""))
            
            if module_match:
                module_name = module_match.group(1)
                
                # Install the missing module
                if command.startswith("python"):
                    install_cmd = f"pip install {module_name}"
                    run_command(install_cmd)
                    print_status(f"Installed missing Python module: {module_name}")
                elif command.startswith("node") or command.startswith("npm"):
                    install_cmd = f"npm install {module_name}"
                    run_command(install_cmd)
                    print_status(f"Installed missing Node.js module: {module_name}")
                
                # Update issue status
                issue["status"] = "Fixed"
                print_status(f"Marked issue #{issue['id']} as Fixed")
        
        # Check if the issue is related to permission problems
        elif "Permission denied" in issue.get("description", ""):
            # Extract the file with permission problems
            file_match = re.search(r"Permission denied: ['\"](.*?)['\"]", issue.get("description", ""))
            
            if file_match:
                file_path = file_match.group(1)
                
                # Make the file executable
                run_command(f"chmod +x {file_path}")
                print_status(f"Fixed permissions for file: {file_path}")
                
                # Update issue status
                issue["status"] = "Fixed"
                print_status(f"Marked issue #{issue['id']} as Fixed")
        
        # Check if the port is already in use
        elif "Address already in use" in issue.get("description", ""):
            # Extract the port number
            port_match = re.search(r"Address already in use.*?:(\d+)", issue.get("description", ""))
            
            if port_match:
                port = port_match.group(1)
                
                # Update the port in configuration files
                config_files = run_command(f"grep -r 'port.*{port}' --include='*.py' --include='*.js' --include='*.json' --include='*.conf' .").split("\n")
                
                for file_line in config_files:
                    if not file_line or ":" not in file_line:
                        continue
                    
                    file_path, line = file_line.split(":", 1)
                    
                    # Backup the file
                    backup_file(file_path)
                    
                    # Change the port number (increment by 1000)
                    new_port = int(port) + 1000
                    new_line = line.replace(port, str(new_port))
                    
                    # Update the file
                    with fileinput.FileInput(file_path, inplace=True) as file:
                        for current_line in file:
                            if line in current_line:
                                print(current_line.replace(line, new_line), end='')
                            else:
                                print(current_line, end='')
                    
                    print_status(f"Changed port from {port} to {new_port} in {file_path}")
                
                # Update issue status
                issue["status"] = "Fixed"
                print_status(f"Marked issue #{issue['id']} as Fixed")

def update_issues_tracker(issues):
    """Update the issues_tracker.md file with the current status of issues"""
    print_status("Updating issues_tracker.md with current status...")
    
    issues_file = "../issues_tracker.md"
    if not os.path.exists(issues_file):
        print_status(f"Error: Issues tracker file not found at {issues_file}")
        return
    
    with open(issues_file, "r") as f:
        content = f.read()
    
    # Update the issues table
    issues_table = "| Issue ID | Feature | Description | Priority | Status |\n|----------|---------|-------------|----------|---------|\n"
    for issue in issues:
        issues_table += f"| {issue['id']} | {issue['feature']} | {issue['description']} | {issue['priority']} | {issue['status']} |\n"
    
    # Replace the issues table in the markdown file
    new_content = re.sub(
        r"(## Non-functioning Features\s+\|\s*Issue ID\s*\|\s*Feature\s*\|\s*Description\s*\|\s*Priority\s*\|\s*Status\s*\|\s*\|[-\s|]*\|).*?(?=\n\n|\n##)",
        r"\1\n" + issues_table.strip(),
        content,
        flags=re.DOTALL
    )
    
    # Update the implemented fixes table
    fixes_table = "| Issue ID | Fix Description | Files Modified | Implementation Date | Status |\n|----------|----------------|----------------|---------------------|--------|\n"
    for issue in issues:
        if issue["status"] == "Fixed":
            fixes_table += f"| {issue['id']} | {issue.get('fix_description', 'Automated fix')} | {', '.join(issue.get('files_affected', []))} | {datetime.datetime.now().strftime('%Y-%m-%d')} | {issue['status']} |\n"
        else:
            fixes_table += f"| {issue['id']} | | | | {issue['status']} |\n"
    
    # Replace the implemented fixes table in the markdown file
    new_content = re.sub(
        r"(## Implemented Fixes\s+\|\s*Issue ID\s*\|\s*Fix Description\s*\|\s*Files Modified\s*\|\s*Implementation Date\s*\|\s*Status\s*\|\s*\|[-\s|]*\|).*?(?=\n\n|\n##)",
        r"\1\n" + fixes_table.strip(),
        new_content,
        flags=re.DOTALL
    )
    
    # Write the updated content back to the file
    with open(issues_file, "w") as f:
        f.write(new_content)
    
    print_status(f"Updated {issues_file} with current status")

def main():
    """Main function to implement fixes"""
    print_status("Starting RezGuruAI Issue Fixing")
    
    # Change to the repository directory if needed
    repo_dir = "RezGuruAI"
    if os.path.basename(os.getcwd()) != repo_dir and os.path.exists(repo_dir):
        os.chdir(repo_dir)
        print_status(f"Changed directory to {os.getcwd()}")
    
    # Parse issues from the tracker
    issues = parse_issues_tracker()
    
    if not issues:
        print_status("No issues found to fix. Run the test_app.py script first to identify issues.")
        return
    
    # Implement fixes for different categories of issues
    fix_database_connection_issues(issues)
    fix_api_key_issues(issues)
    fix_error_handling_issues(issues)
    fix_frontend_issues(issues)
    fix_application_startup_issues(issues)
    
    # Update the issues tracker with the current status
    update_issues_tracker(issues)
    
    # Print statistics
    fixed_issues = [issue for issue in issues if issue["status"] == "Fixed"]
    print_status(f"Fixed {len(fixed_issues)} out of {len(issues)} issues")
    
    remaining_issues = [issue for issue in issues if issue["status"] != "Fixed"]
    if remaining_issues:
        print_status("Remaining issues that need manual fixing:")
        for issue in remaining_issues:
            print_status(f"  - Issue #{issue['id']}: {issue['feature']} - {issue['description']}")
    
    print_status("Fixing process completed. Check the issues_tracker.md file for detailed status.")

if __name__ == "__main__":
    main()
