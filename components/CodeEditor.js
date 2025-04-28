import { useState, useEffect, useRef } from 'react'
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
    const savedHtml = localStorage.getItem('editor-html')
    const savedCss = localStorage.getItem('editor-css')
    const savedJs = localStorage.getItem('editor-js')
    
    if (savedHtml) setHtml(savedHtml)
    if (savedCss) setCss(savedCss)
    if (savedJs) setJs(savedJs)
  }, [])

  // Save code to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('editor-html', html)
    localStorage.setItem('editor-css', css)
    localStorage.setItem('editor-js', js)
  }, [html, css, js])

  // Get suggestions from Magic Loop AI
  const getSuggestions = async (codeType) => {
    setIsLoading(true)
    setError(null)
    
    try {
      let code = ''
      let prompt = ''
      
      switch (codeType) {
        case 'html':
          code = html
          prompt = 'Improve the HTML structure and semantics'
          break
        case 'css':
          code = css
          prompt = 'Enhance the CSS styling and responsiveness'
          break
        case 'js':
          code = js
          prompt = 'Optimize the JavaScript code and functionality'
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
    
    // Sort suggestions by line number in descending order to avoid offset issues
    const sortedSuggestions = [...acceptedSuggestions].sort((a, b) => b.lineNumber - a.lineNumber)
    
    let updatedCode = codeType === 'html' ? html : codeType === 'css' ? css : js
    
    // Apply each suggestion
    sortedSuggestions.forEach(suggestion => {
      const lines = updatedCode.split('\n')
      lines[suggestion.lineNumber - 1] = suggestion.newCode
      updatedCode = lines.join('\n')
    })
    
    // Update the appropriate state
    if (codeType === 'html') {
      setHtml(updatedCode)
    } else if (codeType === 'css') {
      setCss(updatedCode)
    } else if (codeType === 'js') {
      setJs(updatedCode)
    }
    
    // Clear suggestions
    setSuggestions(null)
  }

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Editor Section */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
        {/* Editor Tabs */}
        <div className="flex bg-gray-800 text-white">
          <button 
            className={`px-4 py-2 ${activeTab === 'html' ? 'bg-gray-700 border-b-2 border-blue-500' : ''}`}
            onClick={() => handleTabChange('html')}
          >
            HTML
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'css' ? 'bg-gray-700 border-b-2 border-blue-500' : ''}`}
            onClick={() => handleTabChange('css')}
          >
            CSS
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'js' ? 'bg-gray-700 border-b-2 border-blue-500' : ''}`}
            onClick={() => handleTabChange('js')}
          >
            JS
          </button>
          <div className="ml-auto">
            <button 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md mr-2"
              onClick={() => getSuggestions(activeTab)}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Get AI Suggestions'}
            </button>
          </div>
        </div>
        
        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
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
      </div>
      
      {/* Preview and Suggestions Section */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
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
  )
}
