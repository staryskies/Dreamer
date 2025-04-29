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
    onApply(selectedSuggestions)
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-gray-900 p-4" style={{animation: 'fadeIn 0.3s ease-out'}}>
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 shadow-lg">
          <div className="flex items-center mb-2">
            <span className="text-red-300 mr-2">⚠️</span>
            <h3 className="font-medium">Dreamer encountered an error</h3>
          </div>
          <p className="text-sm opacity-90">{error}</p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-md self-start shadow-md smooth-transition"
        >
          Back to Editor
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-auto" style={{animation: 'fadeIn 0.3s ease-out'}}>
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center shadow-md">
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
            className={`px-3 py-1 rounded-md mr-2 text-xs smooth-transition ${
              selectedSuggestions.length === 0
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
            }`}
            disabled={selectedSuggestions.length === 0}
            style={{boxShadow: selectedSuggestions.length === 0 ? 'none' : '0 0 8px rgba(16, 185, 129, 0.3)'}}
          >
            Apply ({selectedSuggestions.length})
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs smooth-transition"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="p-2 md:p-4 overflow-auto">
        {suggestions && suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`mb-3 p-3 md:p-4 rounded-lg border border-gray-700 bg-gray-800 shadow-lg smooth-transition ${
                selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)
                  ? 'gilded-border'
                  : 'hover:border-gray-600'
              }`}
              style={{
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                transform: selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)
                  ? 'translateY(-2px)'
                  : 'none'
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`font-semibold text-sm ${
                  selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)
                    ? 'gilded-text'
                    : 'text-blue-300'
                }`}>
                  ✨ Line {suggestion.lineNumber}
                </span>
                <label className="flex items-center bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-full cursor-pointer smooth-transition">
                  <input
                    type="checkbox"
                    checked={selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)}
                    onChange={() => toggleSuggestion(suggestion)}
                    className="mr-1.5 h-3.5 w-3.5 accent-yellow-400"
                  />
                  <span className="text-xs text-white">
                    {selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)
                      ? 'Selected'
                      : 'Select'}
                  </span>
                </label>
              </div>

              <div className="text-xs md:text-sm">
                <div className="flex flex-col md:flex-row md:space-x-3">
                  <div className="flex-1 mb-2 md:mb-0">
                    <h4 className="text-xs font-medium text-gray-400 mb-1">Original:</h4>
                    <div className="bg-gray-900 p-2 rounded mb-2 overflow-x-auto border border-gray-700">
                      <pre className="whitespace-pre-wrap break-all text-gray-300">{suggestion.oldCode || "(empty line)"}</pre>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xs font-medium text-gray-400 mb-1">Suggested:</h4>
                    <div className="bg-gray-900 p-2 rounded overflow-x-auto border border-gray-700">
                      <pre className="whitespace-pre-wrap break-all text-yellow-100">{suggestion.newCode || "(delete line)"}</pre>
                    </div>
                  </div>
                </div>

                {suggestion.explanation && suggestion.explanation !== `Changed line ${suggestion.lineNumber}` && (
                  <div className="mt-2 text-xs text-blue-300 italic bg-gray-900 p-2 rounded border border-gray-700">
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
