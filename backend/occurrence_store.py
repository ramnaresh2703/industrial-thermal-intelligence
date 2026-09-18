"""
Spatial Dimension Occurrence Store for NTRO Industrial Thermal Intelligence
Persists coordinate dimensions and tracks recurrence history ONLY when active fire is verified.
"""

import os
import json
import time
import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
OCCURRENCE_FILE = DATA_DIR / "fire_occurrences.json"

class SpatialDimensionStore:
    def __init__(self):
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.occurrences: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _get_dimension_id(self, lat: float, lng: float, precision: int = 2) -> str:
        """
        Clusters coordinates into spatial dimension cells (~1.1 km grid at precision=2).
        e.g., (11.1085, 77.3411) -> 'DIM-11.11N-77.34E'
        """
        lat_grid = round(lat, precision)
        lng_grid = round(lng, precision)
        lat_dir = "N" if lat_grid >= 0 else "S"
        lng_dir = "E" if lng_grid >= 0 else "W"
        return f"DIM-{abs(lat_grid):.2f}{lat_dir}-{abs(lng_grid):.2f}{lng_dir}"

    def _load(self):
        """Loads persisted dimensional records from JSON file."""
        if OCCURRENCE_FILE.exists():
            try:
                with open(OCCURRENCE_FILE, "r", encoding="utf-8") as f:
                    self.occurrences = json.load(f)
            except Exception as e:
                print(f"[OccurrenceStore] Error loading occurrences: {e}")
                self.occurrences = {}
        else:
            self._seed_initial_dimensions()

    def _save(self):
        """Saves dimensional records to JSON file."""
        try:
            with open(OCCURRENCE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.occurrences, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[OccurrenceStore] Error saving occurrences: {e}")

    def _seed_initial_dimensions(self):
        """Pre-populates baseline dimensional historical records for strategic nodes."""
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        
        seeds = [
            {
                "lat": 11.1085, "lng": 77.3411, "name": "Tiruppur SIDCO Boiler Complex",
                "district": "Tiruppur", "state": "Tamil Nadu", "category": "Industrial Fire",
                "frp": 342.8, "risk_level": "CRITICAL", "risk_score": 94, "initial_count": 3
            },
            {
                "lat": 13.2045, "lng": 80.3287, "name": "Ennore CPCL Flare Stack",
                "district": "Chennai", "state": "Tamil Nadu", "category": "Refinery Flare",
                "frp": 182.4, "risk_level": "MODERATE", "risk_score": 42, "initial_count": 28
            },
            {
                "lat": 28.5355, "lng": 77.2715, "name": "Okhla Phase-III Cable Riser & Server Fire",
                "district": "South East Delhi", "state": "Delhi NCR", "category": "Enclosed Electrical & Smoke Anomaly",
                "frp": 88.4, "risk_level": "CRITICAL", "risk_score": 92, "initial_count": 2
            },
            {
                "lat": 13.0982, "lng": 80.1624, "name": "Ambattur SIDCO Substation 230kV Switchgear",
                "district": "Chennai", "state": "Tamil Nadu", "category": "Enclosed Electrical & Smoke Anomaly",
                "frp": 112.6, "risk_level": "CRITICAL", "risk_score": 95, "initial_count": 1
            },
            {
                "lat": 11.7480, "lng": 79.7714, "name": "Cuddalore SIPCOT Chemical Storage Zone",
                "district": "Cuddalore", "state": "Tamil Nadu", "category": "Chemical Hazard",
                "frp": 418.7, "risk_level": "CRITICAL", "risk_score": 98, "initial_count": 4
            },
            {
                "lat": 16.3533, "lng": 77.3486, "name": "Raichur Thermal Power Station (RTPS)",
                "district": "Raichur", "state": "Karnataka", "category": "Thermal Power Plant",
                "frp": 530.0, "risk_level": "HIGH", "risk_score": 75, "initial_count": 22
            },
            {
                "lat": 30.2345, "lng": 75.8234, "name": "Sangrur Stubble Burning Cluster",
                "district": "Sangrur", "state": "Punjab", "category": "Agricultural Burning",
                "frp": 165.2, "risk_level": "HIGH", "risk_score": 81, "initial_count": 6
            }
        ]

        for s in seeds:
            dim_id = self._get_dimension_id(s["lat"], s["lng"])
            self.occurrences[dim_id] = {
                "dimension_id": dim_id,
                "latitude": s["lat"],
                "longitude": s["lng"],
                "grid_boundary": f"{s['lat']-0.005:.4f}°N to {s['lat']+0.005:.4f}°N, {s['lng']-0.005:.4f}°E to {s['lng']+0.005:.4f}°E",
                "target_name": s["name"],
                "district": s["district"],
                "state": s["state"],
                "category": s["category"],
                "risk_level": s["risk_level"],
                "risk_score": s["risk_score"],
                "verified_active_fire": True,
                "first_observed_utc": "2026-09-01 00:00 UTC",
                "last_observed_utc": now_iso,
                "total_occurrences": s["initial_count"],
                "peak_frp_mw": s["frp"],
                "latest_frp_mw": s["frp"],
                "cumulative_energy_mw": round(s["frp"] * s["initial_count"], 1),
                "satellite_sensors": ["VIIRS NOAA-20", "MODIS Aqua"],
                "detection_history": [
                    {"time": now_iso, "frp": s["frp"], "status": "VERIFIED_FIRE"}
                ]
            }
        self._save()

    def record_occurrence(self, hotspot: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifies if an active thermal anomaly exists on the dimension.
        Only stores/increments occurrence if fire/thermal radiance meets active threshold (FRP >= 10 MW).
        """
        lat = float(hotspot.get("lat", hotspot.get("latitude", 0)))
        lng = float(hotspot.get("lng", hotspot.get("longitude", 0)))
        frp = float(hotspot.get("frp", 0))
        confidence = float(hotspot.get("confidence", 80))
        
        # ACTIVE FIRE VERIFICATION RULE:
        # Must have FRP >= 10 MW or nominal/high confidence to be classified as verified active fire.
        is_verified_fire = frp >= 10.0 and confidence >= 50.0

        if not is_verified_fire:
            return {
                "recorded": False,
                "reason": "Fire radiative power below verified thermal threshold (FRP < 10 MW)",
                "verified_active_fire": False
            }

        dim_id = self._get_dimension_id(lat, lng)
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        name = hotspot.get("name", f"Anomaly Grid {dim_id}")
        district = hotspot.get("district", "Strategic Sector")
        state = hotspot.get("state", "National Territory")
        category = hotspot.get("category", "Industrial Fire")
        risk_level = hotspot.get("riskLevel", hotspot.get("risk_level", "HIGH"))
        risk_score = int(hotspot.get("riskScore", hotspot.get("risk_score", 70)))
        satellite = hotspot.get("satellite", "VIIRS NOAA-20")

        if dim_id in self.occurrences:
            record = self.occurrences[dim_id]
            record["total_occurrences"] += 1
            record["last_observed_utc"] = now_iso
            record["latest_frp_mw"] = frp
            record["peak_frp_mw"] = max(record["peak_frp_mw"], frp)
            record["cumulative_energy_mw"] = round(record["cumulative_energy_mw"] + frp, 1)
            record["verified_active_fire"] = True
            record["risk_score"] = max(record["risk_score"], risk_score)
            record["risk_level"] = risk_level
            if satellite not in record["satellite_sensors"]:
                record["satellite_sensors"].append(satellite)
            
            # Keep latest 10 passes in history
            record["detection_history"].append({
                "time": now_iso,
                "frp": frp,
                "satellite": satellite,
                "status": "VERIFIED_ACTIVE_FIRE"
            })
            if len(record["detection_history"]) > 10:
                record["detection_history"] = record["detection_history"][-10:]
        else:
            record = {
                "dimension_id": dim_id,
                "latitude": round(lat, 4),
                "longitude": round(lng, 4),
                "grid_boundary": f"{lat-0.005:.4f}°N to {lat+0.005:.4f}°N, {lng-0.005:.4f}°E to {lng+0.005:.4f}°E",
                "target_name": name,
                "district": district,
                "state": state,
                "category": category,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "verified_active_fire": True,
                "first_observed_utc": now_iso,
                "last_observed_utc": now_iso,
                "total_occurrences": 1,
                "peak_frp_mw": frp,
                "latest_frp_mw": frp,
                "cumulative_energy_mw": frp,
                "satellite_sensors": [satellite],
                "detection_history": [
                    {"time": now_iso, "frp": frp, "satellite": satellite, "status": "FIRST_PASS_VERIFIED"}
                ]
            }
            self.occurrences[dim_id] = record

        self._save()
        return {
            "recorded": True,
            "dimension_id": dim_id,
            "total_occurrences": record["total_occurrences"],
            "last_observed_utc": now_iso,
            "record": record
        }

    def get_all_occurrences(self) -> List[Dict[str, Any]]:
        """Returns all tracked coordinate dimensions sorted by occurrence frequency."""
        records = list(self.occurrences.values())
        records.sort(key=lambda x: (x["risk_level"] == "CRITICAL", x["total_occurrences"]), reverse=True)
        return records

    def get_stats(self) -> Dict[str, Any]:
        """Calculates dimensional aggregation metrics."""
        total_dims = len(self.occurrences)
        active_fires = sum(1 for o in self.occurrences.values() if o.get("verified_active_fire", False))
        critical_dims = sum(1 for o in self.occurrences.values() if o.get("risk_level") == "CRITICAL")
        total_passes = sum(o.get("total_occurrences", 0) for o in self.occurrences.values())
        avg_occurrences = round(total_passes / max(1, total_dims), 1)

        return {
            "total_tracked_dimensions": total_dims,
            "active_fire_dimensions": active_fires,
            "critical_risk_dimensions": critical_dims,
            "total_satellite_passes_recorded": total_passes,
            "average_recurrence_per_dimension": avg_occurrences,
            "last_synced_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        }

dimension_store = SpatialDimensionStore()
