import { useEffect, useState } from 'react'

export default function CodeMirrorEditor({ value, onChange, language }) {
  // Simple textarea-based editor with enhanced styling
  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 p-1 text-xs text-gray-500 opacity-70 z-10">
        {language.toUpperCase()}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100"
        spellCheck="false"
        style={{
          resize: 'none',
          outline: 'none',
          border: 'none',
          tabSize: 2,
          caretColor: '#f7d58b',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.3s ease-out'
        }}
        placeholder="Start coding here..."
      />
      <div className="absolute bottom-2 right-2 text-xs text-gray-600 opacity-50">
        ✨ Dreamer
      </div>
    </div>
  )
}
