// 오프라인 지원: 한 번 열어 두면 인터넷이 끊겨도 일정이 열린다.
// 페이지(index.html)는 '네트워크 먼저' — 연결되면 항상 최신, 끊기면(또는 4초 넘게 느리면) 저장본.
// 아이콘·CSV 같은 파일과 글꼴은 '저장본 먼저'.
// 아이콘·CSV를 바꾸면 CACHE 이름의 숫자를 올린다.
const CACHE = 'honeymoon-v2';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './data/honeymoon_places.csv',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function pageFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = () => cache.match(req, { ignoreSearch: true }).then((r) => r || cache.match('./index.html'));
  const net = fetch(req).then((res) => {
    if (res.ok) cache.put('./index.html', res.clone());
    return res;
  });
  net.catch(() => {});  // 저장본이 먼저 나간 뒤 네트워크가 실패해도 조용히
  const slow = new Promise((resolve) => setTimeout(resolve, 4000)).then(cached);
  try {
    const res = await Promise.race([net, slow]);
    return res || (await net);
  } catch (err) {
    const r = await cached();
    if (r) return r;
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, { ignoreSearch: true });
  const update = fetch(req).then((res) => {
    if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
    return res;
  }).catch(() => hit);
  return hit || update;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') { e.respondWith(pageFirst(req)); return; }
  if (url.origin === self.location.origin || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cacheFirst(req));
  }
  // 구글맵 등 외부 링크는 그대로 둔다
});
