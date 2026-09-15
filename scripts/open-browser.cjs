const http = require('http');
const { exec } = require('child_process');

const port = process.env.FRONTEND_PORT || 4500;
const url = `http://localhost:${port}`;

let attempts = 0;
const checkInterval = setInterval(() => {
  attempts++;
  const req = http.get(url, (res) => {
    clearInterval(checkInterval);
    console.log(`\n========================================================================`);
    console.log(`[*] May chu da san sang! Dang mo trinh duyet: ${url}`);
    console.log(`========================================================================\n`);

    // Open default browser on Windows
    exec(`start "" "${url}"`);
    setTimeout(() => process.exit(0), 1000);
  });

  req.on('error', () => {
    if (attempts >= 120) {
      clearInterval(checkInterval);
      console.log(`\n[!] Qua thoi gian cho (60s). Vui long truy cap thu cong tai: ${url}\n`);
      process.exit(1);
    }
  });

  req.setTimeout(800, () => req.destroy());
}, 600);
