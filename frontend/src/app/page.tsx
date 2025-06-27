import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/org/1/dashboard');
}
