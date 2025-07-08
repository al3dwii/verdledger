'use client';
export default function Billing() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">VerdLedger Pro (beta)</h1>
      <p className="mb-6">Unlimited orgs • Audit exports • Priority support</p>
      <form action="/api/stripe/checkout" method="post">
        <input type="hidden" name="org_id" value="1" />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded">
          Subscribe – $19 / month
        </button>
      </form>
    </div>
  );
}
