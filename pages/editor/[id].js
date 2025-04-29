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
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Head>
        <title>{project.name} - Dreamer</title>
        <meta name="description" content="Dreamer AI Code Editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold gilded-text mr-2">✨</span>
            <h1 className="text-xl font-bold gilded-text">{project.name}</h1>
            {saveMessage && (
              <span className="ml-4 text-sm text-green-400 bg-green-900 bg-opacity-30 px-2 py-1 rounded">
                {saveMessage}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSave(project.html, project.css, project.js)}
              className={`px-3 py-1.5 text-sm rounded smooth-transition ${
                isSaving
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
              }`}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Project'}
            </button>
            <Link href="/dashboard" className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        <CodeEditor
          initialHtml={project.html}
          initialCss={project.css}
          initialJs={project.js}
          onSave={handleSave}
          projectId={project.id}
        />
      </main>
    </div>
  )
}
