#!/usr/bin/env python3
"""
RezGuruAI Environment Setup Script

This script configures the environment needed to run the RezGuruAI application.
It detects the type of application and installs required dependencies.
"""

import os
import subprocess
import sys
import json
import time

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

def setup_python_environment():
    """Set up the Python environment"""
    print_status("Setting up Python environment...")
    
    # Check for requirements.txt
    if os.path.exists("requirements.txt"):
        print_status("Installing dependencies from requirements.txt...")
        run_command("pip install -r requirements.txt")
    else:
        # Try to detect common Python packages used in the application
        print_status("No requirements.txt found. Detecting used packages...")
        
        # Find all Python files
        python_files = run_command("find . -name '*.py'").split("\n")
        
        # Extract import statements
        imports = []
        for py_file in python_files:
            if py_file and os.path.exists(py_file):
                with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
                    try:
                        content = f.read()
                        # Simple regex to find imports
                        import_lines = [line.strip() for line in content.split("\n") 
                                      if line.strip().startswith(("import ", "from "))]
                        imports.extend(import_lines)
                    except Exception as e:
                        print_status(f"Error reading file {py_file}: {e}")
        
        # Extract package names (this is a simplistic approach)
        packages = set()
        for imp in imports:
            parts = imp.split()
            if imp.startswith("import "):
                # Handle "import package" or "import package as alias"
                package = parts[1].split('.')[0].split(',')[0]
                if package not in ["os", "sys", "time", "json", "re", "math", "random", 
                                  "datetime", "collections", "itertools", "functools"]:
                    packages.add(package)
            elif imp.startswith("from "):
                # Handle "from package import something"
                package = parts[1].split('.')[0]
                if package not in ["os", "sys", "time", "json", "re", "math", "random", 
                                  "datetime", "collections", "itertools", "functools"]:
                    packages.add(package)
        
        # Install common packages that might be needed
        common_packages = [
            "flask", "django", "fastapi", "requests", "beautifulsoup4", 
            "pandas", "numpy", "matplotlib", "scikit-learn", "pytorch", 
            "tensorflow", "nltk", "spacy", "gensim", "transformers", 
            "langchain", "openai", "pinecone-client"
        ]
        
        # Install detected packages
        for package in packages:
            if package in common_packages:
                print_status(f"Installing detected package: {package}")
                run_command(f"pip install {package}")
        
        # Create a requirements.txt file for future reference
        with open("detected_requirements.txt", "w") as f:
            for package in sorted(packages):
                if package in common_packages:
                    f.write(f"{package}\n")

def setup_node_environment():
    """Set up the Node.js environment"""
    print_status("Setting up Node.js environment...")
    
    # Check for package.json
    if os.path.exists("package.json"):
        print_status("Installing dependencies from package.json...")
        run_command("npm install")
    else:
        print_status("No package.json found. Creating one...")
        
        # Create a basic package.json file
        package_json = {
            "name": "rezguruai",
            "version": "1.0.0",
            "description": "RezGuruAI Application",
            "main": "index.js",
            "scripts": {
                "start": "node index.js",
                "test": "echo \"Error: no test specified\" && exit 1"
            },
            "author": "",
            "license": "ISC",
            "dependencies": {}
        }
        
        # Find all JavaScript files
        js_files = run_command("find . -name '*.js'").split("\n")
        
        # Check for common imports
        requires = []
        for js_file in js_files:
            if js_file and os.path.exists(js_file):
                with open(js_file, 'r', encoding='utf-8', errors='ignore') as f:
                    try:
                        content = f.read()
                        # Simple regex to find requires/imports
                        require_lines = [line.strip() for line in content.split("\n") 
                                       if "require(" in line or "import " in line]
                        requires.extend(require_lines)
                    except Exception as e:
                        print_status(f"Error reading file {js_file}: {e}")
        
        # Detect common frameworks
        common_packages = {
            "express": "^4.18.2",
            "react": "^18.2.0",
            "vue": "^3.3.4",
            "angular": "^16.2.0",
            "next": "^13.4.19",
            "axios": "^1.5.0",
            "mongodb": "^5.8.1",
            "mongoose": "^7.5.0",
            "mysql": "^2.18.1",
            "postgresql": "^1.0.0",
            "sequelize": "^6.32.1",
            "socket.io": "^4.7.2",
            "lodash": "^4.17.21",
            "moment": "^2.29.4",
            "dotenv": "^16.3.1"
        }
        
        # Add detected packages
        for package_name, version in common_packages.items():
            for require_line in requires:
                if f"require('{package_name}')" in require_line or f'require("{package_name}")' in require_line or f"from '{package_name}'" in require_line or f'from "{package_name}"' in require_line:
                    package_json["dependencies"][package_name] = version
        
        # Write the package.json file
        with open("detected_package.json", "w") as f:
            json.dump(package_json, f, indent=2)
        
        # Install dependencies
        print_status("Installing detected dependencies...")
        run_command("npm install")

def main():
    """Main function to set up the environment"""
    print_status("Setting up environment for RezGuruAI...")
    
    # Change to the repository directory if needed
    repo_dir = "RezGuruAI"
    if os.path.basename(os.getcwd()) != repo_dir and os.path.exists(repo_dir):
        os.chdir(repo_dir)
        print_status(f"Changed directory to {os.getcwd()}")
    
    # Detect application type
    app_type = detect_application_type()
    print_status(f"Detected application type: {app_type}")
    
    if app_type == "python" or app_type == "hybrid":
        setup_python_environment()
    
    if app_type == "node" or app_type == "hybrid":
        setup_node_environment()
    
    if app_type == "unknown":
        print_status("Could not determine application type. Please review the codebase manually.")
        print_status("Creating fallback environment with common packages...")
        setup_python_environment()
        setup_node_environment()
    
    print_status("Environment setup completed. You may need to install additional dependencies based on application requirements.")

if __name__ == "__main__":
    main()
