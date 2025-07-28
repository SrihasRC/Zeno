// AI Assistant Service for Zeno
interface Task {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
}

interface Goal {
  id: string
  title: string
  is_completed: boolean
  progress: number
}

interface Session {
  id: string
  type: string
  duration: number
  created_at: string
  completed: boolean
}

export interface UserContext {
  activeTasks: Task[]
  todaysSessions: number
  pendingGoals: Goal[]
  recentActivity: Session[]
}

export interface AIAction {
  type: 'create_task' | 'start_pomodoro' | 'create_note' | 'analyze_productivity' | 'list_tasks' | 'generate_daily_plan'
  parameters: Record<string, unknown>
}

export interface AIResponse {
  response: string
  actions: AIAction[]
  timestamp: string
}

export class ZenoAI {
  private readonly apiUrl: string

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_AI_ASSISTANT_URL || ''
  }

  async chat(message: string, context: UserContext): Promise<AIResponse> {
    try {
      // Enhance message with context
      const enhancedMessage = this.addContext(message, context)
      
      // Call Hugging Face Space API using the API tab
      const response = await fetch(`${this.apiUrl}/call/api_predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [enhancedMessage, []]
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const result = await response.json()
      const aiResponse = result.data[0] // The AI's response

      return {
        response: aiResponse.message,
        actions: aiResponse.actions || [],
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('AI service error:', error)
      return {
        response: "I'm having trouble connecting right now. Please try again later. You can still use Zeno manually!",
        actions: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  private addContext(message: string, context: UserContext): string {
    const contextInfo = [
      `Active tasks: ${context.activeTasks.length}`,
      `Today's focus sessions: ${context.todaysSessions}`,
      `Pending goals: ${context.pendingGoals.length}`
    ].join(', ')

    return `Context: ${contextInfo}

User message: ${message}`
  }

  private parseActions(aiResponse: string): AIAction[] {
    const actions: AIAction[] = []
    
    // Look for JSON commands in AI response (compatible with older JS versions)
    const jsonRegex = /```json\n([\s\S]*?)\n```/g
    let match

    while ((match = jsonRegex.exec(aiResponse)) !== null) {
      try {
        const action = JSON.parse(match[1])
        if (action.type && action.parameters) {
          actions.push(action)
        }
      } catch {
        console.warn('Failed to parse AI action:', match[1])
      }
    }

    return actions
  }
}

// Helper function to get user context
export async function getUserContext(): Promise<UserContext> {
  try {
    // Fetch current user data
    const [tasksRes, sessionsRes, goalsRes] = await Promise.all([
      fetch('/api/tasks'),
      fetch('/api/pomodoro'),
      fetch('/api/goals')
    ])

    const [tasks, sessions, goals] = await Promise.all([
      tasksRes.ok ? tasksRes.json() : [],
      sessionsRes.ok ? sessionsRes.json() : [],
      goalsRes.ok ? goalsRes.json() : []
    ])

    // Filter for today's sessions
    const today = new Date().toDateString()
    const todaysSessions = sessions.filter((session: Session) => 
      new Date(session.created_at).toDateString() === today
    ).length

    return {
      activeTasks: tasks.filter((task: Task) => task.status !== 'done') || [],
      todaysSessions,
      pendingGoals: goals.filter((goal: Goal) => !goal.is_completed) || [],
      recentActivity: sessions.slice(-5) || []
    }
  } catch (error) {
    console.error('Error getting user context:', error)
    return {
      activeTasks: [],
      todaysSessions: 0,
      pendingGoals: [],
      recentActivity: []
    }
  }
}
