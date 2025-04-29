export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code, changes, codeType } = req.body

    if (!code || !codeType) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Call Magic Loop API
    const url = 'https://magicloops.dev/api/loop/559a78ca-8607-494f-8d39-ea002ea5b46c/run'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        changes: changes || `Improve this ${codeType} code`,
      }),
    })

    if (!response.ok) {
      throw new Error(`Magic Loop API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Process the response to match our expected format
    const suggestions = processMagicLoopResponse(data, code)

    return res.status(200).json({ suggestions })
  } catch (error) {
    console.error('Error calling Magic Loop API:', error)
    return res.status(500).json({ error: error.message })
  }
}

// Process Magic Loop response into our expected format
function processMagicLoopResponse(response, originalCode) {
  try {
    // Split the original code into lines for comparison
    const originalLines = originalCode.split('\n')

    // Handle the Magic Loop API response format which returns full code
    if (response.code && typeof response.code === 'string') {
      const newLines = response.code.split('\n')
      const suggestions = []

      // Compare original lines with new lines to find changes
      for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
        const oldLine = i < originalLines.length ? originalLines[i] : ''
        const newLine = i < newLines.length ? newLines[i] : ''

        // If the lines are different, create a suggestion
        if (oldLine !== newLine) {
          suggestions.push({
            lineNumber: i + 1,
            oldCode: oldLine,
            newCode: newLine,
            explanation: `Changed line ${i + 1}`
          })
        }
      }

      if (suggestions.length > 0) {
        return suggestions
      }
    }

    // Fallback if we can't parse the response
    return [
      {
        lineNumber: 1,
        oldCode: originalLines[0] || '',
        newCode: originalLines[0] || '',
        explanation: 'The AI suggested changes, but the format could not be parsed. Please try again.'
      }
    ]
  } catch (error) {
    console.error('Error processing Magic Loop response:', error)
    return [
      {
        lineNumber: 1,
        oldCode: originalCode.split('\n')[0] || '',
        newCode: originalCode.split('\n')[0] || '',
        explanation: 'Error processing AI suggestions. Please try again.'
      }
    ]
  }
}
