import { useEffect, useRef } from 'react'

export default function Preview({ html, css, js }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    updatePreview()
  }, [html, css, js])

  const updatePreview = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    const document = iframe.contentDocument
    const documentContents = `
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

    document.open()
    document.write(documentContents)
    document.close()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <h3>Preview</h3>
        <button 
          onClick={updatePreview}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          ref={iframeRef}
          title="preview"
          className="w-full h-full border-none"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  )
}
