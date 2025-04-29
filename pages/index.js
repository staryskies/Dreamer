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
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Web Code Editor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <header className="bg-gray-800 text-white p-2 md:p-4">
        <h1 className="text-lg md:text-xl font-bold">Web Code Editor</h1>
      </header>

      <main className="flex-1 overflow-hidden">
        {mounted && <CodeEditor />}
      </main>

      <footer className="bg-gray-800 text-white p-1 md:p-2 text-center text-xs md:text-sm">
        <p>Web Code Editor with Magic Loop AI</p>
      </footer>
    </div>
  )
}
