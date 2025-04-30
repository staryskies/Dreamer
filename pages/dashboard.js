import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [usageStats, setUsageStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch projects and usage stats
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch projects
        const projectsRes = await fetch('/api/projects')
        const projectsData = await projectsRes.json()

        if (!projectsData.success) {
          throw new Error(projectsData.error || 'Failed to load projects')
        }

        // Fetch usage stats
        const usageRes = await fetch('/api/usage')
        const usageData = await usageRes.json()

        setProjects(projectsData.projects || [])
        setUsageStats(usageData)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data')
        console.error('Dashboard error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Create a new project
  const handleCreateProject = async (e) => {
    e.preventDefault()

    if (!newProjectName.trim()) {
      setError('Please enter a project name')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newProjectName }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create project')
      }

      // Add the new project to the list
      setProjects([...projects, data.project])

      // Clear the input
      setNewProjectName('')
    } catch (err) {
      setError(err.message || 'Failed to create project')
      console.error('Create project error:', err)
    } finally {
      setIsCreating(false)
    }
  }

  // Delete a project
  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete project')
      }

      // Remove the deleted project from the list
      setProjects(projects.filter(project => project.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Open a project in the editor
  const handleOpenProject = (id) => {
    router.push(`/editor/${id}`)
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    } catch (err) {
      return dateString
    }
  }

  // Get recent usage data for chart
  const getRecentUsage = () => {
    if (!usageStats || !usageStats.requestsByDate) return []

    const dates = Object.keys(usageStats.requestsByDate).sort()
    // Get the last 7 days or all days if less than 7
    const recentDates = dates.slice(-7)

    return recentDates.map(date => ({
      date,
      count: usageStats.requestsByDate[date]
    }))
  }

  const recentUsage = getRecentUsage()
  const maxUsage = recentUsage.length > 0 ? Math.max(...recentUsage.map(item => item.count)) : 0

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Dreamer Dashboard</title>
        <meta name="description" content="Dreamer AI Code Editor Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-yellow-400 mr-2">✨</span>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">Dreamer</h1>
            <span className="ml-2 text-gray-200">Dashboard</span>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/30"
          >
            New Project
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-red-300 mr-2">⚠️</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold gilded-text">Your Projects</h2>
                <form onSubmit={handleCreateProject} className="flex w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="New project name"
                    className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-l text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 w-full md:w-auto"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    disabled={isCreating}
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-r text-sm transition-all duration-300 ${
                      isCreating
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20'
                    }`}
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
                  </button>
                </form>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
                  <p className="mt-2 text-gray-400">Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-lg">
                  <div className="text-5xl mb-4 gilded-text">✨</div>
                  <p className="text-gray-300 mb-2">No projects yet</p>
                  <p className="text-gray-500 text-sm">Create your first project to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Created</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Last Updated</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="py-3 px-4">
                            <div className="font-medium gilded-text">{project.name}</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-300">
                            {formatDate(project.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-300">
                            {formatDate(project.updatedAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleOpenProject(project.id)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs"
                              >
                                Open
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-xs"
                                disabled={isDeleting}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Usage Stats Section */}
          <div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Usage Statistics</h2>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
                  <p className="mt-2 text-gray-400">Loading stats...</p>
                </div>
              ) : !usageStats ? (
                <div className="text-center py-8 bg-gray-900 rounded-lg">
                  <p className="text-gray-300">No usage data available</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Total Requests</div>
                      <div className="text-2xl font-bold gilded-text">{usageStats.totalRequests}</div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Projects</div>
                      <div className="text-2xl font-bold gilded-text">{projects.length}</div>
                    </div>
                  </div>

                  {/* Recent Usage Chart */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Recent AI Usage</h3>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      {recentUsage.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm">No recent usage data</p>
                        </div>
                      ) : (
                        <div className="h-40 flex items-end space-x-2">
                          {recentUsage.map((item) => (
                            <div key={item.date} className="flex flex-col items-center flex-1">
                              <div className="w-full flex justify-center">
                                <div
                                  className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t"
                                  style={{
                                    height: `${(item.count / maxUsage) * 100}%`,
                                    minHeight: '4px'
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 w-full text-center overflow-hidden text-ellipsis whitespace-nowrap">
                                {item.date.split('-').slice(1).join('/')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
