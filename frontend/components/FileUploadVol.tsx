'use client';
import React, { useState } from 'react';

export default function FileUploadVol({onLoaded}:{onLoaded:(prices:number[])=>void}){
  const [err,setErr] = useState<string>('');
  function parseCSV(text:string){
    const lines = text.trim().split(/\r?\n/);
    const nums:number[] = [];
    for(const line of lines){
      const v = parseFloat(line.split(',').pop() || '');
      if(!Number.isFinite(v)) { setErr('Formato CSV non valido: assicurati che ci sia una colonna con i prezzi.'); return; }
      nums.push(v);
    }
    onLoaded(nums);
  }
  function onChange(e:React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = () => parseCSV(String(reader.result));
    reader.readAsText(f);
  }
  return (
    <div className="card p-4">
      <div className="label mb-2">Upload CSV con prezzi (una riga per prezzo; va bene anche una colonna separata da virgole)</div>
      <input type="file" accept=".csv" onChange={onChange} />
      {err && <div className="text-red-600 mt-2">{err}</div>}
    </div>
  )
}
