import math
from typing import List, Dict, Any, Tuple

EARTH_RADIUS_KM = 6371.0088
URBAN_ROAD_FACTOR = 1.28
AVERAGE_URBAN_SPEED_KMH = 26

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(EARTH_RADIUS_KM * c, 2)

def calculate_driving(straight_km: float) -> Tuple[float, int]:
    road_dist = max(0.1, straight_km * URBAN_ROAD_FACTOR)
    hours = road_dist / AVERAGE_URBAN_SPEED_KMH
    minutes = max(1, round(hours * 60 + 1))
    return round(road_dist, 1), minutes

def check_capability(hospital: Any, req: str) -> bool:
    if req == "Emergency Department":
        return bool(hospital.emergency_open)
    elif req == "ICU":
        return hospital.icu_available > 0
    elif req == "Ventilator":
        return hospital.ventilator_available > 0
    elif req == "Oxygen":
        return hospital.oxygen == "Available"
    elif req == "Surgery":
        return bool(hospital.surgery)
    elif req == "Blood":
        return bool(hospital.blood_bank)
    elif req == "Cardiology":
        return bool(hospital.cardiology)
    elif req == "Neurology":
        return bool(hospital.neurology)
    return True

def evaluate_reasons(hospital: Any, requirements: List[str]) -> List[Dict[str, Any]]:
    return [{"label": r, "ok": check_capability(hospital, r)} for r in requirements]

def get_match_status(hospital: Any, requirements: List[str]) -> str:
    if not hospital.emergency_open:
        return "unsuitable"
    evals = evaluate_reasons(hospital, requirements)
    total = len(evals)
    passed = sum(1 for e in evals if e["ok"])
    if passed == total:
        return "full"
    elif passed >= max(1, total - 2):
        return "partial"
    return "unsuitable"

def calculate_score(hospital: Any, requirements: List[str], travel_time: int, distance: float) -> int:
    if not hospital.emergency_open:
        return 15

    evals = evaluate_reasons(hospital, requirements)
    total_reqs = len(evals) or 1
    passed = sum(1 for e in evals if e["ok"])
    cap_score = (passed / total_reqs) * 50

    icu_bonus = min(10, hospital.icu_available * 2)
    vent_bonus = min(8, hospital.ventilator_available * 2)
    oxy_bonus = 7 if hospital.oxygen == "Available" else (3 if hospital.oxygen == "Limited" else 0)
    avail_score = icu_bonus + vent_bonus + oxy_bonus

    travel_score = max(0, 15 - travel_time * 0.6)
    dist_score = max(0, 10 - distance * 1.5)
    prox_score = travel_score + dist_score

    fresh_score = 5 if hospital.verified else 0
    total = round(cap_score + avail_score + prox_score + fresh_score)
    return min(99, max(10, total))
