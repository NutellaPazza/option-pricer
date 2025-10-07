'use client';
import { useState } from 'react';
import { api } from '../../lib/api';
import InputPanel from '../../components/InputPanel';
import Heatmap from '../../components/Heatmap';
import GreeksCards from '../../components/GreeksCards';
import ModelComparison from '../../components/ModelComparison';
import FileUploadVol from '../../components/FileUploadVol';

export default function AdvancedPage(){
  const [call,setCall] = useState<any[]>([]);
  const [put,setPut]   = useState<any[]>([]);
  const [greeks,setGreeks] = useState<any|null>(null);
  const [table,setTable] = useState<any[]>([]);
  const [loading,setLoading] = useState<boolean>(false);
  const [message,setMessage] = useState<string>('');

  async function onSubmit(i:any){
    setLoading(true);
    setMessage('');
    
    try {
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
      const rows:any[] = [];
      for(const m of models){
        const c = await api.post('/price', {...modelPayload, model:m, is_call:true}).then(r=>r.data.price);
        const p = await api.post('/price', {...modelPayload, model:m, is_call:false}).then(r=>r.data.price);
        rows.push({Model:m, Call:c, Put:p});
      }
      setTable(rows);

      setMessage('✅ Calcolo avanzato completato con successo!');
    } catch (error) {
      setMessage('❌ Errore nel calcolo. Verifica i parametri.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function onUploadPrices(prices:number[]){
    try {
      const rv = await api.post('/realized-vol', {prices, periods_per_year:252}).then(r=>r.data.realized_vol);
      setMessage(`📊 Volatilità realizzata calcolata: ${(rv*100).toFixed(2)}%`);
    } catch (error) {
      setMessage('❌ Errore nel calcolo della volatilità realizzata.');
    }
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Analisi Avanzata</h1>
        <p className="text-gray-600">
          Tutti i modelli di pricing, analisi P&L, confronto modelli e upload dati storici.
        </p>
      </div>

      <InputPanel onSubmit={onSubmit} mode="advanced" />

      {loading && (
        <div className="card p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Calcolando con tutti i modelli...</span>
          </div>
        </div>
      )}

      {message && (
        <div className={`card p-4 ${message.includes('✅') || message.includes('📊') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message}
        </div>
      )}

      <section className="grid md:grid-cols-2 gap-6">
        <Heatmap data={call} title="Call Heatmap" />
        <Heatmap data={put}  title="Put Heatmap" />
      </section>

      {greeks && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Greeks — Black-Scholes</h2>
          <GreeksCards g={greeks} />
        </section>
      )}

      {table.length>0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Confronto Modelli</h2>
          <ModelComparison rows={table} />
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Upload Dati Storici → σ Realizzata</h2>
        <FileUploadVol onLoaded={onUploadPrices} />
      </section>
    </main>
  )
}