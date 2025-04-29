import { getProjects, createProject } from '../../../lib/storage'

export default async function handler(req, res) {
  // Initialize storage on first request
  
  if (req.method === 'GET') {
    // Get all projects
    try {
      const projects = getProjects()
      return res.status(200).json({ projects })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    // Create a new project
    try {
      const { name } = req.body
      
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' })
      }
      
      const project = createProject(name)
      return res.status(201).json({ project })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
