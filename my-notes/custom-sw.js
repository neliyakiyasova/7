// custom-sw.js 
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    
    const title = data.title || 'Напоминание'; 
    const options = {
        body: data.body || 'У вас есть невыполненные задачи!',
        icon: '/icons/icon-192x192.png', // при необходимости укажите актуальный путь к иконке
    };
    event.waitUntil( 
        self.registration.showNotification(title, options)
    ); 
});
    