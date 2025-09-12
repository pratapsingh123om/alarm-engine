import sys
import json
import os
import tempfile
import argparse
import threading
import time

# Try to import pygame
try:
    import pygame
    from pygame.locals import *
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False
    print("Pygame is not installed. GUI functionality will be limited.")

# Try to import comtypes for Windows TTS
try:
    import comtypes.client
    COMTYPES_AVAILABLE = True
except ImportError:
    COMTYPES_AVAILABLE = False
    print("Comtypes is not installed. Windows TTS will not be available.")

class TodoDashboard:
    def __init__(self):
        self.tasks = self.load_tasks()
        self.input_text = ''
        self.input_active = False
        
        if PYGAME_AVAILABLE:
            self.init_pygame()
        else:
            print("Running in console mode (no GUI available)")

    def init_pygame(self):
        """Initialize Pygame with proper settings"""
        pygame.init()
        self.width, self.height = 400, 600
        self.screen = pygame.display.set_mode((self.width, self.height))
        pygame.display.set_caption("To-Do Dashboard")
        
        # Set up fonts
        self.font = pygame.font.SysFont('Arial', 20)
        self.title_font = pygame.font.SysFont('Arial', 24, bold=True)
        self.clock = pygame.time.Clock()
        
        # Try to bring window to front
        self.bring_to_front()
        
        print("Pygame initialized successfully")

    def bring_to_front(self):
        """Try to bring the Pygame window to the front"""
        if os.name == 'nt':  # Windows
            try:
                import ctypes
                hwnd = pygame.display.get_wm_info()['window']
                ctypes.windll.user32.ShowWindow(hwnd, 9)  # SW_RESTORE
                ctypes.windll.user32.SetForegroundWindow(hwnd)
                print("Window brought to front")
            except Exception as e:
                print(f"Could not bring window to front: {e}")

    def load_tasks(self):
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            tasks_path = os.path.join(script_dir, 'tasks.json')
            
            with open(tasks_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    def save_tasks(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        tasks_path = os.path.join(script_dir, 'tasks.json')
        
        with open(tasks_path, 'w') as f:
            json.dump(self.tasks, f)

    def add_task(self, description):
        self.tasks.append({"description": description, "completed": False})
        self.save_tasks()

    def toggle_task(self, index):
        if 0 <= index < len(self.tasks):
            self.tasks[index]["completed"] = not self.tasks[index]["completed"]
            self.save_tasks()

    def announce_tasks(self):
        if hasattr(self, 'tts_lock') and (self.tts_lock.locked() or getattr(self, 'currently_playing', False)):
            return
            
        if not hasattr(self, 'tts_lock'):
            self.tts_lock = threading.Lock()
            self.currently_playing = False
            
        threading.Thread(target=self._tts_thread, daemon=True).start()

    def _tts_thread(self):
        with self.tts_lock:
            self.currently_playing = True
            pending_tasks = [task["description"] for task in self.tasks if not task["completed"]]
            
            if pending_tasks:
                text = "You have {} pending tasks: {}".format(
                    len(pending_tasks), 
                    ", ".join(pending_tasks)
                )
                print(text)
                
                try:
                    if os.name == 'nt' and COMTYPES_AVAILABLE:
                        try:
                            speaker = comtypes.client.CreateObject("SAPI.SpVoice")
                            speaker.Speak(text)
                        except Exception as e:
                            print(f"TTS Error: {e}")
                            print("\a")
                    else:
                        print("\a")
                except Exception as e:
                    print(f"TTS Error: {e}")
                    print("\a")
            
            self.currently_playing = False

    def handle_events(self):
        """Handle Pygame events and return whether to continue running"""
        for event in pygame.event.get():
            if event.type == QUIT:
                return False
                
            elif event.type == MOUSEBUTTONDOWN:
                mouse_pos = pygame.mouse.get_pos()
                print(f"Mouse clicked at: {mouse_pos}")
                
                # Check if input box is clicked
                input_rect = pygame.Rect(50, 50, 300, 30)
                if input_rect.collidepoint(mouse_pos):
                    self.input_active = True
                    print("Input box activated")
                else:
                    self.input_active = False
                    print("Input box deactivated")
                
                # Check if task is clicked
                y_pos = 120
                for i, task in enumerate(self.tasks):
                    task_rect = pygame.Rect(50, y_pos, 300, 30)
                    if task_rect.collidepoint(mouse_pos):
                        print(f"Task {i} clicked")
                        self.toggle_task(i)
                    y_pos += 40
                    
            elif event.type == KEYDOWN and self.input_active:
                if event.key == K_RETURN:
                    if self.input_text.strip():
                        self.add_task(self.input_text.strip())
                        self.input_text = ''
                        print("Task added")
                elif event.key == K_BACKSPACE:
                    self.input_text = self.input_text[:-1]
                elif event.unicode.isprintable():
                    self.input_text += event.unicode
                    
        return True

    def draw(self):
        """Draw the dashboard interface"""
        # Clear screen
        self.screen.fill((240, 240, 240))
        
        # Draw title
        title = self.title_font.render("To-Do Dashboard", True, (0, 0, 0))
        self.screen.blit(title, (50, 15))
        
        # Draw input box
        input_rect = pygame.Rect(50, 50, 300, 30)
        pygame.draw.rect(self.screen, (255, 255, 255), input_rect, 2)
        text_surface = self.font.render(self.input_text, True, (0, 0, 0))
        self.screen.blit(text_surface, (55, 55))
        
        # Draw input prompt
        prompt = self.font.render("Type task and press Enter", True, (100, 100, 100))
        self.screen.blit(prompt, (50, 85))
        
        # Draw tasks
        y_pos = 120
        for i, task in enumerate(self.tasks):
            color = (100, 200, 100) if task["completed"] else (200, 100, 100)
            task_rect = pygame.Rect(50, y_pos, 300, 30)
            pygame.draw.rect(self.screen, color, task_rect)
            
            # Draw task border for visibility
            pygame.draw.rect(self.screen, (0, 0, 0), task_rect, 1)
            
            status = "✓ " if task["completed"] else "○ "
            task_text = self.font.render(status + task["description"], True, (0, 0, 0))
            self.screen.blit(task_text, (55, y_pos + 5))
            
            y_pos += 40

        # Draw statistics
        completed = sum(1 for task in self.tasks if task["completed"])
        total = len(self.tasks)
        stats = self.font.render(f"Completed: {completed}/{total}", True, (0, 0, 0))
        self.screen.blit(stats, (50, y_pos + 20))
        
        # Draw debug info
        debug_text = self.font.render(f"Mouse: {pygame.mouse.get_pos()}", True, (100, 100, 100))
        self.screen.blit(debug_text, (50, y_pos + 50))

        # Update display
        pygame.display.flip()

    def run_gui(self):
        """Run the GUI version of the dashboard"""
        if not PYGAME_AVAILABLE:
            print("Pygame is not available. Cannot run GUI.")
            return
            
        running = True
        print("Starting GUI loop...")
        
        while running:
            # Handle events
            running = self.handle_events()
            
            # Draw everything
            self.draw()
            
            # Cap the frame rate
            self.clock.tick(30)
            
        pygame.quit()
        print("GUI loop ended")

    def run_console(self):
        """Run the console version of the dashboard"""
        print("To-Do Dashboard (Console Mode)")
        print("Commands: add <task>, toggle <index>, list, quit")
        
        while True:
            command = input("> ").strip().lower()
            
            if command == "quit":
                break
            elif command == "list":
                for i, task in enumerate(self.tasks):
                    status = "✓" if task["completed"] else "○"
                    print(f"{i}: [{status}] {task['description']}")
            elif command.startswith("add "):
                task_desc = command[4:].strip()
                if task_desc:
                    self.add_task(task_desc)
                    print(f"Added: {task_desc}")
            elif command.startswith("toggle "):
                try:
                    index = int(command[7:].strip())
                    if 0 <= index < len(self.tasks):
                        self.toggle_task(index)
                        status = "completed" if self.tasks[index]["completed"] else "pending"
                        print(f"Toggled task {index} to {status}")
                    else:
                        print("Invalid index")
                except ValueError:
                    print("Invalid index")
            else:
                print("Unknown command")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='To-Do Dashboard')
    parser.add_argument('--announce', action='store_true', help='Announce tasks using TTS')
    parser.add_argument('--console', action='store_true', help='Run in console mode')
    args = parser.parse_args()
    
    dashboard = TodoDashboard()
    
    if args.announce:
        dashboard.announce_tasks()
    elif args.console or not PYGAME_AVAILABLE:
        dashboard.run_console()
    else:
        dashboard.run_gui()