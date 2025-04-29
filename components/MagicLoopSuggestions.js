import { useState } from 'react'

export default function MagicLoopSuggestions({ suggestions, onApply, onCancel, error }) {
  const [selectedSuggestions, setSelectedSuggestions] = useState([])

  // Toggle selection of a suggestion
  const toggleSuggestion = (suggestion) => {
    if (selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)) {
      setSelectedSuggestions(selectedSuggestions.filter(s => s.lineNumber !== suggestion.lineNumber))
    } else {
      setSelectedSuggestions([...selectedSuggestions, suggestion])
    }
  }

  // Toggle selection of all suggestions
  const toggleAll = () => {
    if (selectedSuggestions.length === suggestions.length) {
      setSelectedSuggestions([])
    } else {
      setSelectedSuggestions([...suggestions])
    }
  }

  // Apply selected suggestions
  const handleApply = () => {
    // If no suggestions are selected, apply all of them
    if (selectedSuggestions.length === 0 && suggestions && suggestions.length > 0) {
      onApply(suggestions)
    } else {
      onApply(selectedSuggestions)
    }
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-gray-900" style={{animation: 'fadeIn 0.3s ease-out'}}>
        <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center shadow-md sticky top-0 z-10">
          <h3 className="text-red-400 flex items-center">
            <span className="text-red-300 mr-2">⚠️</span>
            Error
          </h3>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs smooth-transition"
          >
            Back to Editor
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center mb-2">
              <span className="text-red-300 mr-2">⚠️</span>
              <h3 className="font-medium">Dreamer encountered an error</h3>
            </div>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900" style={{animation: 'fadeIn 0.3s ease-out'}}>
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center shadow-md sticky top-0 z-10">
        <h3 className="gilded-text flex items-center">
          <span className="mr-2">✨</span>
          Dreamer Suggestions
        </h3>
        <div>
          {suggestions && suggestions.length > 0 && (
            <button
              onClick={toggleAll}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-md mr-2 text-xs smooth-transition"
              style={{boxShadow: '0 0 8px rgba(79, 70, 229, 0.3)'}}
            >
              {selectedSuggestions.length === suggestions.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          <button
            onClick={handleApply}
            className="px-3 py-1 rounded-md mr-2 text-xs smooth-transition bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            style={{boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)'}}
          >
            {selectedSuggestions.length === 0 ? 'Apply All' : `Apply (${selectedSuggestions.length})`}
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs smooth-transition"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="p-2 md:p-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {suggestions && suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg border border-gray-700 bg-gray-800 shadow-lg smooth-transition ${
                selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)
                  ? 'gilded-border'
                  : 'hover:border-gray-600'
              }`}
              style={{
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                transform: selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)
                  ? 'translateY(-1px)'
                  : 'none'
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold text-xs ${
                  selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)
                    ? 'gilded-text'
                    : 'text-blue-300'
                }`}>
                  ✨ Line {suggestion.lineNumber}
                </span>
                <label className="flex items-center bg-gray-700 hover:bg-gray-600 px-1.5 py-0.5 rounded-full cursor-pointer smooth-transition">
                  <input
                    type="checkbox"
                    checked={selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)}
                    onChange={() => toggleSuggestion(suggestion)}
                    className="mr-1 h-3 w-3 accent-yellow-400"
                  />
                  <span className="text-xs text-white">
                    {selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)
                      ? 'Selected'
                      : 'Select'}
                  </span>
                </label>
              </div>

              <div className="text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2">
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-0.5">Original:</h4>
                    <div className="bg-gray-900 p-1.5 rounded overflow-x-auto border border-gray-700 max-h-24 md:max-h-32">
                      <pre className="whitespace-pre-wrap break-all text-gray-300 text-xs">{suggestion.oldCode || "(empty line)"}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-0.5">Suggested:</h4>
                    <div className="bg-gray-900 p-1.5 rounded overflow-x-auto border border-gray-700 max-h-24 md:max-h-32">
                      <pre className="whitespace-pre-wrap break-all text-yellow-100 text-xs">{suggestion.newCode || "(delete line)"}</pre>
                    </div>
                  </div>
                </div>

                {suggestion.explanation && suggestion.explanation !== `Changed line ${suggestion.lineNumber}` && (
                  <div className="mt-1 text-xs text-blue-300 italic bg-gray-900 p-1.5 rounded border border-gray-700 max-h-16 overflow-y-auto">
                    <span className="text-yellow-400 mr-1">✨</span>
                    {suggestion.explanation}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <div className="text-5xl mb-4 gilded-text">✨</div>
            <p className="text-gray-300 mb-2">No suggestions available yet.</p>
            <p className="text-gray-500 text-xs">Enter a prompt and click "Get AI Suggestions" to see Dreamer's magic.</p>
          </div>
        )}
      </div>
    </div>
  )
}
