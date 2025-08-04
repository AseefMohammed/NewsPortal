#!/usr/bin/env python3
"""
Simple backend starter for NewsPortal
"""

import uvicorn
import os
import sys

def main():
    print("🚀 Starting NewsPortal Backend...")
    
    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Check for .env file
    if not os.path.exists(".env"):
        print("⚠️  No .env file found. Creating from template...")
        if os.path.exists(".env.example"):
            import shutil
            shutil.copy(".env.example", ".env")
            print("📝 Created .env file. Please add your API keys!")
        else:
            print("❌ No .env.example found")
    
    # Start the server
    print("🎯 Starting FastAPI server on http://localhost:9100")
    print("📚 API docs available at http://localhost:9100/docs")
    print("🛑 Press Ctrl+C to stop")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=9100,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Backend stopped")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

if __name__ == "__main__":
    main()