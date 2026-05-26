self.addEventListener("install", event => {
  console.log("Service Worker Installed");
  self.skipWaiting(); // ←これ重要
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // ←これも重要
});