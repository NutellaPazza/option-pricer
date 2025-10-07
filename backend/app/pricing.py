import math
from typing import Tuple, Literal, Optional
import numpy as np

def _norm_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))

def _norm_pdf(x: float) -> float:
    return math.exp(-0.5 * x * x) / math.sqrt(2.0 * math.pi)

def _bsm_d1_d2(S: float, K: float, T: float, r: float, sigma: float, q: float = 0.0) -> Tuple[float, float]:
    if T <= 0 or sigma <= 0:
        return float("nan"), float("nan")
    d1 = (math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    return d1, d2

def black_scholes(S: float, K: float, T: float, r: float, sigma: float, q: float = 0.0):
    if T <= 0 or sigma <= 0:
        return max(S - K, 0.0), max(K - S, 0.0)
    d1, d2 = _bsm_d1_d2(S, K, T, r, sigma, q)
    disc_r = math.exp(-r * T)
    disc_q = math.exp(-q * T)
    call = disc_q * S * _norm_cdf(d1) - disc_r * K * _norm_cdf(d2)
    put = disc_r * K * _norm_cdf(-d2) - disc_q * S * _norm_cdf(-d1)
    return float(call), float(put)

def binomial_crr(S: float, K: float, T: float, r: float, sigma: float, q: float = 0.0, steps: int = 200, is_call: bool = True, is_american: bool = False) -> float:
    if steps <= 0: steps = 1
    if T <= 0 or sigma <= 0:
        return max(S - K, 0.0) if is_call else max(K - S, 0.0)
    dt = T / steps
    u = math.exp(sigma * math.sqrt(dt))
    d = 1.0 / u
    a = math.exp((r - q) * dt)
    p = (a - d) / (u - d)
    p = min(1.0, max(0.0, p))
    import numpy as np
    prices = np.array([S * (u ** j) * (d ** (steps - j)) for j in range(steps + 1)], dtype=float)
    values = np.maximum(prices - K, 0.0) if is_call else np.maximum(K - prices, 0.0)
    disc = math.exp(-r * dt)
    for _ in range(steps):
        values = disc * (p * values[1:] + (1.0 - p) * values[:-1])
        if is_american:
            prices = prices[:-1] / d
            exercise = np.maximum(prices - K, 0.0) if is_call else np.maximum(K - prices, 0.0)
            values = np.maximum(values, exercise)
    return float(values[0])

def trinomial_jr(S: float, K: float, T: float, r: float, sigma: float, q: float = 0.0, steps: int = 200, is_call: bool = True, is_american: bool = False) -> float:
    if steps <= 0: steps = 1
    if T <= 0 or sigma <= 0:
        return max(S - K, 0.0) if is_call else max(K - S, 0.0)
    dt = T / steps
    u = math.exp(sigma * math.sqrt(dt))
    d = 1.0 / u
    mu = r - q - 0.5 * sigma * sigma
    pu = 1.0/6.0 + (mu / (2.0 * sigma)) * math.sqrt(dt)
    pd = 1.0/6.0 - (mu / (2.0 * sigma)) * math.sqrt(dt)
    pm = 2.0/3.0
    pu = max(0.0, min(1.0, pu)); pd = max(0.0, min(1.0, pd)); pm = max(0.0, min(1.0, pm))
    s = pu + pm + pd; pu, pm, pd = pu/s, pm/s, pd/s
    import numpy as np
    payoff = (lambda x: max(x - K, 0.0)) if is_call else (lambda x: max(K - x, 0.0))
    values = np.array([payoff(S * (u ** max(k, 0)) * (d ** max(-k, 0))) for k in range(-steps, steps + 1)], dtype=float)
    disc = math.exp(-r * dt)
    for t in range(steps, 0, -1):
        new_vals = []
        for k in range(-(t - 1), (t - 1) + 1):
            idx = k + t
            vu, vm, vd = values[idx + 1], values[idx], values[idx - 1]
            v = disc * (pu * vu + pm * vm + pd * vd)
            if is_american:
                spot_k = S * (u ** max(k, 0)) * (d ** max(-k, 0))
                v = max(v, payoff(spot_k))
            new_vals.append(v)
        import numpy as np
        values = np.array(new_vals, dtype=float)
    return float(values[0])

def monte_carlo_euro(S: float, K: float, T: float, r: float, sigma: float, q: float = 0.0, n_paths: int = 50_000, antithetic: bool = True, is_call: bool = True, seed: Optional[int] = 42) -> float:
    if n_paths <= 0: n_paths = 1
    if T <= 0 or sigma <= 0:
        return max(S - K, 0.0) if is_call else max(K - S, 0.0)
    rng = np.random.default_rng(seed)
    Z = rng.standard_normal(n_paths)
    if antithetic: Z = np.concatenate([Z, -Z])
    drift = (r - q - 0.5 * sigma * sigma) * T
    diff = sigma * math.sqrt(T) * Z
    ST = S * np.exp(drift + diff)
    payoff = np.maximum(ST - K, 0.0) if is_call else np.maximum(K - ST, 0.0)
    return float(math.exp(-r * T) * float(np.mean(payoff)))

def lsmc_american(S: float, K: float, T: float, r: float, sigma: float, q: float = 0.0, n_paths: int = 50_000, n_steps: int = 50, is_call: bool = False, seed: Optional[int] = 7) -> float:
    if n_paths <= 0: n_paths = 1
    if n_steps <= 1: n_steps = 2
    dt = T / n_steps
    rng = np.random.default_rng(seed)
    Z = rng.standard_normal((n_paths, n_steps))
    drift = (r - q - 0.5 * sigma * sigma) * dt
    vol = sigma * math.sqrt(dt)
    S_paths = np.empty((n_paths, n_steps + 1), dtype=float)
    S_paths[:, 0] = S
    for t in range(n_steps):
        S_paths[:, t + 1] = S_paths[:, t] * np.exp(drift + vol * Z[:, t])
    payoff_now = (lambda x: np.maximum(x - K, 0.0)) if is_call else (lambda x: np.maximum(K - x, 0.0))
    payoff = payoff_now(S_paths)
    cf = payoff[:, -1]
    disc = math.exp(-r * dt)
    for t in range(n_steps - 1, 0, -1):
        cf *= disc
        itm = payoff[:, t] > 1e-12
        X = S_paths[itm, t]
        if X.size == 0: continue
        A = np.vstack([np.ones_like(X), X, X * X]).T
        Y = cf[itm]
        beta, *_ = np.linalg.lstsq(A, Y, rcond=None)
        cont = A @ beta
        ex_idx = payoff[itm, t] > cont
        Y_new = Y.copy(); Y_new[ex_idx] = payoff[itm, t][ex_idx]
        cf[itm] = Y_new
    return float(disc * float(np.mean(cf)))

def bsm_greeks(S: float, K: float, T: float, r: float, sigma: float, q: float = 0.0) -> dict:
    if T <= 0 or sigma <= 0:
        return {k: 0.0 for k in ["delta_c","delta_p","gamma","vega","theta_c","theta_p","rho_c","rho_p"]}
    d1, d2 = _bsm_d1_d2(S, K, T, r, sigma, q)
    disc_r = math.exp(-r * T)
    disc_q = math.exp(-q * T)
    pdf = _norm_pdf(d1)
    delta_c = disc_q * _norm_cdf(d1)
    delta_p = delta_c - disc_q
    gamma = disc_q * pdf / (S * sigma * math.sqrt(T))
    vega = S * disc_q * pdf * math.sqrt(T)
    theta_c = -(S * disc_q * pdf * sigma) / (2.0 * math.sqrt(T)) - r * K * disc_r * _norm_cdf(d2) + q * S * disc_q * _norm_cdf(d1)
    theta_p = -(S * disc_q * pdf * sigma) / (2.0 * math.sqrt(T)) + r * K * disc_r * _norm_cdf(-d2) - q * S * disc_q * _norm_cdf(-d1)
    rho_c = K * T * disc_r * _norm_cdf(d2)
    rho_p = -K * T * disc_r * _norm_cdf(-d2)
    return {"delta_c": float(delta_c), "delta_p": float(delta_p), "gamma": float(gamma), "vega": float(vega),
            "theta_c": float(theta_c), "theta_p": float(theta_p), "rho_c": float(rho_c), "rho_p": float(rho_p)}

PriceModel = Literal["Black-Scholes (European)", "Binomial CRR", "Trinomial JR", "Monte Carlo (European)", "LSMC (American)"]

def price_option(model: PriceModel, is_call: bool, S: float, K: float, T: float, r: float, sigma: float, q: float, *, steps: int = 200, is_american: bool = False, n_paths: int = 100_000, n_steps: int = 50, antithetic: bool = True) -> float:
    if model == "Black-Scholes (European)":
        c, p = black_scholes(S, K, T, r, sigma, q); return c if is_call else p
    if model == "Binomial CRR":
        return binomial_crr(S, K, T, r, sigma, q, steps=steps, is_call=is_call, is_american=is_american)
    if model == "Trinomial JR":
        return trinomial_jr(S, K, T, r, sigma, q, steps=steps, is_call=is_call, is_american=is_american)
    if model == "Monte Carlo (European)":
        return monte_carlo_euro(S, K, T, r, sigma, q, n_paths=n_paths, antithetic=antithetic, is_call=is_call)
    return lsmc_american(S, K, T, r, sigma, q, n_paths=n_paths, n_steps=n_steps, is_call=is_call)

def realized_vol(prices: list[float], periods_per_year: int = 252) -> float:
    if len(prices) < 2: return 0.0
    import numpy as np
    arr = np.array(prices, dtype=float)
    rets = np.diff(np.log(arr))
    sigma = np.std(rets, ddof=1) * math.sqrt(periods_per_year)
    return float(sigma)

def implied_vol(price: float, S: float, K: float, T: float, r: float, q: float, is_call: bool, tol: float = 1e-6, max_iter: int = 100) -> float:
    lo, hi = 1e-6, 5.0
    for _ in range(max_iter):
        mid = 0.5 * (lo + hi)
        c, p = black_scholes(S, K, T, r, mid, q)
        val = c if is_call else p
        if abs(val - price) < tol: return mid
        if val > price: hi = mid
        else: lo = mid
    return mid
