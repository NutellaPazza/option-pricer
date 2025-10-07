import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///option_pricer.db")
engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)

def ensure_tables():
    with engine.begin() as conn:
        conn.execute(text(
            """
            CREATE TABLE IF NOT EXISTS option_inputs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts BIGINT NOT NULL,
                model TEXT NOT NULL,
                S DOUBLE PRECISION NOT NULL,
                K DOUBLE PRECISION NOT NULL,
                T DOUBLE PRECISION NOT NULL,
                tenor_unit TEXT,
                tenor_value DOUBLE PRECISION,
                r DOUBLE PRECISION NOT NULL,
                sigma DOUBLE PRECISION NOT NULL,
                q DOUBLE PRECISION NOT NULL,
                vol_min DOUBLE PRECISION NOT NULL,
                vol_max DOUBLE PRECISION NOT NULL,
                vol_steps INTEGER NOT NULL,
                spot_min DOUBLE PRECISION NOT NULL,
                spot_max DOUBLE PRECISION NOT NULL,
                spot_steps INTEGER NOT NULL,
                purchase_call DOUBLE PRECISION,
                purchase_put DOUBLE PRECISION,
                position_call TEXT,
                position_put TEXT,
                is_american INTEGER,
                steps INTEGER,
                n_paths INTEGER,
                n_steps INTEGER,
                antithetic INTEGER
            )
            """
        ))
        conn.execute(text(
            """
            CREATE TABLE IF NOT EXISTS option_outputs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                calc_id INTEGER NOT NULL REFERENCES option_inputs(id),
                which TEXT NOT NULL,
                metric TEXT NOT NULL,
                spot DOUBLE PRECISION NOT NULL,
                vol DOUBLE PRECISION NOT NULL,
                value DOUBLE PRECISION NOT NULL,
                dS_pct DOUBLE PRECISION NOT NULL,
                dVol_abs DOUBLE PRECISION NOT NULL
            )
            """
        ))
