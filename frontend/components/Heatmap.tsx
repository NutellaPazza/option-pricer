'use client';
import React from 'react';
import ReactECharts from 'echarts-for-react';

type Item = { Spot:number; Vol:number; Value:number; Metric?:string };
export default function Heatmap({data,title}:{data:Item[]; title:string}){
  // Se non ci sono dati, mostra un placeholder
  if (!data || data.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-96 flex items-center justify-center text-gray-500">
          Inserisci i parametri e clicca "Calcola" per visualizzare la heatmap
        </div>
      </div>
    );
  }

  const spots = Array.from(new Set(data.map(d=>d.Spot))).sort((a,b)=>a-b);
  const vols  = Array.from(new Set(data.map(d=>d.Vol))).sort((a,b)=>a-b);
  
  // Calcola min/max in modo sicuro
  const values = data.map(d => d.Value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  const option = {
    backgroundColor: '#ffffff',
    title: { text: title, left: 'center', textStyle: { color: '#111', fontWeight: 700 } },
    tooltip: { position: 'top' },
    grid: { height: '70%', top: 60 },
    xAxis: { type: 'category', data: spots, axisLine:{lineStyle:{color:'#333'}}, name: 'Spot', nameTextStyle:{color:'#333'} },
    yAxis: { type: 'category', data: vols,  axisLine:{lineStyle:{color:'#333'}}, name: 'Vol',  nameTextStyle:{color:'#333'} },
    visualMap: {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: 'vertical', right: 10, top: 'middle',
      inRange: { color: ['#7f1d1d','#b91c1c','#ef4444','#fee2e2','#ffffff'] }
    },
    series: [{
      name: title,
      type: 'heatmap',
      data: data.map(d=>[spots.indexOf(d.Spot), vols.indexOf(d.Vol), d.Value]),
      label: { show: true, color: '#0a0a0a', formatter: (p:any)=>p.value[2].toFixed(2) },
      emphasis: { itemStyle: { shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.2)' } }
    }]
  };
  return <div className="card p-4"><ReactECharts option={option} style={{height: 520}} /></div>
}
