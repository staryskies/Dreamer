import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import Preview from './Preview'
import MagicLoopSuggestions from './MagicLoopSuggestions'

const DEFAULT_FILES = {
  'index.html': {
    name: 'index.html',
    content: '<div class="container">\n  <h1>Hello World</h1>\n  <p>Start editing to see some magic happen!</p>\n</div>',
    language: 'html'
  },
  'styles.css': {
    name: 'styles.css',
    content: '.container {\n  font-family: sans-serif;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n\nh1 {\n  color: #0070f3;\n}',
    language: 'css'
  },
  'script.js': {
    name: 'script.js',
    content: 'console.log("Hello from JavaScript!");\n\n// Add your JavaScript code here',
    language: 'javascript'
  }
}

export default function CodeEditor({ initialHtml, initialCss, initialJs, onSave, projectId }) {
  const [files, setFiles] = useState(DEFAULT_FILES)
  const [activeFile, setActiveFile] = useState('index.html')
  const [showConsole, setShowConsole] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState([])
  const [aiPrompt, setAiPrompt] = useState('')
  const [suggestions, setSuggestions] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Auto-save when code changes
  useEffect(() => {
    if (onSave) {
      const saveTimer = setTimeout(() => {
        onSave(files['index.html'].content, files['styles.css'].content, files['script.js'].content)
      }, 1000)
      return () => clearTimeout(saveTimer)
    }
  }, [files, onSave])

  // Handle console output
  useEffect(() => {
    if (files[activeFile]?.language === 'javascript') {
      setShowConsole(true)
    } else {
      setShowConsole(false)
    }
  }, [activeFile, files])

  const handleFileChange = (fileName, content) => {
    setFiles(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        content
      }
    }))
  }

  const createNewFile = () => {
    const fileName = prompt('Enter file name (e.g., newfile.js):')
    if (fileName) {
      const extension = fileName.split('.').pop()
      const language = {
        'js': 'javascript',
        'ts': 'typescript',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby',
        'php': 'php',
        'sh': 'shell',
        'md': 'markdown'
      }[extension] || 'plaintext'

      setFiles(prev => ({
        ...prev,
        [fileName]: {
          name: fileName,
          content: '',
          language
        }
      }))
      setActiveFile(fileName)
    }
  }

  const handleRun = () => {
    if (files[activeFile]?.language === 'javascript') {
      try {
        const originalConsole = console
        const newConsole = {
          log: (...args) => {
            setConsoleOutput(prev => [...prev, { type: 'log', args }])
            originalConsole.log(...args)
          },
          error: (...args) => {
            setConsoleOutput(prev => [...prev, { type: 'error', args }])
            originalConsole.error(...args)
          },
          warn: (...args) => {
            setConsoleOutput(prev => [...prev, { type: 'warn', args }])
            originalConsole.warn(...args)
          },
          info: (...args) => {
            setConsoleOutput(prev => [...prev, { type: 'info', args }])
            originalConsole.info(...args)
          }
        }
        window.console = newConsole
        eval(files[activeFile].content)
        window.console = originalConsole
      } catch (error) {
        setConsoleOutput(prev => [...prev, { type: 'error', args: [error.message] }])
      }
    }
  }

  const getSuggestions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/magic-loop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: files[activeFile].content,
          changes: aiPrompt.replace(/```html\n|\n```/g, '').trim(),
          codeType: files[activeFile].language,
          projectId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get suggestions')
      }

      const data = await response.json()
      setSuggestions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-yellow-400 text-2xl">✨</span>
          <h2 className="text-2xl font-bold text-white">Code Editor</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={createNewFile}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            New File
          </button>
          <button
            onClick={handleRun}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg"
          >
            Run
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* File Explorer */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-2">
              {Object.keys(files).map(fileName => (
                <button
                  key={fileName}
                  onClick={() => setActiveFile(fileName)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors duration-200 ${
                    activeFile === fileName
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={files[activeFile]?.language}
                value={files[activeFile]?.content}
                theme="vs-dark"
                onChange={value => handleFileChange(activeFile, value)}
                options={{
                  fontSize: '1.2rem',
                  lineHeight: 1.6,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  renderWhitespace: 'selection',
                  tabSize: 2,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible',
                    useShadows: false,
                    verticalScrollbarSize: '1rem',
                    horizontalScrollbarSize: '1rem'
                  }
                }}
              />
            </div>

            {/* Console */}
            {showConsole && (
              <div className="h-48 bg-gray-900 border-t border-gray-700 p-4 overflow-y-auto">
                <div className="text-white font-mono text-sm">
                  {consoleOutput.map((output, index) => (
                    <div key={index} className={`mb-1 ${output.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                      {output.args.map((arg, i) => (
                        <span key={i}>{typeof arg === 'object' ? JSON.stringify(arg) : String(arg)} </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
