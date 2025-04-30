import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Path to the data directory
const DATA_DIR = path.join(process.cwd(), 'data')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')
const USAGE_FILE = path.join(DATA_DIR, 'usage.json')

// Ensure data directory exists and has proper permissions
export const initStorage = () => {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    // Initialize projects file if it doesn't exist
    if (!fs.existsSync(PROJECTS_FILE)) {
      const initialProjects = { projects: [] }
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(initialProjects, null, 2))
    } else {
      // Validate existing projects file
      try {
        const data = fs.readFileSync(PROJECTS_FILE, 'utf8')
        JSON.parse(data)
      } catch (error) {
        // If file is corrupted, reset it
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects: [] }, null, 2))
      }
    }
    
    // Initialize usage file if it doesn't exist
    if (!fs.existsSync(USAGE_FILE)) {
      const initialUsage = { 
        totalRequests: 0,
        requestsByDate: {},
        requestsByProject: {}
      }
      fs.writeFileSync(USAGE_FILE, JSON.stringify(initialUsage, null, 2))
    } else {
      // Validate existing usage file
      try {
        const data = fs.readFileSync(USAGE_FILE, 'utf8')
        JSON.parse(data)
      } catch (error) {
        // If file is corrupted, reset it
        fs.writeFileSync(USAGE_FILE, JSON.stringify({ 
          totalRequests: 0,
          requestsByDate: {},
          requestsByProject: {}
        }, null, 2))
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error)
    throw new Error('Failed to initialize storage: ' + error.message)
  }
}

// Get all projects
export const getProjects = () => {
  try {
    initStorage()
    const data = fs.readFileSync(PROJECTS_FILE, 'utf8')
    const parsed = JSON.parse(data)
    return Array.isArray(parsed.projects) ? parsed.projects : []
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
    initStorage()
    const projects = getProjects()
    
    const newProject = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      html: '<div>\n  <h1>Hello World</h1>\n  <p>Start editing to see some magic happen!</p>\n</div>',
      css: 'body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}',
      js: '// Add your JavaScript here\nconsole.log("Hello from Dreamer!");'
    }
    
    projects.push(newProject)
    
    // Write the updated projects to file
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects }, null, 2))
    
    return newProject
  } catch (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project: ' + error.message)
  }
}

// Update an existing project
export const updateProject = (id, data) => {
  try {
    initStorage()
    const projects = getProjects()
    const index = projects.findIndex(project => project.id === id)
    
    if (index === -1) {
      throw new Error('Project not found')
    }
    
    const updatedProject = {
      ...projects[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    projects[index] = updatedProject
    
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects }, null, 2))
    
    return updatedProject
  } catch (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project: ' + error.message)
  }
}

// Delete a project
export const deleteProject = (id) => {
  try {
    initStorage()
    const projects = getProjects()
    const filteredProjects = projects.filter(project => project.id !== id)
    
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects: filteredProjects }, null, 2))
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project: ' + error.message)
  }
}

// Track API usage
export const trackUsage = (projectId = null) => {
  try {
    initStorage()
    const data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'))
    
    // Increment total requests
    data.totalRequests += 1
    
    // Track by date
    const today = new Date().toISOString().split('T')[0]
    data.requestsByDate[today] = (data.requestsByDate[today] || 0) + 1
    
    // Track by project if provided
    if (projectId) {
      data.requestsByProject[projectId] = (data.requestsByProject[projectId] || 0) + 1
    }
    
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2))
    
    return data
  } catch (error) {
    console.error('Error tracking usage:', error)
    throw new Error('Failed to track usage: ' + error.message)
  }
}

// Get usage statistics
export const getUsageStats = () => {
  try {
    initStorage()
    const data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'))
    return data
  } catch (error) {
    console.error('Error getting usage stats:', error)
    return {
      totalRequests: 0,
      requestsByDate: {},
      requestsByProject: {}
    }
  }
}
