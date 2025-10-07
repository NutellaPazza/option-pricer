'use client';
import { useState } from 'react';
import { api } from '../../lib/api';
import InputPanel from '../../components/InputPanel';
import Heatmap from '../../components/Heatmap';
import GreeksCards from '../../components/GreeksCards';

export default function SimplePage(){
  const [call,setCall] = useState<any[]>([]);
  const [put,setPut]   = useState<any[]>([]);
  const [greeks,setGreeks] = useState<any|null>(null);
  const [loading,setLoading] = useState<boolean>(false);
  const [message,setMessage] = useState<string>('');

  async function onSubmit(i:any){
    setLoading(true);
    setMessage('');
    
    try {
      const T = i.tenorUnit==='years' ? i.T_years : (i.T_months/12);
      const modelPayload = {
        model: 'Black-Scholes (European)', 
        is_call: true, 
        S:i.S, K:i.K, T, r:i.r, sigma:i.sigma, q:i.q,
        tenor_unit: i.tenorUnit, 
        tenor_value: i.tenorUnit==='years'? i.T_years : i.T_months,
        steps: 200, 
        is_american: false, 
        n_paths: 100000, 
        n_steps: 50, 
        antithetic: true
      };
      
      const hmReq = {
        model: modelPayload,
        spot_min: i.spot_min, spot_max:i.spot_max, spot_steps:i.spot_steps,
        vol_min: i.vol_min, vol_max:i.vol_max, vol_steps:i.vol_steps
      };
      
      const hmRes = await api.post('/heatmap', hmReq).then(r=>r.data);
      setCall(hmRes.call); 
      setPut(hmRes.put);
      
      const gRes = await api.post('/greeks', {
        S:i.S,K:i.K,T, r:i.r,sigma:i.sigma,q:i.q, 
        tenor_unit:i.tenorUnit, 
        tenor_value: i.tenorUnit==='years'? i.T_years : i.T_months
      }).then(r=>r.data);
      setGreeks(gRes);
      
      setMessage('✅ Calcolo semplice completato con successo!');
    } catch (error) {
      setMessage('❌ Errore nel calcolo. Verifica i parametri.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Analisi Semplice</h1>
        <p className="text-gray-600">
          Modello Black-Scholes con parametri essenziali. Heatmap rosso→bianco e calcolo delle Greeks.
        </p>
      </div>

      <InputPanel onSubmit={onSubmit} mode="simple" />

      {loading && (
        <div className="card p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Calcolando prezzi e Greeks...</span>
          </div>
        </div>
      )}

      {message && (
        <div className={`card p-4 ${message.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
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
    </main>
  )
}