# Zeno AI Assistant - HuggingFace Space
import gradio as gr
import json
import re
from datetime import datetime

class ZenoAI:
    def __init__(self):
        self.system_prompt = """You are Zara, an AI assistant for Zeno - a personal productivity app. 
You help users manage tasks, focus sessions, notes, and goals.

Your capabilities:
- Create tasks with priorities (high, medium, low)
- Start pomodoro focus sessions (25-minute default)
- Create notes and organize thoughts
- List and analyze tasks and productivity
- Generate daily plans based on priorities
- Provide productivity insights and motivation

IMPORTANT: When users ask you to perform actions, respond with JSON commands in this format:
{
  "actions": [
    {
      "type": "create_task",
      "parameters": {
        "title": "Task title",
        "priority": "high|medium|low",
        "description": "Optional description"
      }
    }
  ]
}

Available action types:
- create_task: Create a new task
- start_pomodoro: Start a focus session
- create_note: Create a note
- list_tasks: Show user's tasks
- analyze_productivity: Show productivity stats
- generate_daily_plan: Create a daily task plan

Always be helpful, encouraging, and focused on productivity. Keep responses concise but friendly.
"""

    def parse_user_input(self, message, context=""):
        """Parse user message and determine if actions are needed"""
        message_lower = message.lower()
        
        # Task creation patterns
        if any(phrase in message_lower for phrase in ['create task', 'add task', 'new task', 'make a task']):
            return self.create_task_action(message)
        
        # Pomodoro patterns
        elif any(phrase in message_lower for phrase in ['start pomodoro', 'focus session', 'start timer', 'work session']):
            return self.start_pomodoro_action(message)
        
        # Note creation patterns
        elif any(phrase in message_lower for phrase in ['create note', 'add note', 'new note', 'take note']):
            return self.create_note_action(message)
        
        # List tasks patterns
        elif any(phrase in message_lower for phrase in ['show tasks', 'list tasks', 'my tasks', 'what tasks']):
            return self.list_tasks_action()
        
        # Productivity analysis patterns
        elif any(phrase in message_lower for phrase in ['productivity', 'how am i doing', 'analyze', 'stats', 'progress']):
            return self.analyze_productivity_action()
        
        # Daily plan patterns
        elif any(phrase in message_lower for phrase in ['daily plan', 'plan my day', 'what should i do', 'prioritize']):
            return self.generate_daily_plan_action()
        
        # Default response for general questions
        else:
            return self.general_response(message)

    def create_task_action(self, message):
        """Extract task details from message"""
        # Simple extraction - in production, use NLP
        title = "New Task"
        priority = "medium"
        description = ""
        
        # Extract title (text after "task" keywords)
        task_patterns = [
            r'(?:create|add|new|make)?\s*task\s*[:\-]?\s*(.+)',
            r'(?:task|todo)\s*[:\-]?\s*(.+)',
        ]
        
        for pattern in task_patterns:
            match = re.search(pattern, message.lower())
            if match:
                title = match.group(1).strip().strip('"\'')
                if title:
                    title = title.split(' priority')[0]  # Remove priority part
                    title = title.split(' with')[0]  # Remove description part
                    break
        
        # Extract priority
        if any(word in message.lower() for word in ['urgent', 'important', 'critical', 'high']):
            priority = "high"
        elif any(word in message.lower() for word in ['low', 'minor', 'later']):
            priority = "low"
        
        return {
            "message": f"I'll create a task '{title}' with {priority} priority for you! 📝",
            "actions": [{
                "type": "create_task",
                "parameters": {
                    "title": title.title(),
                    "priority": priority,
                    "description": description
                }
            }]
        }

    def start_pomodoro_action(self, message):
        """Start a pomodoro session"""
        duration = 25  # default
        
        # Extract duration if specified
        duration_match = re.search(r'(\d+)\s*min', message.lower())
        if duration_match:
            duration = int(duration_match.group(1))
        
        session_type = "focus"
        label = f"{duration}-minute focus session"
        
        return {
            "message": f"Starting a {duration}-minute focus session! 🍅 Stay concentrated and avoid distractions.",
            "actions": [{
                "type": "start_pomodoro",
                "parameters": {
                    "duration": duration,
                    "type": session_type,
                    "label": label
                }
            }]
        }

    def create_note_action(self, message):
        """Create a new note"""
        # Extract note content
        note_patterns = [
            r'(?:create|add|new|take)?\s*note\s*[:\-]?\s*(.+)',
            r'note\s*[:\-]?\s*(.+)',
        ]
        
        content = "Quick note created by AI"
        title = "AI Note"
        
        for pattern in note_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                content = match.group(1).strip().strip('"\'')
                title = content[:50] + "..." if len(content) > 50 else content
                break
        
        return {
            "message": f"I've created a note for you! 📝",
            "actions": [{
                "type": "create_note",
                "parameters": {
                    "title": title,
                    "content": content,
                    "category": "other"
                }
            }]
        }

    def list_tasks_action(self):
        """List user tasks"""
        return {
            "message": "Let me show you your current tasks! 📋",
            "actions": [{
                "type": "list_tasks",
                "parameters": {
                    "filter": "active"
                }
            }]
        }

    def analyze_productivity_action(self):
        """Analyze user productivity"""
        return {
            "message": "Let me analyze your productivity data! 📊",
            "actions": [{
                "type": "analyze_productivity",
                "parameters": {}
            }]
        }

    def generate_daily_plan_action(self):
        """Generate a daily plan"""
        return {
            "message": "I'll create an optimized daily plan based on your tasks! 📅",
            "actions": [{
                "type": "generate_daily_plan",
                "parameters": {}
            }]
        }

    def general_response(self, message):
        """Handle general questions without actions"""
        responses = {
            "hello": "Hi! I'm Zara, your productivity assistant. I can help you create tasks, start focus sessions, take notes, and more! What would you like to do? 👋",
            "help": "I can help you with:\n• Creating and managing tasks\n• Starting pomodoro focus sessions\n• Taking notes\n• Analyzing your productivity\n• Planning your day\n\nJust ask me naturally, like 'create a task' or 'start a 25-minute focus session'! 🚀",
            "thanks": "You're welcome! I'm here to help you stay productive. Is there anything else you'd like to do? 😊",
            "good": "I'm glad to hear that! Keep up the great work. Productivity is all about consistent small steps. 💪",
            "default": "I'm here to help you be more productive! You can ask me to create tasks, start focus sessions, take notes, or check your productivity stats. What would you like to do? 🎯"
        }
        
        message_lower = message.lower().strip()
        
        if any(greet in message_lower for greet in ['hello', 'hi', 'hey']):
            return {"message": responses["hello"], "actions": []}
        elif any(help_word in message_lower for help_word in ['help', 'what can you do', 'commands']):
            return {"message": responses["help"], "actions": []}
        elif any(thanks in message_lower for thanks in ['thank', 'thanks']):
            return {"message": responses["thanks"], "actions": []}
        elif any(good in message_lower for good in ['good', 'great', 'awesome', 'nice']):
            return {"message": responses["good"], "actions": []}
        else:
            return {"message": responses["default"], "actions": []}

def respond(message, history):
    """Simple response function for ChatInterface"""
    ai = ZenoAI()
    try:
        response = ai.parse_user_input(message)
        bot_message = response["message"]
        
        # Add action information if present
        if response.get("actions"):
            actions_text = "\n\n🤖 **Actions to execute:**\n"
            for action in response["actions"]:
                action_title = action.get('parameters', {}).get('title', 'N/A')
                actions_text += f"• {action['type']}: {action_title}\n"
            bot_message += actions_text
        
        return bot_message
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}. Please try again! 🤔"

def predict_api(message, history):
    """API endpoint for the Zeno app"""
    ai = ZenoAI()
    
    try:
        response = ai.parse_user_input(message)
        return json.dumps(response)
    except Exception as e:
        return json.dumps({
            "message": f"Error: {str(e)}",
            "actions": []
        })

# Create simple chat interface
chat_demo = gr.ChatInterface(
    respond,
    title="🤖 Zara - Your AI Productivity Assistant",
    description="I'm Zara, here to help you manage tasks, focus sessions, and boost your productivity!",
    examples=[
        "Create a task: Finish project proposal with high priority",
        "Start a 25-minute focus session", 
        "Show me my current tasks",
        "Create a note: Meeting ideas for tomorrow",
        "Analyze my productivity",
        "Help me plan my day"
    ]
)

# Create API interface that matches our expected format
def api_predict(message, history):
    """API endpoint that returns JSON response"""
    ai = ZenoAI()
    try:
        response = ai.parse_user_input(message)
        return response  # Return the dict directly, not JSON string
    except Exception as e:
        return {
            "message": f"Error: {str(e)}",
            "actions": []
        }

# Create the API interface
api_interface = gr.Interface(
    fn=api_predict,
    inputs=[
        gr.Textbox(placeholder="Enter your message"),
        gr.State([])  # Chat history placeholder
    ],
    outputs=gr.JSON(label="AI Response"),
    title="🔌 API Endpoint",
    description="Use this for programmatic access from your Zeno app"
)

# Combine interfaces
demo = gr.TabbedInterface(
    [chat_demo, api_interface],
    ["💬 Chat with Zara", "🔌 API Access"],
    title="Zara - Zeno AI Assistant"
)

if __name__ == "__main__":
    demo.launch()
