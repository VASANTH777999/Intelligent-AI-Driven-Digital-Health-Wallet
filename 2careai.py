import sys
import os
import subprocess
import time
import signal
import webbrowser
from pathlib import Path

class HealthWalletLauncher:
    def __init__(self):
        self.root_dir = Path(__file__).parent
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
        self.backend_process = None
        
    def print_banner(self):
        print("\n" + "="*60)
        print("  DIGITAL HEALTH WALLET")
        print("="*60)
        print("Starting your health management system...")
        print("="*60 + "\n")
    
    def check_node(self):
        """Check if Node.js is installed"""
        try:
            result = subprocess.run(['node', '--version'], 
                                  capture_output=True, 
                                  text=True)
            print(f"[OK] Node.js found: {result.stdout.strip()}")
            return True
        except FileNotFoundError:
            print("[ERROR] Node.js not found!")
            print("Please install Node.js from https://nodejs.org/")
            return False
    
    def install_dependencies(self):
        """Install npm dependencies for both frontend and backend"""
        print("\n[INSTALL] Installing dependencies...")
        
        # Install backend dependencies
        print("\n-> Installing backend dependencies...")
        if not (self.backend_dir / "node_modules").exists():
            subprocess.run(['npm', 'install'], 
                         cwd=str(self.backend_dir),
                         shell=True)
            print("[OK] Backend dependencies installed")
        else:
            print("[OK] Backend dependencies already installed")
        
        # Install frontend dependencies
        print("\n-> Installing frontend dependencies...")
        if not (self.frontend_dir / "node_modules").exists():
            subprocess.run(['npm', 'install'], 
                         cwd=str(self.frontend_dir),
                         shell=True)
            print("[OK] Frontend dependencies installed")
        else:
            print("[OK] Frontend dependencies already installed")
    
    def build_frontend(self):
        """Build React frontend"""
        print("\n[BUILD] Building frontend...")
        
        result = subprocess.run(['npm', 'run', 'build'], 
                              cwd=str(self.frontend_dir),
                              shell=True,
                              capture_output=True,
                              text=True)
        
        if result.returncode == 0:
            print("[OK] Frontend built successfully")
            
            # Copy build to backend public folder
            import shutil
            dist_dir = self.frontend_dir / "dist"
            public_dir = self.backend_dir / "public"
            
            if public_dir.exists():
                shutil.rmtree(public_dir)
            
            shutil.copytree(dist_dir, public_dir)
            print("[OK] Frontend files copied to backend")
        else:
            print("[ERROR] Frontend build failed")
            print(result.stderr)
            return False
        
        return True
    
    def kill_port_process(self, port=5000):
        """Kill any process using the specified port"""
        try:
            print(f"\n[CHECK] Checking for processes on port {port}...")
            # Find process using the port
            result = subprocess.run(
                f'netstat -ano | findstr :{port}',
                shell=True,
                capture_output=True,
                text=True
            )
            
            if result.stdout:
                # Extract PID from netstat output
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if 'LISTENING' in line:
                        parts = line.split()
                        pid = parts[-1]
                        print(f"[INFO] Found process {pid} using port {port}")
                        # Kill the process
                        subprocess.run(f'taskkill /F /PID {pid}', shell=True, capture_output=True)
                        print(f"[OK] Killed process {pid}")
                        time.sleep(1)
            else:
                print(f"[OK] Port {port} is available")
        except Exception as e:
            print(f"[WARNING] Could not check port: {e}")
    
    def start_backend(self):
        """Start the Express backend server"""
        print("\n[START] Starting backend server...")
        
        # Kill any existing process on port 5000
        self.kill_port_process(5000)
        
        # Start backend in a new process
        self.backend_process = subprocess.Popen(
            ['node', 'server.js'],
            cwd=str(self.backend_dir),
            shell=True
        )
        
        # Wait for server to start
        time.sleep(3)
        
        if self.backend_process.poll() is None:
            print("[OK] Backend server started successfully")
            return True
        else:
            print("[ERROR] Backend server failed to start")
            return False
    
    def open_browser(self):
        """Open the application in default browser"""
        url = "http://localhost:5000"
        print(f"\n[BROWSER] Opening browser at {url}")
        time.sleep(2)
        webbrowser.open(url)
    
    def cleanup(self, signum=None, frame=None):
        """Cleanup processes on exit"""
        print("\n\n[SHUTDOWN] Shutting down...")
        
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
            print("[OK] Backend server stopped")
        
        print("\nHealth Wallet closed. Stay healthy!")
        sys.exit(0)
    
    def run(self):
        """Main execution flow"""
        try:
            self.print_banner()
            
            # Check Node.js
            if not self.check_node():
                sys.exit(1)
            
            # Install dependencies
            self.install_dependencies()
            
            # Build frontend
            if not self.build_frontend():
                sys.exit(1)
            
            # Start backend
            if not self.start_backend():
                sys.exit(1)
            
            # Open browser
            self.open_browser()
            
            # Display success message
            print("\n" + "="*60)
            print("  APPLICATION RUNNING SUCCESSFULLY")
            print("="*60)
            print("\n[INFO] Access your Health Wallet at: http://localhost:5000")
            print("\n[TIPS]")
            print("   * Create an account to get started")
            print("   * Upload your health reports")
            print("   * Track your vitals over time")
            print("   * Share reports with doctors and family")
            print("\n[WARNING] Press Ctrl+C to stop the server")
            print("="*60 + "\n")
            
            # Keep the script running
            signal.signal(signal.SIGINT, self.cleanup)
            signal.signal(signal.SIGTERM, self.cleanup)
            
            while True:
                time.sleep(1)
                
        except KeyboardInterrupt:
            self.cleanup()
        except Exception as e:
            print(f"\n[ERROR] Error: {str(e)}")
            self.cleanup()

if __name__ == "__main__":
    launcher = HealthWalletLauncher()
    launcher.run()
