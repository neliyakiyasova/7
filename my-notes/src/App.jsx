import React, { useState, useEffect } from 'react';

const App = () => {
  const [note, setNote] = useState(''); 
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : []; 
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');

    
  useEffect(() => {
    console.log('Сохраняем:', notes);
    localStorage.setItem('notes', JSON.stringify(notes)); 
  }, [notes]);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const addNote = () => {
    if (note.trim()) {
      setNotes([...notes, note.trim()]);
      setNote('');
    }
  };

  const deleteNote = (index) => {
    const updated = notes.filter((_, i) => i !== index); 
    setNotes(updated);
  };
  
  const startEdit = (index) => {
    setEditingIndex(index);
    setEditingText(notes[index]);
  };

  const saveEdit = () => {
    const updatedNotes = [...notes];
    updatedNotes[editingIndex] = editingText.trim();
    setNotes(updatedNotes);
    setEditingIndex(null);
    setEditingText('');
  };



  return (
    <div className="notes-app">
    
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Мои заметки</h1>
        <button className='darkmode-button'  onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </div>

      <input
        type="text"
        className="note-input" 
        placeholder="Введите заметку" 
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button className="add-button" onClick={addNote}> 
        Добавить
      </button>

      <ul className="notes-list"> 
        {notes.map((n, index) => (
          <li key={index} className="note-item"> 
            {editingIndex === index ? (
              <>
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="note-input"
                  style={{ marginBottom: 0 }}
                />
                <button className="add-button" onClick={saveEdit}>Сохранить</button>
              </>
            ) : (
              <>
                <span>{n}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="add-button" onClick={() => startEdit(index)}>Редактировать</button>
                  <button className="delete-button" onClick={() => deleteNote(index)}>Удалить</button>
                </div>
              </>
            )}
          </li> 
        ))}
      </ul> 
    </div>
  ); 
};

export default App;

