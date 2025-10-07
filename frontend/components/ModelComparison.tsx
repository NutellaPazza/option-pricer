'use client';
export default function ModelComparison({rows}:{rows:{Model:string;Call:number;Put:number}[]}){
  return (
    <div className="card p-4 overflow-auto">
      <table className="w-full text-left">
        <thead><tr><th>Model</th><th>Call</th><th>Put</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.Model} className="border-t border-brand-300"><td>{r.Model}</td><td>{r.Call.toFixed(4)}</td><td>{r.Put.toFixed(4)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
