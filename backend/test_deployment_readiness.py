#!/usr/bin/env python3
"""
Deployment Readiness Test Script

Run this script before deploying to Render to verify everything is configured correctly.
"""

import os
import sys
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{text:^60}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✓{RESET} {text}")

def print_error(text):
    print(f"{RED}✗{RESET} {text}")

def print_warning(text):
    print(f"{YELLOW}⚠{RESET} {text}")

def print_info(text):
    print(f"{BLUE}ℹ{RESET} {text}")

def check_file_exists(filepath, description):
    """Check if a required file exists"""
    if Path(filepath).exists():
        print_success(f"{description} exists: {filepath}")
        return True
    else:
        print_error(f"{description} missing: {filepath}")
        return False

def check_requirements():
    """Check requirements.txt for critical packages"""
    print_header("Checking requirements.txt")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'PyMuPDF',  # Critical - was missing
        'pymongo',
        'motor',
        'langchain',
        'langchain-google-genai',
        'chromadb',
        'sentence-transformers',
        'python-jose',
        'passlib',
        'pydantic-settings',
    ]
    
    if not check_file_exists('requirements.txt', 'requirements.txt'):
        return False
    
    with open('requirements.txt', 'r') as f:
        content = f.read().lower()
    
    all_present = True
    for package in required_packages:
        if package.lower() in content:
            print_success(f"Package found: {package}")
        else:
            print_error(f"Package missing: {package}")
            all_present = False
    
    return all_present

def check_render_yaml():
    """Check render.yaml configuration"""
    print_header("Checking render.yaml")
    
    if not check_file_exists('render.yaml', 'render.yaml'):
        return False
    
    with open('render.yaml', 'r') as f:
        content = f.read()
    
    checks = [
        ('rootDir: backend', 'Root directory set to backend'),
        ('mountPath: /data', 'Persistent disk configured'),
        ('$PORT', 'PORT variable used in start command'),
        ('CHROMA_PERSIST_DIR', 'ChromaDB persist dir configured'),
        ('MONGODB_URL', 'MongoDB URL variable present'),
        ('CORS_ORIGINS', 'CORS origins configurable'),
        ('JWT_SECRET_KEY', 'JWT secret configurable'),
    ]
    
    all_present = True
    for check_str, description in checks:
        if check_str in content:
            print_success(description)
        else:
            print_error(f"Missing: {description}")
            all_present = False
    
    return all_present

def check_environment_config():
    """Check environment configuration in config.py"""
    print_header("Checking Configuration")
    
    config_path = 'app/core/config.py'
    if not check_file_exists(config_path, 'config.py'):
        return False
    
    with open(config_path, 'r') as f:
        content = f.read()
    
    checks = [
        ('os.environ.get("PORT"', 'PORT reads from environment'),
        ('CHROMA_PERSIST_DIR', 'ChromaDB directory configurable'),
        ('MONGODB_URL', 'MongoDB URL configurable'),
        ('CORS_ORIGINS', 'CORS origins configurable'),
        ('JWT_SECRET_KEY', 'JWT secret configurable'),
    ]
    
    all_present = True
    for check_str, description in checks:
        if check_str in content:
            print_success(description)
        else:
            print_warning(f"Check manually: {description}")
            all_present = False
    
    return all_present

def check_imports():
    """Check for critical imports"""
    print_header("Checking Imports")
    
    try:
        print_info("Testing imports...")
        
        # Test critical imports
        imports_to_test = [
            ('fastapi', 'FastAPI'),
            ('uvicorn', 'Uvicorn'),
            ('pymongo', 'PyMongo'),
            ('motor', 'Motor (async MongoDB)'),
            ('chromadb', 'ChromaDB'),
            ('sentence_transformers', 'Sentence Transformers'),
            ('langchain', 'LangChain'),
            ('jose', 'Python-JOSE (JWT)'),
            ('passlib', 'Passlib (password hashing)'),
            ('pydantic_settings', 'Pydantic Settings'),
        ]
        
        all_imports_work = True
        for module_name, description in imports_to_test:
            try:
                __import__(module_name)
                print_success(f"{description} can be imported")
            except ImportError:
                print_error(f"{description} cannot be imported - install dependencies")
                all_imports_work = False
        
        return all_imports_work
    
    except Exception as e:
        print_error(f"Import test failed: {e}")
        return False

def check_pymupdf():
    """Special check for PyMuPDF (critical fix)"""
    print_header("Checking PyMuPDF (Critical)")
    
    try:
        import fitz  # PyMuPDF
        print_success("PyMuPDF (fitz) is installed ✓")
        print_info(f"PyMuPDF version: {fitz.version}")
        return True
    except ImportError:
        print_error("PyMuPDF (fitz) is NOT installed!")
        print_error("This will cause PDF processing to fail!")
        print_info("Install with: pip install PyMuPDF==1.23.26")
        return False

def check_env_example():
    """Check environment example files"""
    print_header("Checking Environment Examples")
    
    files = [
        ('.env.example', 'Development environment example'),
        ('.env.production.example', 'Production environment example'),
    ]
    
    all_present = True
    for filepath, description in files:
        if check_file_exists(filepath, description):
            # Check if it contains actual keys (shouldn't in example)
            with open(filepath, 'r') as f:
                content = f.read()
            
            if 'AIzaSy' in content and len([line for line in content.split('\n') if 'AIzaSy' in line and not line.strip().startswith('#')]) > 0:
                print_warning(f"  ⚠ {filepath} contains an actual API key - should be placeholder")
        else:
            all_present = False
    
    return all_present

def check_documentation():
    """Check if deployment documentation exists"""
    print_header("Checking Documentation")
    
    docs = [
        ('RENDER_DEPLOYMENT.md', 'Render deployment guide'),
        ('DEPLOYMENT_SUMMARY.md', 'Deployment summary'),
        ('.env.production.example', 'Production environment example'),
    ]
    
    all_present = True
    for filepath, description in docs:
        if not check_file_exists(filepath, description):
            all_present = False
    
    return all_present

def check_gitignore():
    """Check if .env is in .gitignore"""
    print_header("Checking .gitignore")
    
    if not check_file_exists('.gitignore', '.gitignore'):
        print_warning(".gitignore not found - create one!")
        return False
    
    with open('.gitignore', 'r') as f:
        content = f.read()
    
    if '.env' in content:
        print_success(".env is in .gitignore ✓")
        return True
    else:
        print_error(".env is NOT in .gitignore - SECURITY RISK!")
        print_info("Add '.env' to .gitignore immediately!")
        return False

def main():
    """Run all checks"""
    print_header("🚀 RENDER DEPLOYMENT READINESS CHECK 🚀")
    
    # Change to backend directory if needed
    if Path('backend').exists() and not Path('requirements.txt').exists():
        os.chdir('backend')
        print_info("Changed directory to backend/")
    
    results = {
        'Requirements': check_requirements(),
        'Render YAML': check_render_yaml(),
        'Configuration': check_environment_config(),
        'PyMuPDF (Critical)': check_pymupdf(),
        'Environment Examples': check_env_example(),
        'Documentation': check_documentation(),
        'Git Ignore': check_gitignore(),
    }
    
    # Try imports if requirements exist
    if results['Requirements']:
        results['Imports'] = check_imports()
    
    # Summary
    print_header("SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for check, result in results.items():
        if result:
            print_success(f"{check}: PASS")
        else:
            print_error(f"{check}: FAIL")
    
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Result: {passed}/{total} checks passed{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    if passed == total:
        print_success("✓ ALL CHECKS PASSED - READY FOR DEPLOYMENT! 🎉")
        print_info("\nNext steps:")
        print_info("1. Review RENDER_DEPLOYMENT.md for deployment instructions")
        print_info("2. Set up MongoDB Atlas")
        print_info("3. Get Google API key")
        print_info("4. Create Render web service")
        print_info("5. Set environment variables in Render Dashboard")
        print_info("6. Deploy!")
        return 0
    else:
        print_error(f"✗ {total - passed} CHECKS FAILED - FIX ISSUES BEFORE DEPLOYING")
        print_warning("\nReview the errors above and fix them before deploying to Render.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
