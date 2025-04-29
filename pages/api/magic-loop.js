import { trackUsage } from '../../lib/storage'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code, changes, codeType, projectId } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Missing required code field' })
    }

    // Track API usage
    trackUsage(projectId)

    // Call Magic Loop API with the simplified endpoint
    const url = 'https://magicloops.dev/api/loop/3d4346c0-56b5-49d4-9144-04ef31c603e1/run'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        changesWanted: changes || `Improve this ${codeType || 'code'}`,
      }),
    })

    if (!response.ok) {
      throw new Error(`Magic Loop API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Magic Loop API response:', JSON.stringify(data, null, 2))

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

    // Check for the new format with modifiedCode property
    if (response && response.modifiedCode && typeof response.modifiedCode === 'string') {
      // Extract the code from the markdown-like format if needed
      let newCode = response.modifiedCode;

      // If the code is wrapped in markdown code blocks, extract it
      const codeBlockMatch = newCode.match(/```(?:html|css|js|javascript)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        newCode = codeBlockMatch[1];
      }

      // If original code is empty or just whitespace, treat the entire response as new code
      if (!originalCode.trim()) {
        // Return the entire new code as a single suggestion
        return [{
          lineNumber: 1,
          oldCode: '',
          newCode: newCode,
          explanation: 'AI generated new code'
        }];
      }

      const newLines = newCode.split('\n');
      const suggestions = [];

      // Compare original lines with new lines to find changes
      for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
        const oldLine = i < originalLines.length ? originalLines[i] : '';
        const newLine = i < newLines.length ? newLines[i] : '';

        // If the lines are different, create a suggestion
        if (oldLine !== newLine) {
          suggestions.push({
            lineNumber: i + 1,
            oldCode: oldLine,
            newCode: newLine,
            explanation: `Changed line ${i + 1}`
          });
        }
      }

      if (suggestions.length > 0) {
        return suggestions;
      }
    }

    // If the response has a 'code' property, it's the previous simplified API format
    if (response && response.code && typeof response.code === 'string') {
      const newCode = response.code;

      // If original code is empty or just whitespace, treat the entire response as new code
      if (!originalCode.trim()) {
        // Return the entire new code as a single suggestion
        return [{
          lineNumber: 1,
          oldCode: '',
          newCode: newCode,
          explanation: 'AI generated new code'
        }];
      }

      const newLines = newCode.split('\n');
      const suggestions = [];

      // Compare original lines with new lines to find changes
      for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
        const oldLine = i < originalLines.length ? originalLines[i] : '';
        const newLine = i < newLines.length ? newLines[i] : '';

        // If the lines are different, create a suggestion
        if (oldLine !== newLine) {
          suggestions.push({
            lineNumber: i + 1,
            oldCode: oldLine,
            newCode: newLine,
            explanation: `Changed line ${i + 1}`
          });
        }
      }

      if (suggestions.length > 0) {
        return suggestions;
      }
    }

    // Handle the line-by-line format if present
    if (Array.isArray(response)) {
      const suggestions = response.map(change => {
        const lineNumber = change.line_number || 1

        return {
          lineNumber,
          oldCode: change.original_line || (lineNumber <= originalLines.length ? originalLines[lineNumber - 1] : ''),
          newCode: change.new_line || '',
          explanation: `Changed line ${lineNumber}`
        }
      })

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
