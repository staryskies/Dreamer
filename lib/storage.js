import { v4 as uuidv4 } from 'uuid'

// In-memory storage
let projects = []
let usageStats = {
  totalRequests: 0,
  requestsByDate: {},
  requestsByProject: {}
}

// Storage keys
const STORAGE_KEYS = {
  PROJECTS: 'dreamer_projects',
  USAGE: 'dreamer_usage'
}

// Initialize storage
export const initStorage = () => {
  try {
    // Load data from localStorage if available
    const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS)
    const storedUsage = localStorage.getItem(STORAGE_KEYS.USAGE)

    if (storedProjects) {
      try {
        projects = JSON.parse(storedProjects)
      } catch (e) {
        console.error('Error parsing stored projects:', e)
        projects = []
      }
    }

    if (storedUsage) {
      try {
        usageStats = JSON.parse(storedUsage)
      } catch (e) {
        console.error('Error parsing stored usage:', e)
        usageStats = {
          totalRequests: 0,
          requestsByDate: {},
          requestsByProject: {}
        }
      }
    }

    return true
  } catch (error) {
    console.error('Error initializing storage:', error)
    throw new Error('Failed to initialize storage: ' + error.message)
  }
}

// Save to localStorage
const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(usageStats))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Get all projects
export const getProjects = () => {
  try {
    return projects
  } catch (error) {
    console.error('Error getting projects:', error)
    return []
  }
}

// Get a specific project by ID
export const getProject = (id) => {
  const projects = getProjects()
  return projects.find(project => project.id === id)
}

// Create a new project
export const createProject = (name) => {
  try {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('Project name is required and must be a non-empty string')
    }

    const newProject = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    projects.push(newProject)
    saveToStorage()
    return newProject
  } catch (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project: ' + error.message)
  }
}

// Update a project
export const updateProject = (id, updates) => {
  try {
    const index = projects.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Project not found')
    }

    const updatedProject = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    projects[index] = updatedProject
    saveToStorage()
    return updatedProject
  } catch (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project: ' + error.message)
  }
}

// Delete a project
export const deleteProject = (id) => {
  try {
    const index = projects.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Project not found')
    }

    projects.splice(index, 1)
    saveToStorage()
    return true
  } catch (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project: ' + error.message)
  }
}

// Track usage
export const trackUsage = (projectId) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    usageStats.totalRequests++
    usageStats.requestsByDate[today] = (usageStats.requestsByDate[today] || 0) + 1
    
    if (projectId) {
      usageStats.requestsByProject[projectId] = (usageStats.requestsByProject[projectId] || 0) + 1
    }
    
    saveToStorage()
    return usageStats
  } catch (error) {
    console.error('Error tracking usage:', error)
    throw new Error('Failed to track usage: ' + error.message)
  }
}

// Get usage statistics
export const getUsageStats = () => {
  try {
    return usageStats
  } catch (error) {
    console.error('Error getting usage stats:', error)
    return {
      totalRequests: 0,
      requestsByDate: {},
      requestsByProject: {}
    }
  }
}
