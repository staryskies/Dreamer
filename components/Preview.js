import { useState, useEffect } from 'react'

export default function Preview({ html, css, js }) {
  const [key, setKey] = useState(0)

  // Create the HTML content for the iframe
  const getHtmlContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `
  }

  // Force refresh the iframe by changing its key
  const refreshPreview = () => {
    setKey(prevKey => prevKey + 1)
  }

  // Refresh when code changes
  useEffect(() => {
    refreshPreview()
  }, [html, css, js])

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white px-3 py-2 flex justify-between items-center shadow-md">
        <h3 className="text-sm gilded-text">✨ Preview</h3>
        <button
          onClick={refreshPreview}
          className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded text-xs smooth-transition"
          style={{boxShadow: '0 0 8px rgba(79, 70, 229, 0.3)'}}
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white opacity-10"></div>
        <iframe
          key={key}
          srcDoc={getHtmlContent()}
          title="preview"
          className="w-full h-full border-none relative z-10"
          sandbox="allow-scripts"
          style={{
            resize: 'both',
            overflow: 'auto',
            animation: 'fadeIn 0.3s ease-out'
          }}
        />
      </div>
    </div>
  )
}
