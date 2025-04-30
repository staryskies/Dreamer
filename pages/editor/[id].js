import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import CodeEditor from '../../components/CodeEditor'

export default function ProjectEditor() {
  const router = useRouter()
  const { id } = router.query
  
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  
  // Fetch project data
  useEffect(() => {
    if (!id) return
    
    const fetchProject = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/projects/${id}`)
        
        if (!res.ok) {
          throw new Error('Failed to load project')
        }
        
        const data = await res.json()
        setProject(data.project)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProject()
  }, [id])
  
  // Save project changes
  const handleSave = async (html, css, js) => {
    if (!id) return
    
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html, css, js }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to save project')
      }
      
      const data = await res.json()
      setProject(data.project)
      setSaveMessage('Project saved successfully')
      
      // Clear the save message after 3 seconds
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          <p className="mt-4 text-xl">Loading project...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <div className="text-5xl mb-4 text-red-500">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Project</h1>
          <p className="mb-6 text-gray-300">{error}</p>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <div className="text-5xl mb-4 gilded-text">✨</div>
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="mb-6 text-gray-300">The project you're looking for doesn't exist or has been deleted.</p>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen w-screen flex flex-col">
      <Head>
        <title>{project.name} - Dreamer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" />
      </Head>

      <header className="bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 text-white p-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2 text-yellow-400 text-2xl">✨</div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">{project.name}</h1>
            {saveMessage && (
              <span className="ml-4 text-base text-green-400 bg-green-900 bg-opacity-30 px-3 py-1.5 rounded animate-pulse">
                {saveMessage}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSave(project.html, project.css, project.js)}
              className={`px-4 py-2 text-base rounded transition-all duration-200 ${
                isSaving
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
              } ${saveMessage ? 'animate-pulse' : ''}`}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Project'}
            </button>
            <Link href="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-base transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <CodeEditor
          initialHtml={project.html}
          initialCss={project.css}
          initialJs={project.js}
          onSave={handleSave}
          projectId={project.id}
        />
      </main>

      <footer className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white p-2 text-center text-sm">
        <p className="opacity-80">Dreamer <span className="text-yellow-400">✨</span> Powered by Magic Loop AI</p>
      </footer>
    </div>
  )
}
