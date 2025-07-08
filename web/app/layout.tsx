import './globals.css';
import { createClient } from '@/utils/supabase-client';

export const metadata = { title: 'VerdLedger' };

export default async function RootLayout({ children }: {children: React.ReactNode}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <nav className="px-6 h-14 flex items-center border-b">
          <span className="font-bold text-xl text-emerald-600">VerdLedger</span>
          <div className="ml-auto">
            {data.session ? (
              <form action="/auth/signout" method="post">
                <button className="text-sm">Sign out</button>
              </form>
            ) : (
              <a href="/login" className="text-sm">Log in</a>
            )}
          </div>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
