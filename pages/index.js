import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Dynamically import CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import('../components/CodeEditor'), {
  ssr: false,
})

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Wait until after client-side hydration to show the editor
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col">
      <Head>
        <title>Dreamer - AI Code Editor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" />
      </Head>

      <header className="bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 text-white p-2 shadow-lg">
        <div className="flex items-center">
          <div className="mr-2 text-yellow-400">✨</div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">Dreamer</h1>
          <span className="ml-2 text-xs opacity-80">AI Code Editor</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {mounted && <CodeEditor />}
      </main>

      <footer className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white p-1 text-center text-xs">
        <p className="opacity-80">Dreamer <span className="text-yellow-400">✨</span> Powered by Magic Loop AI</p>
      </footer>
    </div>
  )
}
