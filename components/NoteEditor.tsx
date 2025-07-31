'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import axios from 'axios'

export default function NoteEditor() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const saveNote = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      setMessage('❗ Please write something before saving.')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('⏳ Generating summary...')
    setMessageType('')

    try {
      const summaryResponse = await axios.post('/api/summarize', { content: trimmed })
      const summary = summaryResponse.data.summary

      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (!user || userError) {
        throw userError || new Error('User not authenticated.')
      }

      const { error } = await supabase.from('notes').insert([
        {
          user_id: user.id,
          content: trimmed,
          summary,
        },
      ])

      if (error) throw error

      setMessage('✅ Note saved and summarized successfully!')
      setMessageType('success')
      setContent('')
    } catch (err) {
      console.error(err)
      setMessage('❌ Failed to save note. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">🧠 MindMuse — Smart Note Editor</h1>
      
      <label htmlFor="noteContent" className="block text-gray-700 mb-2 font-medium">
        Your Thoughts
      </label>
      <textarea
        id="noteContent"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        rows={8}
        placeholder="Start writing your thoughts..."
      />

      <button
        onClick={saveNote}
        disabled={loading}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 1010 10h-4a6 6 0 11-6-6z" />
            </svg>
            Saving...
          </>
        ) : (
          '💾 Save Note'
        )}
      </button>

      {message && (
        <p
          className={`mt-4 text-center text-sm font-medium ${
            messageType === 'success' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
