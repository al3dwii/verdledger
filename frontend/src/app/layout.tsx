import './globals.css';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100">
        <header className="bg-emerald-700 text-white px-4 py-2">
          <div className="max-w-6xl mx-auto font-bold">VerdLedger</div>
        </header>
        {children}
      </body>
    </html>
  );
}
