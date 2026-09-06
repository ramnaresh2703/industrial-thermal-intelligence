"""
FastAPI Backend Server for Industrial Thermal Intelligence (SIH26162 - NTRO)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env or root .env
load_dotenv()
load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent.parent / ".env")

from ml_engine import ml_engine
from firms_service import firms_service
from sms_service import sms_service

app = FastAPI(
    title="NTRO Industrial Thermal Intelligence API",
    description="AI-Powered Geospatial Classification and Risk Prioritization of Satellite Thermal Hotspots (SIH26162)",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
class HotspotPredictRequest(BaseModel):
    frp: float = Field(..., description="Fire Radiative Power in MW", example=342.8)
    brightness_temp: Optional[float] = Field(370.0, description="Pixel brightness temp in Kelvin", example=388.4)
    distance_to_industry: float = Field(..., description="Distance in meters to nearest registered industrial unit", example=180.0)
    historical_persistence: int = Field(..., description="Detections in last 30 days (0-30)", example=2)
    land_cover: str = Field("industrial", description="Land cover: industrial | forest | cropland | power_plant", example="industrial")
    wind_speed: Optional[float] = Field(15.0, description="Surface wind velocity in km/h", example=18.0)
    latitude: Optional[float] = Field(11.1085, description="Latitude", example=11.1085)
    longitude: Optional[float] = Field(77.3411, description="Longitude", example=77.3411)

class DispatchRequest(BaseModel):
    hotspot_id: str
    agency: str = "DDMA & Fire Services"
    priority: str = "CRITICAL"
    notes: Optional[str] = "Immediate containment requested"

class SmsAlertRequest(BaseModel):
    phone_number: str = Field(..., description="Mobile number with country code", example="+919876543210")
    agency: str = Field("District Disaster Management Authority (DDMA)", example="DDMA & State Fire Command")
    hotspot: Dict[str, Any] = Field(..., description="Hotspot telemetry object")
    api_key: Optional[str] = Field(None, description="Optional Fast2SMS or gateway API key")

@app.get("/api")
@app.get("/api/health")
def read_root():
    return {
        "status": "ONLINE",
        "system": "NTRO Industrial Thermal Intelligence Command API",
        "problem_statement": "SIH26162",
        "satellites_connected": ["VIIRS NOAA-20", "MODIS Aqua", "INSAT-3DR"],
        "model": "XGBoost v2.1 + TreeSHAP Local Explainer"
    }

@app.post("/api/predict")
def predict_hotspot(req: HotspotPredictRequest):
    """
    Classifies a thermal anomaly and returns risk score, confidence, and SHAP attribution.
    """
    result = ml_engine.predict_and_explain(req.model_dump())
    return {
        "success": True,
        "input": req.model_dump(),
        "prediction": result
    }

@app.post("/api/explain")
def explain_hotspot(req: HotspotPredictRequest):
    """
    Computes local TreeSHAP feature importances for mathematical attribution.
    """
    result = ml_engine.predict_and_explain(req.model_dump())
    return {
        "success": True,
        "shap_values": result["shap_values"],
        "ai_reasoning": result["ai_reasoning"],
        "risk_score": result["risk_score"],
        "category": result["category"]
    }

@app.get("/api/firms/sync")
def sync_firms_data(sector: str = "IND", days: int = 3):
    """
    Downlinks near real-time thermal anomalies from NASA FIRMS API.
    """
    data = firms_service.fetch_satellite_data(sector, days)
    return {
        "source": "NASA FIRMS NRT (VIIRS/MODIS)",
        "sector": sector,
        "count": len(data),
        "anomalies": data
    }

@app.post("/api/alerts/sms")
def send_sms_alert(req: SmsAlertRequest):
    """
    Sends an immediate tactical SMS alert to a mobile number.
    """
    print(f"[SMS ALERT REQUEST] Recipient: {req.phone_number}, Agency: {req.agency}, API Key Provided: {bool(req.api_key)}")
    result = sms_service.send_sms(req.phone_number, req.hotspot, req.agency, custom_api_key=req.api_key)
    print(f"[SMS ALERT RESULT] Gateway: {result.get('provider')}, Status: {result.get('status')}")
    return {
        "success": True,
        "receipt": result
    }

@app.post("/api/dispatch")
def simulate_dispatch(req: DispatchRequest):
    """
    Simulates automated multi-agency alert dispatch to SDRF, DDMA, and Fire Brigade.
    """
    return {
        "success": True,
        "dispatch_id": f"DISP-NTRO-{req.hotspot_id[-4:]}",
        "agency": req.agency,
        "priority": req.priority,
        "status": "TRANSMITTED",
        "channel": "NTRO Emergency Defense Mesh",
        "message": f"High-priority containment order broadcast for {req.hotspot_id}"
    }

@app.get("/api/stats")
def get_stats():
    return {
        "active_satellites": 4,
        "active_hotspots": 28,
        "critical_alerts": 7,
        "classification_accuracy": 99.1,
        "triage_latency": "< 90s",
        "area_scanned_km2": "14,842,500"
    }

# ==================== SERVE PRODUCTION FRONTEND ====================
import os
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_react_app(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
