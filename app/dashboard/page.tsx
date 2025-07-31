// /app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { FiHeart, FiShare2, FiBookmark, FiTrash2, FiEdit } from 'react-icons/fi'

type Note = {
  id: string
  title: string
  content: string
  summary: string
  isFavorite: boolean
  createdAt: Date
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'new' | 'saved' | 'favorites'>('new')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [summary, setSummary] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)

  // Load saved notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        }))
        setNotes(parsedNotes)
      } catch (error) {
        console.error('Failed to parse saved notes', error)
      }
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const handleSummarize = async () => {
    if (!note.trim()) return
    
    setIsSummarizing(true)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note }),
      })

      if (!res.ok) throw new Error('Summarization failed')

      const data = await res.json()
      setSummary(data.summary)
    } catch (error) {
      console.error('Error summarizing note:', error)
      alert('Failed to summarize note. Please try again.')
    } finally {
      setIsSummarizing(false)
    }
  }

  const saveNote = () => {
    if (!note.trim() || !summary.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim() || `Note ${notes.length + 1}`,
      content: note,
      summary,
      isFavorite: false,
      createdAt: new Date()
    }

    setNotes([...notes, newNote])
    resetEditor()
  }

  const updateNote = () => {
    if (!editingId || !note.trim() || !summary.trim()) return

    setNotes(notes.map(n => 
      n.id === editingId 
        ? { ...n, title: title.trim() || n.title, content: note, summary }
        : n
    ))
    resetEditor()
  }

  const resetEditor = () => {
    setTitle('')
    setNote('')
    setSummary('')
    setEditingId(null)
    setActiveTab('saved')
  }

  const toggleFavorite = (id: string) => {
    setNotes(notes.map(n => 
      n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
    ))
  }

  const deleteNote = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(n => n.id !== id))
    }
  }

  const editNote = (note: Note) => {
    setTitle(note.title)
    setNote(note.content)
    setSummary(note.summary)
    setEditingId(note.id)
    setActiveTab('new')
  }

  const shareNote = async (note: Note) => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: note.title,
          text: `${note.title}\n\n${note.summary}`,
        })
      } else {
        await navigator.clipboard.writeText(`${note.title}\n\n${note.summary}`)
        alert('Note copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing note:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const filteredNotes = activeTab === 'favorites' 
    ? notes.filter(n => n.isFavorite)
    : activeTab === 'saved'
    ? notes
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            MindMuse Note
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {activeTab === 'new' 
              ? 'Create and summarize your notes' 
              : activeTab === 'favorites'
              ? 'Your favorite notes'
              : 'All your saved notes'}
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-lg bg-white p-1 shadow-sm border border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'new' ? 'bg-blue-100 text-blue-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('new')}
            >
              New Note
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'saved' ? 'bg-blue-100 text-blue-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved Notes ({notes.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'favorites' ? 'bg-blue-100 text-blue-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('favorites')}
            >
              Favorites ({notes.filter(n => n.isFavorite).length})
            </button>
          </div>
        </div>

        {activeTab === 'new' ? (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingId ? 'Edit Your Note' : 'Create New Note'}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-black"
                    placeholder="Give your note a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    id="note"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[200px] placeholder-black"
                    placeholder="Write your thoughts here..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSummarize}
                    disabled={!note.trim() || isSummarizing}
                  >
                    {isSummarizing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Summarizing...
                      </>
                    ) : 'Summarize Note'}
                  </button>
                  
                  {summary && (
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg shadow-md transition-all"
                      onClick={editingId ? updateNote : saveNote}
                    >
                      {editingId ? 'Update Note' : 'Save Note'}
                    </button>
                  )}
                  
                  {(note || summary) && (
                    <button
                      className="px-6 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm transition-all"
                      onClick={resetEditor}
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {summary && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        AI Generated
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      <p className="whitespace-pre-line">{summary}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800 truncate">{note.title}</h3>
                      <button
                        onClick={() => toggleFavorite(note.id)}
                        className={`p-2 rounded-full ${note.isFavorite ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'} transition-colors`}
                        aria-label={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <FiHeart className={note.isFavorite ? 'fill-current' : ''} />
                      </button>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                        {note.createdAt.toLocaleDateString()}
                      </span>
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {note.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Summary</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {note.summary}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editNote(note)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          aria-label="Edit note"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => shareNote(note)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          aria-label="Share note"
                          disabled={isSharing}
                        >
                          <FiShare2 />
                        </button>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                        aria-label="Delete note"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <FiBookmark className="text-blue-400 text-4xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'favorites' 
                    ? 'No favorite notes yet'
                    : 'No saved notes yet'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {activeTab === 'favorites' 
                    ? 'Click the heart icon on notes to add them to your favorites'
                    : 'Create your first note in the "New Note" tab'}
                </p>
                {activeTab !== 'favorites' && (
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition-all"
                  >
                    Create New Note
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}