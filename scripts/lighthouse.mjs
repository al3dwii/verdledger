import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

const url = process.argv[2] || 'http://localhost:3000';

(async () => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const opts = { port: chrome.port, output: 'json', logLevel: 'error' };

  const desktop = await lighthouse(url, { ...opts, formFactor: 'desktop' });
  const dScore = desktop.lhr.categories.performance.score * 100;

  const mobile = await lighthouse(url, { ...opts, formFactor: 'mobile' });
  const mScore = mobile.lhr.categories.performance.score * 100;

  await chrome.kill();

  if (dScore < 90 || mScore < 90) {
    console.error(`Lighthouse scores too low: desktop ${dScore}, mobile ${mScore}`);
    process.exit(1);
  } else {
    console.log(`Lighthouse OK: desktop ${dScore}, mobile ${mScore}`);
  }
})();
