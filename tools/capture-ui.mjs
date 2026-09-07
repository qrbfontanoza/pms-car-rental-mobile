import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const root = process.cwd();
const output = path.join(root, '.artifacts', 'ui-audit', 'after');
const profile = path.join(root, '.artifacts', 'ui-audit', 'chrome-profile');
const port = 9333;
await mkdir(output, { recursive: true });
await mkdir(profile, { recursive: true });

const processHandle = spawn(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank',
]);

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
let version;
for (let attempt = 0; attempt < 40; attempt += 1) {
  try {
    version = await fetch(`http://127.0.0.1:${port}/json/version`).then((response) => response.json());
    break;
  } catch {
    await pause(100);
  }
}
if (!version) throw new Error('Chrome DevTools did not start.');

const target = await fetch(
  `http://127.0.0.1:${port}/json/new?${encodeURIComponent('http://127.0.0.1:4200/tabs/home')}`,
  { method: 'PUT' },
).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 1;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data.toString());
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

await send('Page.enable');
await send('Runtime.enable');

const mockUser = {
  id: 'u-demo',
  fullName: 'Maria Santos With A Deliberately Long Customer Name',
  email: 'maria.santos.long.address@pmsrentals.example.ph',
  profileImage: 'assets/avatar.png',
  licenseStatus: 'verified',
};

async function configure(theme) {
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('pms.theme', JSON.stringify('${theme}')); localStorage.setItem('pms.mock.session', JSON.stringify(${JSON.stringify(mockUser)}));`,
  });
}

async function capture(name, route, width, height, theme = 'light') {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: width,
    screenHeight: height,
  });
  await send('Page.navigate', { url: `http://127.0.0.1:4200${route}` });
  await pause(900);
  await configure(theme);
  await send('Page.reload', { ignoreCache: false });
  await pause(900);
  const metrics = await send('Runtime.evaluate', {
    expression: `JSON.stringify({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth })`,
    returnByValue: true,
  });
  const dimensions = JSON.parse(metrics.result.value);
  if (dimensions.width !== width || dimensions.scrollWidth > width) {
    throw new Error(`${name} overflow: ${JSON.stringify(dimensions)}`);
  }
  const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(path.join(output, `${name}.png`), Buffer.from(screenshot.data, 'base64'));
}

try {
  const quick = process.argv.includes('--quick');
  if (!quick) {
    for (const width of [320, 360, 375, 390, 430, 768]) {
      const height = width === 768 ? 1024 : 900;
      await capture(`home-${width}-light`, '/tabs/home', width, height);
      await capture(`vehicles-${width}-light`, '/tabs/vehicles', width, height);
    }
  }
  const routes = [
    ['home', '/tabs/home'],
    ['vehicles', '/tabs/vehicles'],
    ['vehicle-details', '/vehicles/1'],
    ['login', '/auth/login'],
    ['register', '/auth/register'],
    ['forgot-password', '/auth/forgot'],
    ['faq', '/more/faq'],
    ['about', '/more/about'],
    ['privacy', '/more/privacy'],
    ['support', '/more/support'],
    ['onboarding', '/onboarding'],
    ['profile', '/tabs/profile'],
    ['bookings', '/tabs/bookings'],
    ['booking-details', '/booking/b1'],
    ['edit-profile', '/profile/edit'],
    ['receipt', '/receipt/b1'],
    ['reservation', '/reserve/1'],
  ];
  if (quick) {
    await capture('vehicles-390-dark', '/tabs/vehicles', 390, 900, 'dark');
  } else {
    for (const [name, route] of routes) await capture(`${name}-390-light`, route, 390, 900);
    for (const [name, route] of routes) await capture(`${name}-390-dark`, route, 390, 900, 'dark');
  }
} finally {
  socket.close();
  processHandle.kill();
}

console.log(`Captured UI evidence in ${output}`);
