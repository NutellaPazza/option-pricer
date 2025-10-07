'use client';
import React, { useState } from 'react';

export type Inputs = {
  S:number; K:number; sigma:number; r:number; q:number;
  model: string; is_call:boolean; steps:number; is_american:boolean; n_paths:number; n_steps:number; antithetic:boolean;
  tenorUnit: 'years'|'months'; T_years: number; T_months: number;
  spot_min:number; spot_max:number; spot_steps:number; vol_min:number; vol_max:number; vol_steps:number;
  purchase_call?:number; purchase_put?:number; position_call?:'Long'|'Short'; position_put?:'Long'|'Short';
};

export default function InputPanel({onSubmit}:{onSubmit:(i:Inputs)=>void}){
  const [x,setx] = useState<Inputs>({
    S:100,K:100, T_years:1, T_months:0, tenorUnit:'years', sigma:0.2,r:0.05,q:0,
    model:'Black-Scholes (European)', is_call:true, steps:400, is_american:false, n_paths:100000, n_steps:50, antithetic:true,
    spot_min:80, spot_max:120, spot_steps:12, vol_min:0.05, vol_max:0.6, vol_steps:12,
    purchase_call: undefined, purchase_put: undefined, position_call:'Long', position_put:'Long'
  });
  function update<T extends keyof Inputs>(k:T,v:any){ setx(prev=>({...prev,[k]: (typeof prev[k]==='number')? (k==='T_months'? Math.round(Number(v)) : Number(v)) : v})); }
  function toggleUnit(){ setx(prev=>({...prev, tenorUnit: prev.tenorUnit==='years'?'months':'years'})); }
  function submit(){ onSubmit(x); }
  const Tdisplay = x.tenorUnit==='years' ? `${x.T_years} y` : `${Math.round(x.T_months)} m`;
  return (
    <div className="card p-4">
      <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
        {([
          ['Current Asset Price','S'],['Strike Price','K'],['Volatility σ','sigma'],['Risk-free r','r'],['Dividend q','q']
        ] as const).map(([label,key])=> (
          <div key={key}>
            <div className="label">{label}</div>
            <input className="input" type="number" step="any" value={(x as any)[key]} onChange={e=>update(key as any,e.target.value)} />
          </div>
        ))}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <div className="label">Time to Maturity ({x.tenorUnit==='years'?'Years':'Months'})</div>
            {x.tenorUnit==='years' ? (
              <input className="input" type="number" step="0.05" value={x.T_years} onChange={e=>update('T_years', e.target.value)} />
            ) : (
              <input className="input" type="number" step="1" value={x.T_months} onChange={e=>update('T_months', e.target.value)} />
            )}
          </div>
          <button className="btn" onClick={toggleUnit}>Switch to {x.tenorUnit==='years'?'Months':'Years'}</button>
        </div>
        <div>
          <div className="label">Model</div>
          <select className="input" value={x.model} onChange={e=>update('model', e.target.value)}>
            <option>Black-Scholes (European)</option>
            <option>Binomial CRR</option>
            <option>Trinomial JR</option>
            <option>Monte Carlo (European)</option>
            <option>LSMC (American)</option>
          </select>
        </div>
        <div>
          <div className="label">American?</div>
          <input type="checkbox" checked={x.is_american} onChange={e=>update('is_american', e.target.checked)} />
        </div>
        <div>
          <div className="label">Tree Steps</div>
          <input className="input" type="number" step="1" value={x.steps} onChange={e=>update('steps', e.target.value)} />
        </div>
        <div>
          <div className="label">MC Paths</div>
          <input className="input" type="number" step="1000" value={x.n_paths} onChange={e=>update('n_paths', e.target.value)} />
        </div>
        <div>
          <div className="label">LSMC Steps</div>
          <input className="input" type="number" step="1" value={x.n_steps} onChange={e=>update('n_steps', e.target.value)} />
        </div>
        <div>
          <div className="label">Antithetic</div>
          <input type="checkbox" checked={x.antithetic} onChange={e=>update('antithetic', e.target.checked)} />
        </div>
        <div className="col-span-2"><hr className="my-2"/></div>
        {([
          ['Min Spot','spot_min'],['Max Spot','spot_max'],['Spot Steps','spot_steps'],['Min Vol','vol_min'],['Max Vol','vol_max'],['Vol Steps','vol_steps']
        ] as const).map(([label,key])=> (
          <div key={key}>
            <div className="label">{label}</div>
            <input className="input" type="number" step="any" value={(x as any)[key]} onChange={e=>update(key as any,e.target.value)} />
          </div>
        ))}
        <div className="col-span-2"><hr className="my-2"/></div>
        {([
          ['Purchase Price — Call','purchase_call'],['Purchase Price — Put','purchase_put']
        ] as const).map(([label,key])=> (
          <div key={key}>
            <div className="label">{label}</div>
            <input className="input" type="number" step="any" value={(x as any)[key] ?? ''} onChange={e=>update(key as any,e.target.value)} placeholder="leave empty for Price heatmap" />
          </div>
        ))}
        <div>
          <div className="label">Position — Call</div>
          <select className="input" value={x.position_call} onChange={e=>update('position_call', e.target.value)}>
            <option>Long</option><option>Short</option>
          </select>
        </div>
        <div>
          <div className="label">Position — Put</div>
          <select className="input" value={x.position_put} onChange={e=>update('position_put', e.target.value)}>
            <option>Long</option><option>Short</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex gap-2 items-center">
        <button className="btn" onClick={submit}>Calculate</button>
        <div className="text-sm text-brand-500">Maturity: {Tdisplay}</div>
      </div>
    </div>
  )
}
