#!/usr/bin/env python3
"""
Stub Python Backend for Context Forge Electron App

This is a placeholder script that demonstrates how to create a PyInstaller-compatible
Python backend that can be controlled from the Electron tray menu.

To build the executable:
    pip install pyinstaller
    pyinstaller --onefile --name backend backend.py

The executable will be created in the dist/ folder.
"""

import sys
import signal
import time
import json
from datetime import datetime


class PythonBackend:
    """Main backend class with graceful shutdown handling"""
    
    def __init__(self):
        self.running = True
        self.start_time = datetime.now()
        
        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGTERM, self.handle_shutdown)
        signal.signal(signal.SIGINT, self.handle_shutdown)
        
        print("Python Backend initialized", flush=True)
    
    def handle_shutdown(self, signum, frame):
        """Handle shutdown signals gracefully"""
        print(f"Received signal {signum}, shutting down gracefully...", flush=True)
        self.running = False
    
    def run(self):
        """Main run loop"""
        print(json.dumps({
            "status": "started",
            "timestamp": self.start_time.isoformat(),
            "pid": sys.argv[0] if len(sys.argv) > 0 else "unknown"
        }), flush=True)
        
        iteration = 0
        while self.running:
            # Your backend logic here
            # This is just a stub that prints a heartbeat every 10 seconds
            
            if iteration % 10 == 0:
                uptime = (datetime.now() - self.start_time).total_seconds()
                print(json.dumps({
                    "status": "running",
                    "uptime_seconds": int(uptime),
                    "iteration": iteration
                }), flush=True)
            
            time.sleep(1)
            iteration += 1
        
        print(json.dumps({
            "status": "stopped",
            "total_runtime_seconds": int((datetime.now() - self.start_time).total_seconds())
        }), flush=True)


def main():
    """Entry point"""
    print("=" * 50, flush=True)
    print("Context Forge Python Backend", flush=True)
    print("=" * 50, flush=True)
    
    try:
        backend = PythonBackend()
        backend.run()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr, flush=True)
        sys.exit(1)
    
    print("Backend stopped cleanly", flush=True)
    sys.exit(0)


if __name__ == '__main__':
    main()
