import express from 'express'; 
import webpush from 'web-push'; 
import bodyParser from 'body-parser'; 
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const app = express(); 
app.use(cors()); 
app.use(bodyParser.json());

// eslint-disable-next-line no-undef
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
// eslint-disable-next-line no-undef
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
webpush.setVapidDetails( 
    'mailto:your-email@example.com', 
    publicVapidKey, 
    privateVapidKey
);
    // временное хранилище подписок (в реальности — база данных) 
let subscriptions = [];
    
app.post('/subscribe', (req, res) => {
    const subscription = req.body; 
    subscriptions.push(subscription); 
    res.status(201).json({ message: 'Подписка сохранена' });
});


app.post('/send', async (req, res) => { 
    const payload = JSON.stringify({
        title: 'Напоминание',
        body: 'У вас есть незавершённые задачи', 
    });
    // ⏱ Задержка в 5 секунд перед отправкой уведомления 
    setTimeout(async () => {
        try {
            await Promise.all(
                subscriptions.map(sub => 
                    webpush.sendNotification(sub, payload).catch(err =>
                        console.error('Ошибка при отправке:', err) 
                    )
                ) 
            );
            res.status(200).json({ message: 'Уведомления отправлены' }); 
        } catch (error) {
            console.error('Ошибка отправки:', error);
            res.sendStatus(500); 
        }
    }, 5000); // 5 секунд
});
    
const PORT = 4000; 
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`); 
});

// Периодическая отправка уведомлений (каждые 2 минуты) 
setInterval(async () => {
    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
        title: 'Напоминание',
        body: 'У вас есть незавершённые задачи (напоминание каждые 2 минуты)',
    });

    try {
        console.log('Отправка напоминаний всем подписанным пользователям...'); 
        await Promise.all(
            subscriptions.map(sub => 
                webpush.sendNotification(sub, payload).catch(err =>
                    console.error('Ошибка при отправке:', err) 
                )
            ) 
        );
    } catch (error) {
        console.error('Ошибка при периодической отправке:', error);
    }
}, 2 * 60 * 1000); // каждые 2 минуты
