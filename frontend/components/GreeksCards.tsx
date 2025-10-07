'use client';
export default function GreeksCards({g}:{g:any}){
  const items = [
    ['Delta (Call)', g.delta_c], ['Delta (Put)', g.delta_p], ['Gamma', g.gamma], ['Vega', g.vega], ['Theta (Call)', g.theta_c], ['Theta (Put)', g.theta_p], ['Rho (Call)', g.rho_c], ['Rho (Put)', g.rho_p]
  ];
  return (
    <div className="grid md:grid-cols-4 grid-cols-2 gap-3">
      {items.map(([k,v])=> (
        <div key={k as string} className="card p-4"><div className="label">{k as string}</div><div className="text-2xl font-semibold">{(v as number).toFixed(6)}</div></div>
      ))}
    </div>
  )
}
