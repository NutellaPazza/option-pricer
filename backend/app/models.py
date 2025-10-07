from pydantic import BaseModel
from typing import Literal, List, Optional

class PriceRequest(BaseModel):
    model: Literal["Black-Scholes (European)", "Binomial CRR", "Trinomial JR", "Monte Carlo (European)", "LSMC (American)"]
    is_call: bool
    S: float; K: float; T: float; r: float; sigma: float; q: float = 0.0
    tenor_unit: Optional[Literal['years','months']] = None
    tenor_value: Optional[float] = None
    steps: int = 200
    is_american: bool = False
    n_paths: int = 100_000
    n_steps: int = 50
    antithetic: bool = True

class PriceResponse(BaseModel):
    price: float

class HeatmapRequest(BaseModel):
    model: PriceRequest
    spot_min: float; spot_max: float; spot_steps: int
    vol_min: float; vol_max: float; vol_steps: int
    purchase_call: Optional[float] = None
    purchase_put: Optional[float] = None
    position_call: Literal["Long","Short"] = "Long"
    position_put: Literal["Long","Short"] = "Long"

class HeatmapPoint(BaseModel):
    Spot: float; Vol: float; Value: float; Metric: str

class HeatmapResponse(BaseModel):
    call: List[HeatmapPoint]
    put: List[HeatmapPoint]

class GreeksRequest(BaseModel):
    S: float; K: float; T: float; r: float; sigma: float; q: float = 0.0
    tenor_unit: Optional[Literal['years','months']] = None
    tenor_value: Optional[float] = None

class GreeksResponse(BaseModel):
    delta_c: float; delta_p: float; gamma: float; vega: float; theta_c: float; theta_p: float; rho_c: float; rho_p: float

class LogRequest(BaseModel):
    inputs: dict
    call: List[HeatmapPoint]
    put: List[HeatmapPoint]

class RealizedVolRequest(BaseModel):
    prices: List[float]
    periods_per_year: int = 252

class RealizedVolResponse(BaseModel):
    realized_vol: float

class ImpliedVolRequest(BaseModel):
    market_price: float
    is_call: bool
    S: float; K: float; T: float; r: float; q: float = 0.0

class ImpliedVolResponse(BaseModel):
    implied_vol: float
