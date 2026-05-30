const FANCLUB_URL = "https://www.youtube.com/channel/UCdZMz61Y8oS4kfC9CP4esTA/join";

self.addEventListener("install", event => {
  console.log("Service Worker Installed");
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

function addFanclubLink(html) {
  if (html.includes(FANCLUB_URL) || !html.includes('class="nav"')) {
    return html;
  }

  return html.replace(
    /(<a href="(?:\.\.\/)?contact\.html">contact<\/a>|<a href="(?:\.\.\/)?contact\.html">Contact<\/a>)/,
    `$1\n    <a class="nav-fanclub" href="${FANCLUB_URL}" target="_blank" rel="noopener noreferrer">FANCLUB</a>`
  );
}

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const acceptsHtml = request.headers.get("accept")?.includes("text/html");

  if (request.mode !== "navigate" && !acceptsHtml) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("text/html")) {
          return response;
        }

        return response.text().then(html => {
          return new Response(addFanclubLink(html), {
            status: response.status,
            statusText: response.statusText,
            headers: {
              "content-type": "text/html; charset=UTF-8",
              "cache-control": "no-store"
            }
          });
        });
      })
      .catch(() => fetch(request))
  );
});
