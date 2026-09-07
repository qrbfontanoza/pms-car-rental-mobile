const target = await fetch('http://127.0.0.1:9224/json').then((response) => response.json());
if (!target[0]?.webSocketDebuggerUrl) throw new Error('No debuggable WebView target found.');
const socket = new WebSocket(target[0].webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let id = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data.toString());
  if (!message.id || !pending.has(message.id)) return;
  const callbacks = pending.get(message.id);
  pending.delete(message.id);
  callbacks.resolve(message.result);
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    id += 1;
    pending.set(id, { resolve });
    socket.send(JSON.stringify({ id, method, params }));
  });
const result = await send('Runtime.evaluate', {
  expression: `JSON.stringify({
    url: location.href,
    readyState: document.readyState,
    title: document.title,
    bodyText: (document.body?.innerText || '').slice(0, 1200),
    bodyHtml: (document.body?.innerHTML || '').slice(0, 1600),
    scripts: [...document.scripts].map(script => script.src),
    styles: [...document.styleSheets].map(sheet => sheet.href),
  })`,
  returnByValue: true,
});
console.log(result.result.value);
socket.close();
