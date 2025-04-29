import { getUsageStats, trackUsage } from '../../lib/storage'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get usage statistics
    try {
      const stats = getUsageStats()
      return res.status(200).json(stats)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    // Track a new usage
    try {
      const { projectId } = req.body
      const stats = trackUsage(projectId)
      return res.status(200).json(stats)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
