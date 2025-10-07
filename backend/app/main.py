import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .pricing import price_option, bsm_greeks, realized_vol, implied_vol
from .db import engine, ensure_tables
from .models import (
    PriceRequest, PriceResponse, HeatmapRequest, HeatmapResponse, HeatmapPoint,
    GreeksRequest, GreeksResponse, LogRequest, RealizedVolRequest, RealizedVolResponse,
    ImpliedVolRequest, ImpliedVolResponse,
)

app = FastAPI(title="Option Pricer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    ensure_tables()

@app.get("/health")
def health():
    return {"ok": True}

# Normalizza T in anni a partire dal toggle mesi/anni

def _T_years(T: float, unit: str | None, value: float | None) -> float:
    if unit == 'months' and value is not None:
        return float(value) / 12.0
    if unit == 'years' and value is not None:
        return float(value)
    return float(T)

@app.post("/price", response_model=PriceResponse)
def post_price(req: PriceRequest):
    T = _T_years(req.T, req.tenor_unit, req.tenor_value)
    px = price_option(req.model, req.is_call, req.S, req.K, T, req.r, req.sigma, req.q,
                      steps=req.steps, is_american=req.is_american, n_paths=req.n_paths, n_steps=req.n_steps, antithetic=req.antithetic)
    return {"price": px}

@app.post("/heatmap", response_model=HeatmapResponse)
def post_heatmap(req: HeatmapRequest):
    m = req.model
    T = _T_years(m.T, m.tenor_unit, m.tenor_value)
    spots = [req.spot_min + i*(req.spot_max - req.spot_min)/max(1, req.spot_steps-1) for i in range(req.spot_steps)]
    vols  = [req.vol_min  + i*(req.vol_max  - req.vol_min )/max(1, req.vol_steps -1) for i in range(req.vol_steps)]
    call_rows, put_rows = [], []
    for s in spots:
        for v in vols:
            c = price_option(m.model, True,  s, m.K, T, m.r, v, m.q, steps=m.steps, is_american=m.is_american, n_paths=m.n_paths, n_steps=m.n_steps, antithetic=m.antithetic)
            p = price_option(m.model, False, s, m.K, T, m.r, v, m.q, steps=m.steps, is_american=m.is_american, n_paths=m.n_paths, n_steps=m.n_steps, antithetic=m.antithetic)
            if req.purchase_call is not None:
                c_val = (c - req.purchase_call) * (1 if req.position_call == "Long" else -1)
                c_metric = "PnL"
            else:
                c_val = c; c_metric = "Price"
            if req.purchase_put is not None:
                p_val = (p - req.purchase_put) * (1 if req.position_put == "Long" else -1)
                p_metric = "PnL"
            else:
                p_val = p; p_metric = "Price"
            call_rows.append(HeatmapPoint(Spot=round(s,4), Vol=round(v,4), Value=float(c_val), Metric=c_metric))
            put_rows.append(HeatmapPoint(Spot=round(s,4), Vol=round(v,4), Value=float(p_val), Metric=p_metric))
    return {"call": call_rows, "put": put_rows}

@app.post("/greeks", response_model=GreeksResponse)
def post_greeks(req: GreeksRequest):
    T = _T_years(req.T, req.tenor_unit, req.tenor_value)
    return bsm_greeks(req.S, req.K, T, req.r, req.sigma, req.q)

@app.post("/log")
def post_log(req: LogRequest):
    with engine.begin() as conn:
        # Create the inputs data with current timestamp
        inputs_data = {
            **req.inputs,
            "ts": int(time.time() * 1000)  # Current timestamp in milliseconds
        }
        
        cols = ",".join(inputs_data.keys())
        placeholders = ":" + ",:".join(inputs_data.keys())
        res = conn.execute(text(f"INSERT INTO option_inputs ({cols}) VALUES ({placeholders}) RETURNING id"), inputs_data)
        calc_id = res.scalar_one()
        
        def ins(rows, which):
            if not rows: return
            data = [{
                "calc_id": calc_id,
                "which": which,
                "metric": r.Metric,
                "spot": r.Spot,
                "vol": r.Vol,
                "value": r.Value,
                "dS_pct": r.Spot/req.inputs["S"] - 1.0,
                "dVol_abs": r.Vol - req.inputs["sigma"],
            } for r in rows]
            if data:
                keys = data[0].keys()
                cols = ",".join(keys)
                placeholders = ":"+",:".join(keys)
                conn.execute(text(f"INSERT INTO option_outputs ({cols}) VALUES ({placeholders})"), data)
        
        ins(req.call, "call")
        ins(req.put, "put")
    return {"calc_id": int(calc_id)}

@app.post("/realized-vol", response_model=RealizedVolResponse)
def post_realized_vol(req: RealizedVolRequest):
    return {"realized_vol": realized_vol(req.prices, req.periods_per_year)}

@app.post("/implied-vol", response_model=ImpliedVolResponse)
def post_implied_vol(req: ImpliedVolRequest):
    iv = implied_vol(req.market_price, req.S, req.K, req.T, req.r, req.q, req.is_call)
    return {"implied_vol": iv}
