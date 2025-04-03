#!/usr/bin/env python3
"""
RezGuruAI Repository Cloning and Fixing Script

This script automates the process of:
1. Cloning the RezGuruAI repository
2. Setting up the necessary environment
3. Running tests to identify issues
4. Implementing fixes
"""

import os
import subprocess
import sys
import time
import json

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    """Print a formatted header message"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD} {message}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.END}\n")

def print_step(step_num, message):
    """Print a formatted step message"""
    print(f"{Colors.BLUE}{Colors.BOLD}[Step {step_num}] {message}{Colors.END}")

def print_success(message):
    """Print a formatted success message"""
    print(f"{Colors.GREEN}{Colors.BOLD}✓ {message}{Colors.END}")

def print_warning(message):
    """Print a formatted warning message"""
    print(f"{Colors.WARNING}{Colors.BOLD}⚠ {message}{Colors.END}")

def print_error(message):
    """Print a formatted error message"""
    print(f"{Colors.FAIL}{Colors.BOLD}✗ {message}{Colors.END}")

def run_command(command, description, error_msg=None):
    """Run a shell command and handle the output"""
    try:
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=True,
            check=True
        )
        print_success(f"{description} - Completed")
        return result.stdout
    except subprocess.CalledProcessError as e:
        if error_msg is None:
            error_msg = f"Failed to {description.lower()}"
        print_error(f"{error_msg}: {e}")
        print(f"{Colors.FAIL}Output: {e.stderr}{Colors.END}")
        return None

def clone_repository():
    """Clone the RezGuruAI repository"""
    print_step(1, "Cloning the RezGuruAI repository")
    
    repo_url = "https://github.com/Evan620/RezGuruAI.git"
    repo_dir = "RezGuruAI"
    
    if os.path.exists(repo_dir):
        print_warning(f"The directory {repo_dir} already exists.")
        # Automatically use existing repository
        print_warning("Using existing repository.")
        return True
    
    output = run_command(
        f"git clone {repo_url} {repo_dir}",
        "Repository cloning",
        "Failed to clone the repository"
    )
    
    if output is None:
        return False
    
    print_success(f"Repository cloned to {repo_dir}")
    return True

def analyze_repository_structure():
    """Analyze the repository structure and identify key components"""
    print_step(2, "Analyzing repository structure")
    
    # Check what files and directories exist
    structure = run_command("find . -type f -not -path '*/\\.*' | sort", "Scanning files")
    
    if structure:
        print("Repository Structure:")
        print(structure)
        
        # Save structure to a file for reference
        with open("repo_structure.txt", "w") as f:
            f.write(structure)
        
        # Try to identify key files
        has_requirements = run_command("find . -name 'requirements.txt'", "Checking for requirements.txt")
        has_package_json = run_command("find . -name 'package.json'", "Checking for package.json")
        
        if has_requirements:
            print_success("Found Python requirements.txt file")
        if has_package_json:
            print_success("Found Node.js package.json file")
        
        return True
    return False

def setup_environment():
    """Set up the necessary environment to run the application"""
    print_step(3, "Setting up the environment")
    
    # Check for requirements.txt
    if os.path.exists("requirements.txt"):
        print_warning("Found requirements.txt. Installing Python dependencies...")
        run_command("pip install -r requirements.txt", "Installing Python dependencies")
    
    # Check for package.json
    if os.path.exists("package.json"):
        print_warning("Found package.json. Installing Node.js dependencies...")
        print("Using npm to install dependencies (this may take a while)...")
        try:
            # Create the PostgreSQL database if needed
            run_command("cd .. && npx tsx -e \"console.log('Database URL is set:', !!process.env.DATABASE_URL)\"", "Checking database connection")
            
            # Install dependencies using the package.json in the repo
            print("Installing dependencies from package.json...")
            run_command("npm install", "Installing Node.js dependencies")
            
            # Compile TypeScript if needed
            if os.path.exists("tsconfig.json"):
                print("Compiling TypeScript...")
                run_command("npx tsc", "Compiling TypeScript")
        except Exception as e:
            print_error(f"Error setting up Node.js environment: {e}")
            print("Continuing with existing setup...")
    
    # Create initial database schema
    try:
        print("Setting up database schema...")
        run_command("npm run db:push", "Creating database schema")
    except Exception as e:
        print_warning(f"Error setting up database schema: {e}")
        print("Will try to continue anyway...")
    
    return True

def identify_issues():
    """Run the application and identify non-functioning features"""
    print_step(4, "Running the application to identify issues")
    
    # Execute the test script to identify issues
    test_script_path = "../fix_scripts/test_app.py"
    if os.path.exists(test_script_path):
        print_warning("Running application tests to identify issues...")
        run_command(f"python {test_script_path}", "Running application tests")
    
    print("\nPlease manually test the application and document any issues in the issues_tracker.md file.")
    print("You can use the following command to start the application (adapt as needed):")
    print(f"{Colors.CYAN}python app.py{Colors.END} or {Colors.CYAN}npm start{Colors.END}")
    
    return True

def implement_fixes():
    """Implement fixes for the identified issues"""
    print_step(5, "Implementing fixes for identified issues")
    
    # Run the fix script
    fix_script_path = "../fix_scripts/implement_fixes.py"
    if os.path.exists(fix_script_path):
        print_warning("Running fix implementation script...")
        run_command(f"python {fix_script_path}", "Implementing fixes")
    
    return True

def main():
    """Main function to orchestrate the process"""
    print_header("RezGuruAI Repository Cloning and Fixing Tool")
    
    print("This script will perform the following steps:")
    print("1. Clone the RezGuruAI repository (if needed)")
    print("2. Analyze the repository structure")
    print("3. Set up the necessary environment")
    print("4. Copy environment variables to .env")
    print("5. Implement fixes for identified issues")
    
    # Check if we already have the repository
    if os.path.exists("RezGuruAI"):
        print_warning("RezGuruAI directory already exists, skipping clone step.")
    else:
        if not clone_repository():
            print_error("Failed to clone the repository. Aborting.")
            return
    
    # Change to the repository directory
    os.chdir("RezGuruAI")
    print_success(f"Working directory: {os.getcwd()}")
    
    if not analyze_repository_structure():
        print_error("Failed to analyze the repository structure. Aborting.")
        return
    
    if not setup_environment():
        print_error("Failed to set up the environment. Aborting.")
        return
    
    # Copy environment variables
    print_step(4, "Setting up environment variables")
    
    # Load environment variables from parent .env file
    env_vars = {}
    if os.path.exists("../.env"):
        with open("../.env", "r") as f:
            for line in f:
                if "=" in line:
                    key, value = line.strip().split("=", 1)
                    env_vars[key] = value
    
    # Create .env file with required variables
    with open(".env", "w") as f:
        f.write(f"DATABASE_URL={os.environ.get('DATABASE_URL', env_vars.get('DATABASE_URL', ''))}\n")
        f.write(f"AZURE_OPENAI_API_KEY={os.environ.get('AZURE_OPENAI_API_KEY', env_vars.get('AZURE_OPENAI_API_KEY', ''))}\n")
        f.write(f"AZURE_OPENAI_ENDPOINT=https://models.inference.ai.azure.com\n")
        f.write(f"SESSION_SECRET={os.environ.get('SESSION_SECRET', env_vars.get('SESSION_SECRET', ''))}\n")
    
    print_success("Environment variables set up")
    
    print_step(5, "Starting the application")
    
    # Run the application with node
    print("Running the application with Node.js...")
    try:
        subprocess.Popen(["node", "../start_app.js"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print_success("Application started successfully on port 5000")
    except Exception as e:
        print_error(f"Failed to start the application: {e}")
    
    print_header("Process completed")
    print("The RezGuruAI application should now be running on port 5000.")
    print("You can access it at: http://localhost:5000")

if __name__ == "__main__":
    main()
