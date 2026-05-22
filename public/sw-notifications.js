self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = typeof data.url === 'string' && data.url.length > 0
    ? data.url
    : '/app/pick-up-news/';

  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const target = clients.find((client) => client.url.startsWith(self.location.origin));

    if (target) {
      await target.focus();
      if ('navigate' in target) {
        await target.navigate(targetUrl);
      }
      return;
    }

    await self.clients.openWindow(targetUrl);
  })());
});
