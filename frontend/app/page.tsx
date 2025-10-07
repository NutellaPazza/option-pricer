'use client';
import { useState } from 'react';
import { api } from '../lib/api';
import InputPanel, { Inputs } from '../components/InputPanel';
import Heatmap from '../components/Heatmap';
import GreeksCards from '../components/GreeksCards';
import ModelComparison from '../components/ModelComparison';
import FileUploadVol from '../components/FileUploadVol';

export default function Page(){
  const [call,setCall] = useState<any[]>([]);
  const [put,setPut]   = useState<any[]>([]);
  const [greeks,setGreeks] = useState<any|null>(null);
  const [table,setTable] = useState<any[]>([]);
  const [message,setMessage] = useState<string>('');

  async function onSubmit(i:Inputs){
    setMessage('');
    const T = i.tenorUnit==='years' ? i.T_years : (i.T_months/12);
    const modelPayload = {
      model: i.model, is_call: true, S:i.S, K:i.K, T, r:i.r, sigma:i.sigma, q:i.q,
      tenor_unit: i.tenorUnit, tenor_value: i.tenorUnit==='years'? i.T_years : i.T_months,
      steps:i.steps, is_american:i.is_american, n_paths:i.n_paths, n_steps:i.n_steps, antithetic:i.antithetic
    };
    const hmReq = {
      model: modelPayload,
      spot_min: i.spot_min, spot_max:i.spot_max, spot_steps:i.spot_steps,
      vol_min: i.vol_min, vol_max:i.vol_max, vol_steps:i.vol_steps,
      purchase_call: i.purchase_call || undefined,
      purchase_put: i.purchase_put || undefined,
      position_call: i.position_call || 'Long',
      position_put: i.position_put || 'Long'
    };
    const hmRes = await api.post('/heatmap', hmReq).then(r=>r.data);
    setCall(hmRes.call); setPut(hmRes.put);
    const gRes = await api.post('/greeks', {S:i.S,K:i.K,T, r:i.r,sigma:i.sigma,q:i.q, tenor_unit:i.tenorUnit, tenor_value: i.tenorUnit==='years'? i.T_years : i.T_months}).then(r=>r.data);
    setGreeks(gRes);
    const models = [ 'Black-Scholes (European)','Binomial CRR','Trinomial JR','Monte Carlo (European)','LSMC (American)' ];
    const rows = [] as any[];
    for(const m of models){
      const c = await api.post('/price', {...modelPayload, model:m, is_call:true}).then(r=>r.data.price);
      const p = await api.post('/price', {...modelPayload, model:m, is_call:false}).then(r=>r.data.price);
      rows.push({Model:m, Call:c, Put:p});
    }
    setTable(rows);
    setMessage('Calcolo completato.');
  }

  async function onUploadPrices(prices:number[]){
    const rv = await api.post('/realized-vol', {prices, periods_per_year:252}).then(r=>r.data.realized_vol);
    setMessage(`σ realizzata: ${rv.toFixed(4)}.`);
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Options Price — Interactive Heatmap</h1>
        <div className="text-sm text-brand-500">bianco/grigio/nero · heatmap rosso→bianco</div>
      </header>

      <InputPanel onSubmit={onSubmit} />

      {message && <div className="card p-4">{message}</div>}

      <section className="grid md:grid-cols-2 gap-4">
        <Heatmap data={call} title="Call Heatmap" />
        <Heatmap data={put}  title="Put Heatmap" />
      </section>

      {greeks && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Greeks — Black–Scholes</h2>
          <GreeksCards g={greeks} />
        </section>
      )}

      {table.length>0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Models+</h2>
          <ModelComparison rows={table} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Upload storici → σ realizzata</h2>
        <FileUploadVol onLoaded={onUploadPrices} />
      </section>
    </main>
  )
}
