// AI Action Executor - Executes AI commands in the app
import { AIAction } from './service'

export interface ActionResult {
  success: boolean
  message: string
  data?: unknown
}

export class AIActionExecutor {
  async executeAction(action: AIAction): Promise<ActionResult> {
    try {
      switch (action.type) {
        case 'create_task':
          return await this.createTask(action.parameters)
        
        case 'start_pomodoro':
          return await this.startPomodoro(action.parameters)
        
        case 'create_note':
          return await this.createNote(action.parameters)
        
        case 'list_tasks':
          return await this.listTasks(action.parameters)
        
        case 'analyze_productivity':
          return await this.analyzeProductivity()
        
        case 'generate_daily_plan':
          return await this.generateDailyPlan()
        
        default:
          return {
            success: false,
            message: `Unknown action type: ${action.type}`
          }
      }
    } catch (error) {
      console.error('Action execution error:', error)
      return {
        success: false,
        message: `Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async createTask(params: Record<string, unknown>): Promise<ActionResult> {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: params.title || 'New Task',
          priority: params.priority || 'medium',
          description: params.description || '',
          status: 'pending'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const task = await response.json()
      return {
        success: true,
        message: `✅ Created task: "${task.title}"`,
        data: task
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async startPomodoro(params: Record<string, unknown>): Promise<ActionResult> {
    try {
      const duration = (params.duration as number) || 25
      const startTime = new Date().toISOString()
      
      const response = await fetch('/api/pomodoro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: params.type || 'focus',
          duration,
          start_time: startTime,
          label: params.label || `${duration}-minute focus session`
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const session = await response.json()
      return {
        success: true,
        message: `⏰ Started ${duration}-minute focus session!`,
        data: session
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to start pomodoro: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async createNote(params: Record<string, unknown>): Promise<ActionResult> {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: params.title || 'New Note',
          content: params.content || 'Note created by AI assistant',
          category: params.category || 'other'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const note = await response.json()
      return {
        success: true,
        message: `📝 Created note: "${note.title}"`,
        data: note
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async listTasks(params: Record<string, unknown>): Promise<ActionResult> {
    try {
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const tasks = await response.json()
      const filter = params.filter as string || 'active'
      
      let filteredTasks = tasks
      if (filter === 'active') {
        filteredTasks = tasks.filter((task: { status: string }) => task.status !== 'done')
      }

      const taskList = filteredTasks
        .slice(0, 5) // Show max 5 tasks
        .map((task: { title: string; priority: string }, index: number) => 
          `${index + 1}. ${task.title} (${task.priority} priority)`
        )
        .join('\n')

      return {
        success: true,
        message: filteredTasks.length > 0 
          ? `📋 Your tasks:\n${taskList}${filteredTasks.length > 5 ? '\n...and more' : ''}` 
          : '📋 No active tasks found. Great job!',
        data: filteredTasks
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to fetch tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async analyzeProductivity(): Promise<ActionResult> {
    try {
      const [tasksRes, sessionsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/pomodoro')
      ])

      const [tasks, sessions] = await Promise.all([
        tasksRes.ok ? tasksRes.json() : [],
        sessionsRes.ok ? sessionsRes.json() : []
      ])

      // Calculate stats
      const totalTasks = tasks.length
      const completedTasks = tasks.filter((task: { status: string }) => task.status === 'done').length
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      
      const totalSessions = sessions.length
      const completedSessions = sessions.filter((session: { completed: boolean }) => session.completed).length
      
      const analysis = `📊 **Productivity Analysis**
      
**Tasks**: ${completedTasks}/${totalTasks} completed (${completionRate}%)
**Focus Sessions**: ${completedSessions} completed sessions
**Total Focus Time**: ${totalSessions * 25} minutes

${completionRate >= 70 ? '🎉 Great job! You\'re very productive!' : 
  completionRate >= 40 ? '👍 Good progress! Keep it up!' : 
  '💪 Let\'s boost your productivity with more focus sessions!'}`

      return {
        success: true,
        message: analysis,
        data: { completionRate, totalTasks, completedTasks, totalSessions }
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to analyze productivity: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async generateDailyPlan(): Promise<ActionResult> {
    try {
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const tasks = await response.json()
      const activeTasks = tasks.filter((task: { status: string }) => task.status !== 'done')
      
      if (activeTasks.length === 0) {
        return {
          success: true,
          message: '🎉 No pending tasks! You\'re all caught up. Consider setting new goals or taking a well-deserved break!',
          data: { plan: [] }
        }
      }

      // Prioritize tasks
      const highPriority = activeTasks.filter((task: { priority: string }) => task.priority === 'high')
      const mediumPriority = activeTasks.filter((task: { priority: string }) => task.priority === 'medium')
      const lowPriority = activeTasks.filter((task: { priority: string }) => task.priority === 'low')

      const plan = [
        ...highPriority.slice(0, 3),
        ...mediumPriority.slice(0, 2),
        ...lowPriority.slice(0, 1)
      ]

      const planText = plan
        .map((task: { title: string; priority: string }, index: number) => 
          `${index + 1}. ${task.title} (${task.priority} priority)`
        )
        .join('\n')

      const dailyPlan = `📅 **Today's Plan**

${planText}

💡 **Tips:**
- Start with high-priority tasks when you're most focused
- Use 25-minute pomodoro sessions for better concentration
- Take short breaks between tasks
- Celebrate small wins!`

      return {
        success: true,
        message: dailyPlan,
        data: { plan }
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Global instance for easy access
export const actionExecutor = new AIActionExecutor()
