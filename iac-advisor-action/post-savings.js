#!/usr/bin/env node

// Post accepted VerdLedger suggestions to the API ledger
// Usage: node post-savings.js '<suggestions-json>' [api-url] <api-key>

const [suggJson, api = 'https://api.verdledger.dev', key] = process.argv.slice(2);

if (!suggJson || !key) {
  console.error('Usage: node post-savings.js "<suggestions-json>" [api-url] <api-key>');
  process.exit(1);
}

let suggestions;
try {
  suggestions = JSON.parse(suggJson);
} catch (err) {
  console.error('Invalid suggestions JSON');
  process.exit(1);
}

const events = suggestions.map(s => ({
  cloud: s.provider,
  region: s.region,
  sku: s.altSku,
  kwh: +(s.deltaKg / 0.7).toFixed(3),
  usd: +s.deltaUsd.toFixed(2),
  kg: +s.deltaKg.toFixed(2)
}));

(async () => {
  const res = await fetch(`${api}/v1/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(events)
  });

  if (!res.ok) {
    console.error('Error:', await res.text());
    process.exit(1);
  }

  console.log(`Inserted ${events.length} event${events.length === 1 ? '' : 's'}`);
})();
