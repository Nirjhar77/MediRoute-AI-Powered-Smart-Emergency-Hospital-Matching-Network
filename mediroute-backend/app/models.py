from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
)
from .database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    area = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    distance = Column(Float, default=0.0)
    travel_time = Column(Integer, default=0)
    verified = Column(Boolean, default=True)
    emergency_open = Column(Boolean, default=True)

    # Resources
    icu_capacity = Column(Integer, default=0)
    icu_available = Column(Integer, default=0)
    ventilator_capacity = Column(Integer, default=0)
    ventilator_available = Column(Integer, default=0)
    oxygen = Column(String(50), default="Available")  # Available, Limited, Unavailable

    # Specialties
    surgery = Column(Boolean, default=False)
    blood_bank = Column(Boolean, default=False)
    cardiology = Column(Boolean, default=False)
    neurology = Column(Boolean, default=False)

    # Operational & Contact info
    last_updated = Column(String(50), default="just now")
    admin = Column(String(150), default="")
    phone = Column(String(50), default="")
    emergency_phone = Column(String(50), nullable=True)
    bed_count = Column(Integer, nullable=True)

    # Verification Metadata
    category = Column(String(50), nullable=True)  # Government, Private, Medical College, Specialized
    website = Column(String(255), nullable=True)
    oxygen_status = Column(String(50), nullable=True)
    oxygen_systems = Column(String(255), nullable=True)  # Comma separated
    ventilator_status = Column(String(50), nullable=True)
    ventilator_count = Column(Integer, nullable=True)
    icu_status = Column(String(50), nullable=True)
    emergency_services = Column(String(50), nullable=True)
    source_url = Column(String(255), nullable=True)
    verification_timestamp = Column(String(50), nullable=True)
    verification_note = Column(Text, nullable=True)

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(100), primary_key=True, index=True)
    name_en = Column(String(255), nullable=False)
    name_bn = Column(String(255), default="")
    specialty_bn = Column(String(255), default="")
    degrees_en = Column(String(255), default="")
    degrees_bn = Column(String(255), default="")
    image = Column(String(500), default="")
    detail_url = Column(String(500), default="")
    category = Column(String(100), nullable=True, index=True)

class BloodDonor(Base):
    __tablename__ = "blood_donors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    intake_type = Column(String(50), nullable=False)
    semester = Column(String(50), nullable=False)
    blood_group = Column(String(10), nullable=False, index=True)
    phone_number = Column(String(50), nullable=False)

class SearchAudit(Base):
    __tablename__ = "search_audits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    emergency_type = Column(String(50), nullable=False)
    requirements = Column(Text, nullable=False)
    target_blood_group = Column(String(10), nullable=True)
    patient_lat = Column(Float, nullable=True)
    patient_lng = Column(Float, nullable=True)
    location_label = Column(String(255), nullable=True)
    top_match_hospital_id = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
