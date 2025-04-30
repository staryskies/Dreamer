import { getProjects, createProject } from '../../../lib/storage'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      // Get all projects
      const projects = getProjects()
      return res.status(200).json({ 
        success: true,
        projects 
      })
    } else if (req.method === 'POST') {
      // Create a new project
      const { name } = req.body
      
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ 
          success: false,
          error: 'Project name is required and must be a non-empty string'
        })
      }
      
      const project = createProject(name.trim())
      return res.status(201).json({ 
        success: true,
        project 
      })
    }
    
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}
