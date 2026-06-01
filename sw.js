const FANCLUB_URL = "https://www.youtube.com/channel/UCdZMz61Y8oS4kfC9CP4esTA/join";
const STYLE_VERSION = "2026060105";

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

function normalizeStylesheetVersion(html) {
  return html.replace(
    /(href="(?:\.\.\/)?style\.css)(?:\?v=[^"#]*)?("|#)/g,
    `$1?v=${STYLE_VERSION}$2`
  );
}

function addFanclubLink(html) {
  if (html.includes("nav-fanclub") || !html.includes('class="nav"')) {
    return html;
  }

  return html.replace(
    /(<a href="(?:\.\.\/)?contact\.html">contact<\/a>|<a href="(?:\.\.\/)?contact\.html">Contact<\/a>)/,
    `$1\n    <a class="nav-fanclub" href="${FANCLUB_URL}" target="_blank" rel="noopener noreferrer">FANCLUB</a>`
  );
}

function transformHtml(html) {
  return normalizeBeTripTitle(
    normalizePreviewTitles(
      normalizeStylesheetVersion(addFanclubLink(html))
    )
  );
}

function normalizePreviewTitles(html) {
  return html.replace(/\s+-\s+Preview/g, " | Preview");
}

function normalizeBeTripTitle(html) {
  return html
    .replace(/<h([123])([^>]*)>BE-TRIP<\/h\1>/g, '<h$1$2>BE<span class="title-separator">-</span>TRIP</h$1>')
    .replace(/BE-TRIP \| Preview/g, 'BE<span class="title-separator">-</span>TRIP <span class="preview-divider">|</span> Preview');
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
          return new Response(transformHtml(html), {
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
