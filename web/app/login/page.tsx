'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function Login() {
  const supabase = createBrowserClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const signIn = async () => {
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: '/' } });
    setSent(true);
  };

  return sent ? (
    <p>Check your inbox…</p>
  ) : (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-medium mb-4">Log in</h1>
      <input
        className="border p-2 w-full mb-4"
        placeholder="you@example.com"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={signIn} className="w-full bg-emerald-600 text-white p-2 rounded">
        Send magic link
      </button>
    </div>
  );
}
