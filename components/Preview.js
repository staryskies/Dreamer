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
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <h3>Preview</h3>
        <button
          onClick={refreshPreview}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          key={key}
          srcDoc={getHtmlContent()}
          title="preview"
          className="w-full h-full border-none"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  )
}
