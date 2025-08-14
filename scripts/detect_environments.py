#!/usr/bin/env python3
"""
Environment detection script for Flowboard
"""

import sys
import json
import subprocess
import shutil

def detect_python():
    """Detect Python installations"""
    python_versions = []
    
    # Check common Python executables
    python_executables = ['python', 'python3', 'python3.8', 'python3.9', 'python3.10', 'python3.11', 'python3.12']
    
    for exe in python_executables:
        path = shutil.which(exe)
        if path:
            try:
                result = subprocess.run([path, '--version'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    version = result.stdout.strip() or result.stderr.strip()
                    python_versions.append({
                        'executable': exe,
                        'path': path,
                        'version': version
                    })
            except (subprocess.TimeoutExpired, subprocess.SubprocessError):
                pass
    
    return python_versions

def detect_julia():
    """Detect Julia installations"""
    julia_versions = []
    
    julia_executables = ['julia']
    
    for exe in julia_executables:
        path = shutil.which(exe)
        if path:
            try:
                result = subprocess.run([path, '--version'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    version = result.stdout.strip()
                    julia_versions.append({
                        'executable': exe,
                        'path': path,
                        'version': version
                    })
            except (subprocess.TimeoutExpired, subprocess.SubprocessError):
                pass
    
    return julia_versions

def detect_cpp():
    """Detect C++ compiler installations"""
    cpp_compilers = []
    
    compilers = ['g++', 'clang++', 'cl']
    
    for compiler in compilers:
        path = shutil.which(compiler)
        if path:
            try:
                result = subprocess.run([path, '--version'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    version_info = result.stdout.split('\n')[0].strip()
                    cpp_compilers.append({
                        'executable': compiler,
                        'path': path,
                        'version': version_info
                    })
            except (subprocess.TimeoutExpired, subprocess.SubprocessError):
                pass
    
    return cpp_compilers

def main():
    """Main function to detect all environments"""
    environments = {
        'python': detect_python(),
        'julia': detect_julia(),
        'cpp': detect_cpp()
    }
    
    # Output as JSON
    print(json.dumps(environments, indent=2))

if __name__ == "__main__":
    main()