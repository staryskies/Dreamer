import { useState, useEffect } from 'react'
import CodeMirrorEditor from './CodeMirrorEditor'
import Preview from './Preview'
import MagicLoopSuggestions from './MagicLoopSuggestions'

const DEFAULT_HTML = '<div class="container">\n  <h1>Hello World</h1>\n  <p>Start editing to see some magic happen!</p>\n</div>'
const DEFAULT_CSS = '.container {\n  font-family: sans-serif;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n\nh1 {\n  color: #0070f3;\n}'
const DEFAULT_JS = 'console.log("Hello from JavaScript!");\n\n// Add your JavaScript code here\ndocument.querySelector("h1").addEventListener("click", () => {\n  alert("You clicked the heading!");\n});'

export default function CodeEditor({ initialHtml, initialCss, initialJs, onSave, projectId }) {
  // State for editor content
  const [html, setHtml] = useState(initialHtml || DEFAULT_HTML)
  const [css, setCss] = useState(initialCss || DEFAULT_CSS)
  const [js, setJs] = useState(initialJs || DEFAULT_JS)
  const [activeTab, setActiveTab] = useState('html')
  const [aiPrompt, setAiPrompt] = useState('')

  // State for Magic Loop suggestions
  const [suggestions, setSuggestions] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Auto-save when code changes (if onSave is provided)
  useEffect(() => {
    if (onSave) {
      const saveTimer = setTimeout(() => {
        onSave(html, css, js)
      }, 1000) // Auto-save after 1 second of inactivity

      return () => clearTimeout(saveTimer)
    }
  }, [html, css, js, onSave])

  // If no project is loaded, use localStorage for persistence
  useEffect(() => {
    if (!projectId) {
      try {
        const savedHtml = localStorage.getItem('editor-html')
        const savedCss = localStorage.getItem('editor-css')
        const savedJs = localStorage.getItem('editor-js')

        if (savedHtml) setHtml(savedHtml)
        if (savedCss) setCss(savedCss)
        if (savedJs) setJs(savedJs)
      } catch (err) {
        console.error('Error loading from localStorage:', err)
      }
    }
  }, [projectId])

  // Save to localStorage only if not using a project
  useEffect(() => {
    if (!projectId) {
      try {
        localStorage.setItem('editor-html', html)
        localStorage.setItem('editor-css', css)
        localStorage.setItem('editor-js', js)
      } catch (err) {
        console.error('Error saving to localStorage:', err)
      }
    }
  }, [html, css, js, projectId])

  // Get suggestions from Magic Loop AI
  const getSuggestions = async (codeType) => {
    setIsLoading(true)
    setError(null)

    try {
      let code = ''
      let prompt = aiPrompt || 'Improve this code'

      switch (codeType) {
        case 'html':
          // If HTML is empty, use a filler template
          code = html.trim() ? html : '<div>\n  <h1>Hello World</h1>\n  <p>Start editing to see some magic happen!</p>\n</div>'
          break
        case 'css':
          // If CSS is empty, use a filler template
          code = css.trim() ? css : 'body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}'
          break
        case 'js':
          // If JS is empty, use a filler template
          code = js.trim() ? js : '// Add your JavaScript here\nconsole.log("Hello from Dreamer!");'
          break
        default:
          throw new Error('Invalid code type')
      }

      const response = await fetch('/api/magic-loop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          changes: prompt,
          changesWanted: prompt,
          codeType,
          projectId,
          directApply: false // Default to false for normal operation
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get suggestions')
      }

      const data = await response.json()
      setSuggestions({
        codeType,
        suggestions: data.suggestions,
        rawResponse: data.rawResponse // Store the raw response for direct application
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Directly apply the raw response without parsing
  const handleDirectApply = async () => {
    if (!suggestions) return

    const { codeType, rawResponse } = suggestions

    try {
      const response = await fetch('/api/magic-loop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeType === 'html' ? html : codeType === 'css' ? css : js,
          changes: aiPrompt || 'Improve this code',
          codeType,
          projectId,
          directApply: true,
          rawResponse // Pass the raw response for direct application
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to apply changes directly')
      }

      const data = await response.json()
      
      // Update the appropriate state with the directly applied code
      if (codeType === 'html') {
        setHtml(data.modifiedCode)
      } else if (codeType === 'css') {
        setCss(data.modifiedCode)
      } else if (codeType === 'js') {
        setJs(data.modifiedCode)
      }

      // Clear suggestions after direct application
      setSuggestions(null)
    } catch (err) {
      setError(err.message)
    }
  }

  // Apply accepted suggestions
  const applySuggestions = (acceptedSuggestions) => {
    if (!suggestions) return

    const { codeType } = suggestions

    // If there are suggestions to apply
    if (acceptedSuggestions.length > 0) {
      // Check if we're dealing with a complete code replacement (empty starting code)
      const isCompleteReplacement = acceptedSuggestions.length === 1 &&
                                   acceptedSuggestions[0].lineNumber === 1 &&
                                   acceptedSuggestions[0].oldCode === '' &&
                                   acceptedSuggestions[0].explanation === 'AI generated new code';

      if (isCompleteReplacement) {
        // For complete replacements, just use the new code directly
        const newCode = acceptedSuggestions[0].newCode;

        // Update the appropriate state
        if (codeType === 'html') {
          setHtml(newCode)
        } else if (codeType === 'css') {
          setCss(newCode)
        } else if (codeType === 'js') {
          setJs(newCode)
        }
      } else {
        // For partial changes, apply line by line
        // Get the current code
        let currentCode = codeType === 'html' ? html : codeType === 'css' ? css : js

        // Create a new array of lines that will be our final code
        let lines = currentCode.split('\n')

        // Sort suggestions by line number in ascending order
        const sortedSuggestions = [...acceptedSuggestions].sort((a, b) => a.lineNumber - b.lineNumber)

        // Apply each suggestion
        sortedSuggestions.forEach(suggestion => {
          if (suggestion.lineNumber > 0) {
            // If the line number is beyond the current length, add empty lines to fill the gap
            while (suggestion.lineNumber > lines.length + 1) {
              lines.push('')
            }

            // If the line number is within range, replace it
            if (suggestion.lineNumber <= lines.length) {
              lines[suggestion.lineNumber - 1] = suggestion.newCode
            } else {
              // If it's a new line at the end
              lines.push(suggestion.newCode)
            }
          }
        })

        // Join the lines back into a single string
        const updatedCode = lines.join('\n')

        // Update the appropriate state
        if (codeType === 'html') {
          setHtml(updatedCode)
        } else if (codeType === 'css') {
          setCss(updatedCode)
        } else if (codeType === 'js') {
          setJs(updatedCode)
        }
      }
    }

    // Clear suggestions
    setSuggestions(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col h-full">
          <div className="bg-gray-800 text-white px-3 py-2 flex justify-between items-center shadow-md">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                  activeTab === 'html'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                  activeTab === 'css'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                CSS
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                  activeTab === 'js'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                JavaScript
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="px-3 py-1 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => getSuggestions(activeTab)}
                disabled={isLoading}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                } text-white shadow-md`}
              >
                {isLoading ? 'Loading...' : 'Get AI Suggestions'}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <textarea
              value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
              onChange={(e) => {
                const value = e.target.value
                if (activeTab === 'html') setHtml(value)
                else if (activeTab === 'css') setCss(value)
                else setJs(value)
              }}
              className="w-full h-full p-4 bg-gray-900 text-white font-mono text-sm focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex-1 h-full border-l border-gray-700">
          <Preview html={html} css={css} js={js} />
        </div>
      </div>
    </div>
  )
}
