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
      <div className="h-full flex flex-col bg-gray-100 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md self-start"
        >
          Back to Editor
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 overflow-auto">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <h3>AI Suggestions</h3>
        <div>
          {suggestions && suggestions.length > 0 && (
            <button
              onClick={toggleAll}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md mr-2 text-xs"
            >
              {selectedSuggestions.length === suggestions.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          <button
            onClick={handleApply}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md mr-2 text-xs"
            disabled={selectedSuggestions.length === 0}
          >
            Apply ({selectedSuggestions.length})
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-xs"
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
              className="mb-2 p-2 md:p-4 rounded-lg border border-gray-300 bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">Line {suggestion.lineNumber}</span>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSuggestions.some(s => s.lineNumber === suggestion.lineNumber)}
                    onChange={() => toggleSuggestion(suggestion)}
                    className="mr-1 h-4 w-4"
                  />
                  <span className="text-xs">Select</span>
                </label>
              </div>

              <div className="text-xs md:text-sm">
                <div className="flex flex-col md:flex-row md:space-x-2">
                  <div className="flex-1 mb-2 md:mb-0">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Original:</h4>
                    <div className="bg-gray-100 p-1 rounded overflow-x-auto">
                      <code>{suggestion.oldCode || "(empty line)"}</code>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Suggested:</h4>
                    <div className="bg-gray-100 p-1 rounded overflow-x-auto">
                      <code>{suggestion.newCode || "(delete line)"}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No suggestions available.</p>
          </div>
        )}
      </div>
    </div>
  )
}
