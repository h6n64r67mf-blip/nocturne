self.addEventListener('push', function(event) {
  let data = {}
  try{ data = event.data.json() }catch(e){ data = { title: 'Nocturne', body: 'New notification' } }
  const title = data.title || 'Nocturne'
  const options = { body: data.body || '', icon: data.icon || '/favicon.ico', data: data }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.matchAll({ type: 'window' }).then( windowClients => {
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i]
      if (client.url === url && 'focus' in client) return client.focus()
    }
    if (clients.openWindow) return clients.openWindow(url)
  }))
})
