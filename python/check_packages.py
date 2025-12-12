#!/usr/bin/env python3
"""
Diagnostic script to check what packages are installed and their structure
"""
import sys
import importlib.metadata
import os

print("=" * 60)
print("INSTALLED PACKAGES")
print("=" * 60)

# List all installed packages
for dist in importlib.metadata.distributions():
    if any(keyword in dist.name.lower() for keyword in ['mcp', 'cforge', 'gateway', 'context']):
        print(f"\nPackage: {dist.name} (version: {dist.version})")
        print(f"Location: {dist._path}")
        
        # Try to show top-level modules
        try:
            top_level = dist.read_text('top_level.txt')
            if top_level:
                print(f"Top-level modules: {top_level.strip()}")
        except:
            pass

print("\n" + "=" * 60)
print("MODULE IMPORT TESTS")
print("=" * 60)

# Test imports
modules_to_test = [
    'cforge',
    'cforge.main',
    'cforge.config',
    'mcpgateway',
    'mcpgateway.main',
    'mcpgateway.config',
    'mcp',
]

for module_name in modules_to_test:
    try:
        module = __import__(module_name)
        print(f"✓ {module_name}: {module.__file__ if hasattr(module, '__file__') else 'builtin'}")
    except ImportError as e:
        print(f"✗ {module_name}: {e}")

print("\n" + "=" * 60)
print("SITE-PACKAGES CONTENTS")
print("=" * 60)

# Find site-packages directory
for path in sys.path:
    if 'site-packages' in path and os.path.exists(path):
        print(f"\nSearching in: {path}")
        try:
            items = os.listdir(path)
            relevant = [item for item in items if any(keyword in item.lower() for keyword in ['mcp', 'cforge', 'gateway', 'context'])]
            for item in sorted(relevant):
                full_path = os.path.join(path, item)
                if os.path.isdir(full_path):
                    print(f"  📁 {item}/")
                    # List contents of directory
                    try:
                        contents = os.listdir(full_path)[:10]  # First 10 items
                        for content in contents:
                            print(f"     - {content}")
                    except:
                        pass
                else:
                    print(f"  📄 {item}")
        except Exception as e:
            print(f"  Error: {e}")
        break

print("\n" + "=" * 60)
