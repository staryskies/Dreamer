# Web Code Editor with Magic Loop AI

A mobile-compatible online web editor for HTML, CSS, and JavaScript with code saving functionality and AI-powered code suggestions using Magic Loop AI.

## Features

- Edit HTML, CSS, and JavaScript in separate tabs
- Live preview of your code
- Mobile-responsive design
- Local storage for saving your code
- AI-powered code suggestions with Magic Loop AI
- Accept or reject suggested changes

## Deployment to Vercel

This project is designed to be deployed on Vercel. Follow these steps to deploy:

1. Create a Vercel account if you don't have one already at [vercel.com](https://vercel.com)
2. Install the Vercel CLI: `npm i -g vercel`
3. Run `vercel login` and follow the prompts to log in
4. Navigate to the project directory and run `vercel` to deploy
5. Follow the prompts to configure your project
6. Once deployed, you can access your web editor at the provided URL

## Development

To run the project locally:

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Magic Loop AI Integration

This project uses Magic Loop AI to provide code suggestions. The API endpoint is:
```
https://magicloops.dev/api/loop/3d4346c0-56b5-49d4-9144-04ef31c603e1/run
```

The API accepts POST requests with the following JSON body:
```json
{
  "code": "Your code here",
  "changesWanted": "Description of changes to make"
}
```

The API returns the complete modified code in the following format:
```json
{
  "code": "def subtract(a, b):\n    return a - b"
}
```

The response contains:
- `code`: The complete modified code with all changes applied

This simplified approach makes it easier to apply changes to the entire codebase at once.

## Mobile Compatibility

The editor is designed to be fully functional on mobile devices with:
- Responsive layout that adapts to screen size
- Touch-friendly controls
- Optimized editor experience for smaller screens
