import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Path to the data directory
const DATA_DIR = path.join(process.cwd(), 'data')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')
const USAGE_FILE = path.join(DATA_DIR, 'usage.json')

// Ensure data directory exists
export const initStorage = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  
  // Initialize projects file if it doesn't exist
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects: [] }))
  }
  
  // Initialize usage file if it doesn't exist
  if (!fs.existsSync(USAGE_FILE)) {
    fs.writeFileSync(USAGE_FILE, JSON.stringify({ 
      totalRequests: 0,
      requestsByDate: {},
      requestsByProject: {}
    }))
  }
}

// Get all projects
export const getProjects = () => {
  initStorage()
  const data = fs.readFileSync(PROJECTS_FILE, 'utf8')
  return JSON.parse(data).projects
}

// Get a specific project by ID
export const getProject = (id) => {
  const projects = getProjects()
  return projects.find(project => project.id === id)
}

// Create a new project
export const createProject = (name) => {
  const projects = getProjects()
  
  const newProject = {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    html: '<div>\n  <h1>Hello World</h1>\n  <p>Start editing to see some magic happen!</p>\n</div>',
    css: 'body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}',
    js: '// Add your JavaScript here\nconsole.log("Hello from Dreamer!");'
  }
  
  projects.push(newProject)
  
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects }))
  
  return newProject
}

// Update an existing project
export const updateProject = (id, data) => {
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
  
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects }))
  
  return updatedProject
}

// Delete a project
export const deleteProject = (id) => {
  const projects = getProjects()
  const filteredProjects = projects.filter(project => project.id !== id)
  
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects: filteredProjects }))
  
  return { success: true }
}

// Track API usage
export const trackUsage = (projectId = null) => {
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
  
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data))
  
  return data
}

// Get usage statistics
export const getUsageStats = () => {
  initStorage()
  const data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'))
  return data
}
