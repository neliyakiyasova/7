function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4); 
  const base64 = (base64String + padding)
    .replace(/-/g, '+') 
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i); 
  }
  return outputArray; 
}

import React, { useState, useEffect } from 'react';
import Shell from './Shell.jsx'; 

const App = () => {
  const [note, setNote] = useState(''); 
  const [notes, setNotes] = useState([]);
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    setTimeout(() => {
      const saved = localStorage.getItem('notes'); 
      setNotes(saved ? JSON.parse(saved) : []); 
      setIsLoading(false); // всё, загрузка завершена
    }, 500); // 0.5 секунды "эмуляции" 
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('notes', JSON.stringify(notes));
      console.log('Заметки сохранены:', notes); 
    }
  }, [notes, isLoading]);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  
  useEffect(() => {
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      }
    };
    checkSubscription();
  }, []);

 

  const addNote = () => {
    if (note.trim() === "") return;
    const updatedNotes = [...notes, note]; 
    setNotes(updatedNotes);
    setNote("");

    // Уведомление при добавлении
    if (isSubscribed && Notification.permission === "granted") { 
      new Notification("Задача добавлена", {
        body: `"${note}" успешно добавлена в список задач.`, 
      });
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

  

  const getPublicKey = async () => {
    const res = await fetch('/vapid-key.json'); 
    const data = await res.json();
    return data.publicKey;
  };

  
  const handleSubscribe = async () => {
    const permission = await Notification.requestPermission(); 
    if (permission !== 'granted') {
      console.log('Уведомления отклонены пользователем'); 
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription(); 
    const publicKey = await getPublicKey();
  
    try {
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey), 
      });
  
      console.log('Подписка оформлена или найдена:', subscription);
      setIsSubscribed(true);
  
      const response = await fetch('http://localhost:4000/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(subscription)
      });
  
      if (response.ok) {
        console.log('Подписка отправлена на сервер');
      } else {
        console.error('Ошибка отправки подписки на сервер');
      }
    } catch (error) {
      console.error('Ошибка при подписке:', error);
    }
  };

  

  const unsubscribe = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription(); 
    if (subscription) {
      await subscription.unsubscribe(); 
      console.log('Подписка удалена'); 
      setIsSubscribed(false);
    } else {
      console.log('Нет активной подписки для удаления'); 
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="notes-app">
          <div className="loader"></div>
          <p style={{ textAlign: 'center' }}>Загрузка заметок...</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="notes-app">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Мои заметки</h1>
          <button className='darkmode-button' onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Светлая тема' : 'Тёмная тема'}
          </button>
        </div>

        <input
          type="text"
          className="note-input" 
          placeholder="Введите заметку" 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addNote()}
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
        <button onClick={handleSubscribe} className="notify-button"> 
          {isSubscribed ? 'Уведомления включены' : 'Включить уведомления'}
        </button>
        {isSubscribed && (
          <button onClick={unsubscribe} className="notify-button" style={{ marginTop:'10px' }}>
            Сбросить подписку
          </button> 

        )}

        {isSubscribed && (
          <button onClick={async () => {
            const res = await fetch('http://localhost:4000/send', {
              method: 'POST',
            });
            if (res.ok) {
              console.log('Уведомление отправлено');
            } else {
              console.error('Ошибка при отправке уведомления');
            } 
          }}
          className="notify-button" 
          style={{ marginTop: '10px' }}
          >
            Проверить уведомление 
          </button>
        )}
      </div>
    </Shell>
  );
}

export default App;


