// export default function KpiTile({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="rounded-lg bg-emerald-50 p-4 shadow-sm">
//       <dt className="text-sm font-medium text-emerald-700">{label}</dt>
//       <dd className="mt-1 text-2xl font-bold text-emerald-900">{value}</dd>
//     </div>
//   );
// }

export default function KpiTile({
  label, value, testId
}: { label: string; value: string; testId?: string }) {
  return (
     <div
        data-testid={testId} 
         className="rounded-lg bg-emerald-50 p-4 shadow-sm">
       <dt className="text-sm font-medium text-emerald-700">{label}</dt>
       <dd className="mt-1 text-2xl font-bold text-emerald-900">{value}</dd>
     </div>
  );
}
