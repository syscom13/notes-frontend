import React, { useState, useEffect } from 'react'
import noteService from './services/notes'
import Note from './components/Note'
import Notification from './components/Notification'
import Footer from './components/Footer'

const App = () => {
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('')
    const [showAll, setShowAll] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchNotes = async () => {
            const initialNotes = await noteService.getAll()
            setNotes(initialNotes)
        }

        try {
            fetchNotes()
        } catch (error) {
            setError('Initial notes could not be fetched')
            setTimeout(() => {
                setError(null)
            }, 5000)
        }

    }, [])

    const addNote = async e => {
        e.preventDefault()

        const noteObject = {
            id: Math.floor(Math.random()*10000),
            content: newNote,
            date: new Date().toISOString(),
            important: Math.random() > 0.5
        }

        try {
            const returnedNote = await noteService.create(noteObject)
            setNotes(notes.concat(returnedNote))
            setNewNote('')
        } catch (error) {
            setError(`"${noteObject.content}" could not be added to the database`)
            setTimeout(() => {
                setError(null)
            }, 5000)
        }
    }

    const handleNoteChange = e => {
        setNewNote(e.target.value)
    }

    const toggleImportance = async id => {
        const note = notes.find(note => note.id === id)
        const changedNote = { ...note, important: !note.important }

        try {
            const returnedNote = await noteService.update(id, changedNote)
            setNotes(notes.map(note => note.id === id ? returnedNote : note))
        } catch (error) {
            setError(`The note "${note.content}" was already deleted from the server`)
            setTimeout(() => {
                setError(null)
            }, 5000)
            setNotes(notes.filter(n => n.id !== note.id))
        }
    }

    const notesToShow = () => showAll ? notes : notes.filter(note => note.important)

    const renderNotes = () => {
        if (!notes) return null
        return notesToShow().map(note => {
            return (
                <Note 
                    key={note.id} 
                    note={note} 
                    toggleImportance={() => toggleImportance(note.id)} 
                />
            )
        })
    }

    return (
        <div>
            <h1>Notes</h1>
            <Notification message={error} />
            <div>
                <button onClick={() => setShowAll(!showAll)}>
                    show { showAll ? 'important' : 'all' }
                </button>
            </div>
            <ul>
                {renderNotes()}
            </ul>
            <form onSubmit={addNote}>
                <input 
                    type="text"
                    value={newNote}
                    onChange={handleNoteChange}
                />
                <button type="submit">Save</button>
            </form>
            <Footer />
        </div>
    )
}

export default App