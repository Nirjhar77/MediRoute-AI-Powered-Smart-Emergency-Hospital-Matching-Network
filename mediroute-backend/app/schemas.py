from typing import List, Optional
from pydantic import BaseModel, Field

class ResourceDetail(BaseModel):
    capacity: int
    available: int

class HospitalBase(BaseModel):
    name: str
    area: str
    address: Optional[str] = None
    lat: float
    lng: float
    distance: float = 0.0
    travelTime: int = Field(default=0, alias="travel_time")
    verified: bool = True
    emergencyOpen: bool = Field(default=True, alias="emergency_open")
    icu: ResourceDetail
    ventilator: ResourceDetail
    oxygen: str = "Available"
    surgery: bool = False
    bloodBank: bool = Field(default=False, alias="blood_bank")
    cardiology: bool = False
    neurology: bool = False
    lastUpdated: str = Field(default="just now", alias="last_updated")
    admin: str = ""
    phone: str = ""
    emergencyPhone: Optional[str] = Field(default=None, alias="emergency_phone")
    bedCount: Optional[int] = Field(default=None, alias="bed_count")
    category: Optional[str] = None
    website: Optional[str] = None
    oxygenStatus: Optional[str] = Field(default=None, alias="oxygen_status")
    oxygenSystems: Optional[List[str]] = Field(default=None, alias="oxygen_systems")
    ventilatorStatus: Optional[str] = Field(default=None, alias="ventilator_status")
    ventilatorCount: Optional[int] = Field(default=None, alias="ventilator_count")
    icuStatus: Optional[str] = Field(default=None, alias="icu_status")
    emergencyServices: Optional[str] = Field(default=None, alias="emergency_services")
    sourceUrl: Optional[str] = Field(default=None, alias="source_url")
    verificationTimestamp: Optional[str] = Field(default=None, alias="verification_timestamp")
    verificationNote: Optional[str] = Field(default=None, alias="verification_note")

    class Config:
        populate_by_name = True
        from_attributes = True

class HospitalCreate(HospitalBase):
    id: str

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    verified: Optional[bool] = None
    emergencyOpen: Optional[bool] = Field(default=None, alias="emergency_open")
    icu: Optional[ResourceDetail] = None
    ventilator: Optional[ResourceDetail] = None
    oxygen: Optional[str] = None
    surgery: Optional[bool] = None
    bloodBank: Optional[bool] = Field(default=None, alias="blood_bank")
    cardiology: Optional[bool] = None
    neurology: Optional[bool] = None
    admin: Optional[str] = None
    phone: Optional[str] = None
    emergencyPhone: Optional[str] = Field(default=None, alias="emergency_phone")
    bedCount: Optional[int] = Field(default=None, alias="bed_count")

    class Config:
        populate_by_name = True

class HospitalResponse(HospitalBase):
    id: str
    matchScore: Optional[int] = None
    matchStatus: Optional[str] = None
    matchReasons: Optional[List[str]] = None
    ineligibleReasons: Optional[List[str]] = None

class DoctorResponse(BaseModel):
    id: str
    nameEn: str
    nameBn: str
    specialtyBn: str
    degreesEn: str
    degreesBn: str
    image: str
    detailUrl: str
    category: Optional[str] = None

    class Config:
        from_attributes = True

class BloodDonorResponse(BaseModel):
    id: int
    name: str
    department: str
    intakeType: str
    semester: str
    bloodGroup: str
    phoneNumber: str

    class Config:
        from_attributes = True

class LocationCoords(BaseModel):
    lat: float
    lng: float
    label: Optional[str] = "Current GPS Location"

class MatchRequest(BaseModel):
    type: str  # Trauma, Cardiac, Respiratory, General Emergency
    requirements: List[str]
    location: LocationCoords
    targetBloodGroup: Optional[str] = None

class MatchResponse(BaseModel):
    rankedHospitals: List[HospitalResponse]
    topRecommended: Optional[HospitalResponse] = None
    recommendationRationale: Optional[str] = None
    whyNotNearest: Optional[dict] = None
    totalEvaluated: int

class HealthResponse(BaseModel):
    status: str
    database: str
    isPostgres: bool
    version: str
