import { useEffect, useState } from 'react'

export default function CodeMirrorEditor({ value, onChange, language }) {
  // Simple textarea-based editor for now
  // This avoids client-side errors with CodeMirror
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-white"
      spellCheck="false"
      style={{
        resize: 'none',
        outline: 'none',
        border: 'none',
        tabSize: 2
      }}
    />
  )
}
