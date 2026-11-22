from typing import List, Optional
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import CORS_ORIGINS, DATABASE_URL
from .database import engine, Base, get_db, SessionLocal, is_postgres, active_url
from .models import Hospital, Doctor, BloodDonor, SearchAudit
from .schemas import (
    HospitalResponse,
    HospitalUpdate,
    HospitalCreate,
    MatchRequest,
    MatchResponse,
    BloodDonorResponse,
    DoctorResponse,
    HealthResponse,
    ResourceDetail,
)
from .matching import (
    calculate_haversine,
    calculate_driving,
    get_match_status,
    calculate_score,
    evaluate_reasons,
)
from .seed_data import seed_database

logger = logging.getLogger("mediroute.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed data
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title="MediRoute Emergency API",
    description="High-Performance Clinical Decision Support & Real-Time Hospital Dispatch Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hospital_to_schema(h: Hospital, lat: Optional[float] = None, lng: Optional[float] = None) -> HospitalResponse:
    dist = h.distance
    time_min = h.travel_time

    # Calculate real-time dynamic distance if client GPS coordinates are provided
    if lat is not None and lng is not None:
        straight = calculate_haversine(lat, lng, h.lat, h.lng)
        dist, time_min = calculate_driving(straight)

    oxygen_sys = [s.strip() for s in h.oxygen_systems.split(",")] if h.oxygen_systems else []

    return HospitalResponse(
        id=h.id,
        name=h.name,
        area=h.area,
        address=h.address,
        lat=h.lat,
        lng=h.lng,
        distance=dist,
        travelTime=time_min,
        verified=h.verified,
        emergencyOpen=h.emergency_open,
        icu=ResourceDetail(capacity=h.icu_capacity, available=h.icu_available),
        ventilator=ResourceDetail(capacity=h.ventilator_capacity, available=h.ventilator_available),
        oxygen=h.oxygen,
        surgery=h.surgery,
        bloodBank=h.blood_bank,
        cardiology=h.cardiology,
        neurology=h.neurology,
        lastUpdated=h.last_updated,
        admin=h.admin,
        phone=h.phone,
        emergencyPhone=h.emergency_phone,
        bedCount=h.bed_count,
        category=h.category,
        website=h.website,
        oxygenStatus=h.oxygen_status,
        oxygenSystems=oxygen_sys,
        ventilatorStatus=h.ventilator_status,
        ventilatorCount=h.ventilator_count,
        icuStatus=h.icu_status,
        emergencyServices=h.emergency_services,
        sourceUrl=h.source_url,
        verificationTimestamp=h.verification_timestamp,
        verificationNote=h.verification_note,
    )

@app.get("/health", response_model=HealthResponse)
def health_check():
    db_name = "PostgreSQL" if is_postgres else "SQLite (Local High-Performance Fallback)"
    return HealthResponse(
        status="healthy",
        database=db_name,
        isPostgres=is_postgres,
        version="1.0.0",
    )

@app.get("/api/system/network")
def get_system_network():
    import socket
    lan_ip = "127.0.0.1"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        lan_ip = s.getsockname()[0]
        s.close()
    except Exception:
        pass
    return {
        "lan_ip": lan_ip,
        "frontend_port": 5173,
        "backend_port": 8000,
        "mobile_url": f"http://{lan_ip}:5173/login"
    }


@app.get("/api/hospitals", response_model=List[HospitalResponse])
def get_hospitals(
    lat: Optional[float] = Query(None, description="Patient GPS Latitude"),
    lng: Optional[float] = Query(None, description="Patient GPS Longitude"),
    db: Session = Depends(get_db),
):
    hospitals = db.query(Hospital).all()
    return [hospital_to_schema(h, lat, lng) for h in hospitals]

@app.get("/api/hospitals/{hospital_id}", response_model=HospitalResponse)
def get_hospital(hospital_id: str, db: Session = Depends(get_db)):
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital_to_schema(h)

@app.patch("/api/hospitals/{hospital_id}", response_model=HospitalResponse)
def update_hospital(hospital_id: str, payload: HospitalUpdate, db: Session = Depends(get_db)):
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "icu" in update_data and update_data["icu"]:
        h.icu_capacity = update_data["icu"]["capacity"]
        h.icu_available = update_data["icu"]["available"]

    if "ventilator" in update_data and update_data["ventilator"]:
        h.ventilator_capacity = update_data["ventilator"]["capacity"]
        h.ventilator_available = update_data["ventilator"]["available"]

    for key, value in update_data.items():
        if key not in ["icu", "ventilator"] and hasattr(h, key):
            setattr(h, key, value)

    h.last_updated = "just now"
    db.commit()
    db.refresh(h)
    return hospital_to_schema(h)

@app.post("/api/hospitals", response_model=HospitalResponse, status_code=status.HTTP_201_CREATED)
def create_hospital(payload: HospitalCreate, db: Session = Depends(get_db)):
    existing = db.query(Hospital).filter(Hospital.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Hospital with this ID already exists")

    h = Hospital(
        id=payload.id,
        name=payload.name,
        area=payload.area,
        address=payload.address,
        lat=payload.lat,
        lng=payload.lng,
        distance=payload.distance,
        travel_time=payload.travelTime,
        verified=payload.verified,
        emergency_open=payload.emergencyOpen,
        icu_capacity=payload.icu.capacity,
        icu_available=payload.icu.available,
        ventilator_capacity=payload.ventilator.capacity,
        ventilator_available=payload.ventilator.available,
        oxygen=payload.oxygen,
        surgery=payload.surgery,
        blood_bank=payload.bloodBank,
        cardiology=payload.cardiology,
        neurology=payload.neurology,
        admin=payload.admin,
        phone=payload.phone,
        emergency_phone=payload.emergencyPhone,
        bed_count=payload.bedCount,
        category=payload.category,
        website=payload.website,
        oxygen_status=payload.oxygenStatus,
        oxygen_systems=",".join(payload.oxygenSystems) if payload.oxygenSystems else None,
        ventilator_status=payload.ventilatorStatus,
        ventilator_count=payload.ventilatorCount,
        icu_status=payload.icuStatus,
        emergency_services=payload.emergencyServices,
        source_url=payload.sourceUrl,
        verification_timestamp=payload.verificationTimestamp,
        verification_note=payload.verificationNote,
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    return hospital_to_schema(h)

@app.post("/api/match", response_model=MatchResponse)
def match_emergency(req: MatchRequest, db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).all()
    user_lat = req.location.lat
    user_lng = req.location.lng

    ranked = []
    for h in hospitals:
        straight = calculate_haversine(user_lat, user_lng, h.lat, h.lng)
        dist_km, travel_mins = calculate_driving(straight)

        m_status = get_match_status(h, req.requirements)
        m_score = calculate_score(h, req.requirements, travel_mins, dist_km)
        evals = evaluate_reasons(h, req.requirements)
        match_reasons = [f"{e['label']} verified" for e in evals if e["ok"]]
        inelig_reasons = [f"{e['label']} unavailable" for e in evals if not e["ok"]]

        schema = hospital_to_schema(h, user_lat, user_lng)
        schema.matchScore = m_score
        schema.matchStatus = m_status
        schema.matchReasons = match_reasons
        schema.ineligibleReasons = inelig_reasons
        ranked.append(schema)

    # Sort primarily by matchScore descending
    ranked.sort(key=lambda x: x.matchScore or 0, reverse=True)

    top_recommended = ranked[0] if ranked else None

    # Why not nearest rationale
    why_not_nearest = None
    if ranked:
        sorted_by_dist = sorted(ranked, key=lambda x: x.distance)
        nearest = sorted_by_dist[0]
        if top_recommended and nearest.id != top_recommended.id:
            reason = "it lacks required capabilities: " + ", ".join(nearest.ineligibleReasons or []) if nearest.ineligibleReasons else "it has lower immediate resource availability."
            explanation = (
                f"{nearest.name} is closest ({nearest.distance:.1f} km / {nearest.travelTime} mins), "
                f"but was bypassed because {reason} Routing was redirected to {top_recommended.name} "
                f"({top_recommended.travelTime} mins) for patient safety under {req.type} clinical guidelines."
            )
            why_not_nearest = {
                "nearest": nearest,
                "topRecommended": top_recommended,
                "explanation": explanation,
            }

    rationale = None
    if top_recommended:
        blood_info = f" (Patient Target Blood: {req.targetBloodGroup})" if req.targetBloodGroup else ""
        rationale = (
            f"{top_recommended.name} satisfies critical clinical requirements for {req.type} "
            f"({', '.join(req.requirements)}){blood_info} with dynamic travel time of {top_recommended.travelTime} mins."
        )

    # Log search audit
    try:
        audit = SearchAudit(
            emergency_type=req.type,
            requirements=",".join(req.requirements),
            target_blood_group=req.targetBloodGroup,
            patient_lat=user_lat,
            patient_lng=user_lng,
            location_label=req.location.label,
            top_match_hospital_id=top_recommended.id if top_recommended else None,
        )
        db.add(audit)
        db.commit()
    except Exception:
        pass

    return MatchResponse(
        rankedHospitals=ranked,
        topRecommended=top_recommended,
        recommendationRationale=rationale,
        whyNotNearest=why_not_nearest,
        totalEvaluated=len(ranked),
    )

@app.get("/api/blood-donors", response_model=List[BloodDonorResponse])
def get_blood_donors(
    blood_group: Optional[str] = Query(None, description="Blood group filter, e.g. O- or A+"),
    department: Optional[str] = Query(None, description="Department filter, e.g. CSE"),
    db: Session = Depends(get_db),
):
    q = db.query(BloodDonor)
    if blood_group:
        q = q.filter(BloodDonor.blood_group == blood_group)
    if department:
        q = q.filter(BloodDonor.department == department)
    return q.all()

@app.get("/api/stats")
def get_network_stats(db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).all()
    total_icu_avail = sum(h.icu_available for h in hospitals)
    total_icu_cap = sum(h.icu_capacity for h in hospitals)
    total_vent_avail = sum(h.ventilator_available for h in hospitals)
    total_vent_cap = sum(h.ventilator_capacity for h in hospitals)
    active_eds = sum(1 for h in hospitals if h.emergency_open)
    verified = sum(1 for h in hospitals if h.verified)

    return {
        "totalHospitals": len(hospitals),
        "activeEmergencyDepartments": active_eds,
        "verifiedFacilities": verified,
        "icu": {"available": total_icu_avail, "capacity": total_icu_cap},
        "ventilators": {"available": total_vent_avail, "capacity": total_vent_cap},
    }
