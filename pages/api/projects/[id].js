import { getProject, updateProject, deleteProject } from '../../../lib/storage'

export default async function handler(req, res) {
  const { id } = req.query
  
  if (!id) {
    return res.status(400).json({ error: 'Project ID is required' })
  }
  
  if (req.method === 'GET') {
    // Get a specific project
    try {
      const project = getProject(id)
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' })
      }
      
      return res.status(200).json({ project })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PUT') {
    // Update a project
    try {
      const { html, css, js, name } = req.body
      
      const updatedData = {}
      if (html !== undefined) updatedData.html = html
      if (css !== undefined) updatedData.css = css
      if (js !== undefined) updatedData.js = js
      if (name !== undefined) updatedData.name = name
      
      const project = updateProject(id, updatedData)
      return res.status(200).json({ project })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'DELETE') {
    // Delete a project
    try {
      const result = deleteProject(id)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
