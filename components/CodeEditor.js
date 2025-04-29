import { useState, useEffect } from 'react'
import CodeMirrorEditor from './CodeMirrorEditor'
import Preview from './Preview'
import MagicLoopSuggestions from './MagicLoopSuggestions'

const DEFAULT_HTML = '<div class="container">\n  <h1>Hello World</h1>\n  <p>Start editing to see some magic happen!</p>\n</div>'
const DEFAULT_CSS = '.container {\n  font-family: sans-serif;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n\nh1 {\n  color: #0070f3;\n}'
const DEFAULT_JS = 'console.log("Hello from JavaScript!");\n\n// Add your JavaScript code here\ndocument.querySelector("h1").addEventListener("click", () => {\n  alert("You clicked the heading!");\n});'

export default function CodeEditor() {
  // State for editor content
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [css, setCss] = useState(DEFAULT_CSS)
  const [js, setJs] = useState(DEFAULT_JS)
  const [activeTab, setActiveTab] = useState('html')

  // State for Magic Loop suggestions
  const [suggestions, setSuggestions] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load saved code from localStorage on mount
  useEffect(() => {
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
  }, [])

  // Save code to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('editor-html', html)
      localStorage.setItem('editor-css', css)
      localStorage.setItem('editor-js', js)
    } catch (err) {
      console.error('Error saving to localStorage:', err)
    }
  }, [html, css, js])

  // State for AI prompt
  const [aiPrompt, setAiPrompt] = useState('')

  // Get suggestions from Magic Loop AI
  const getSuggestions = async (codeType) => {
    setIsLoading(true)
    setError(null)

    try {
      let code = ''
      let prompt = aiPrompt || 'Improve this code'

      switch (codeType) {
        case 'html':
          code = html
          break
        case 'css':
          code = css
          break
        case 'js':
          code = js
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
          codeType
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get suggestions')
      }

      const data = await response.json()
      setSuggestions({
        codeType,
        suggestions: data.suggestions
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply accepted suggestions
  const applySuggestions = (acceptedSuggestions) => {
    if (!suggestions) return

    const { codeType } = suggestions

    // If all suggestions are selected, we can just apply the entire new code
    // This is more reliable than applying line by line
    if (acceptedSuggestions.length > 0) {
      // Get the current code
      let currentCode = codeType === 'html' ? html : codeType === 'css' ? css : js

      // Create a new array of lines that will be our final code
      let lines = currentCode.split('\n')

      // Sort suggestions by line number in ascending order
      const sortedSuggestions = [...acceptedSuggestions].sort((a, b) => a.lineNumber - b.lineNumber)

      // Apply each suggestion
      sortedSuggestions.forEach(suggestion => {
        if (suggestion.lineNumber > 0 && suggestion.lineNumber <= lines.length + 1) {
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

    // Clear suggestions
    setSuggestions(null)
  }

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="h-full flex flex-col" style={{animation: 'fadeIn 0.5s ease-out'}}>
      {/* Top Bar with Tabs */}
      <div className="flex bg-gray-900 text-white shadow-md">
        <button
          className={`px-3 py-2 text-sm smooth-transition ${activeTab === 'html'
            ? 'bg-gray-800 border-b-2 gilded-text font-medium'
            : 'hover:bg-gray-800'}`}
          onClick={() => handleTabChange('html')}
        >
          HTML
        </button>
        <button
          className={`px-3 py-2 text-sm smooth-transition ${activeTab === 'css'
            ? 'bg-gray-800 border-b-2 gilded-text font-medium'
            : 'hover:bg-gray-800'}`}
          onClick={() => handleTabChange('css')}
        >
          CSS
        </button>
        <button
          className={`px-3 py-2 text-sm smooth-transition ${activeTab === 'js'
            ? 'bg-gray-800 border-b-2 gilded-text font-medium'
            : 'hover:bg-gray-800'}`}
          onClick={() => handleTabChange('js')}
        >
          JS
        </button>
      </div>

      {/* AI Prompt Input */}
      <div className="flex p-2 bg-gray-800 text-white shadow-md gilded-border">
        <input
          type="text"
          placeholder="✨ Ask Dreamer to enhance your code (e.g., 'add a dark mode toggle')"
          className="flex-1 px-3 py-1.5 text-sm bg-gray-900 border border-gray-700 rounded-l focus:outline-none focus:ring-1 focus:ring-yellow-500 smooth-transition"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
        />
        <button
          className={`px-3 py-1.5 text-sm rounded-r smooth-transition ${isLoading
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'}`}
          onClick={() => getSuggestions(activeTab)}
          disabled={isLoading}
          style={{boxShadow: isLoading ? 'none' : '0 0 10px rgba(79, 70, 229, 0.4)'}}
        >
          {isLoading ? 'Dreaming...' : '✨ Get AI Suggestions'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Editor Section */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gray-900 smooth-transition"
             style={{animation: 'slideIn 0.3s ease-out'}}>
          {activeTab === 'html' && (
            <CodeMirrorEditor
              value={html}
              onChange={setHtml}
              language="html"
            />
          )}
          {activeTab === 'css' && (
            <CodeMirrorEditor
              value={css}
              onChange={setCss}
              language="css"
            />
          )}
          {activeTab === 'js' && (
            <CodeMirrorEditor
              value={js}
              onChange={setJs}
              language="javascript"
            />
          )}
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full border-t md:border-t-0 md:border-l border-gray-700 bg-gray-900 smooth-transition"
             style={{animation: 'slideIn 0.3s ease-out 0.1s both'}}>
          {suggestions ? (
            <MagicLoopSuggestions
              suggestions={suggestions.suggestions}
              onApply={applySuggestions}
              onCancel={() => setSuggestions(null)}
              error={error}
            />
          ) : (
            <Preview html={html} css={css} js={js} />
          )}
        </div>
      </div>
    </div>
  )
}
