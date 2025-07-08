'use client';
import { useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

export default function LedgerTable() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/events?org=1&limit=1000').then(r => r.json()).then(setRows);
  }, []);

  return (
    <div className="h-[75vh] border rounded">
      <AutoSizer>
        {({ height, width }) => (
          <List height={height} itemCount={rows.length} itemSize={40} width={width}>
            {({ index, style }) => {
              const r = rows[index];
              return (
                <div style={style} className="flex px-2 text-sm border-b">
                  <div className="w-4/12">{r.sku}</div>
                  <div className="w-2/12">{r.region}</div>
                  <div className="w-2/12">{r.kg.toFixed(1)} kg</div>
                  <div className="w-2/12">{r.kwh.toFixed(0)} kWh</div>
                  <div className="w-2/12">{new Date(r.ts).toLocaleDateString()}</div>
                </div>
              );
            }}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}
