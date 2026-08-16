"""
RenalCare AI - Pydantic Schemas
Request and response models for API validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import json


# ============= Patient Schemas =============

class PatientCreate(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    bmi: Optional[float] = None
    family_history: bool = False


class PatientResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    bmi: Optional[float]
    family_history: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============= Scan Schemas =============

class ScanAnalysisResult(BaseModel):
    stone_size_mm: float
    location: str
    severity: str  # "mild", "moderate", "severe", "none"
    confidence: float
    num_stones: int = 0


class ScanUploadRequest(BaseModel):
    patient_id: str
    stone_type: str = "calcium_oxalate"


class ScanResponse(BaseModel):
    id: str
    patient_id: str
    stone_size_mm: float
    stone_location: str
    severity: str
    confidence: float
    stone_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ScanDetailedResponse(ScanResponse):
    image_path: str
    analysis_results: dict


# ============= Water Intake Schemas =============

class WaterIntakeCreate(BaseModel):
    patient_id: str
    amount_ml: float = Field(..., gt=0)
    time: Optional[str] = None
    notes: Optional[str] = None


class WaterIntakeResponse(BaseModel):
    id: str
    patient_id: str
    amount_ml: float
    time: Optional[str]
    notes: Optional[str] = None
    date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class DailyWaterSummary(BaseModel):
    date: str
    total_intake_ml: float
    goal_ml: float
    percentage: float
    intakes: List[WaterIntakeResponse]


# ============= Meal Schemas =============

class MealItemCreate(BaseModel):
    name: str
    quantity: str
    oxalate_level: str = "medium"  # "low", "medium", "high"


class MealLogCreate(BaseModel):
    patient_id: str
    meal_type: str  # "breakfast", "lunch", "dinner", "snack"
    food_items: List[MealItemCreate]
    notes: Optional[str] = None


class MealLogResponse(BaseModel):
    id: str
    patient_id: str
    date: datetime
    meal_type: str
    oxalate_level: str
    sodium_mg: float
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class DailyMealSummary(BaseModel):
    date: str
    meals: List[MealLogResponse]
    total_sodium_mg: float
    high_oxalate_items: List[str]
    recommendations: List[str]


# ============= Diet Recommendation Schemas =============

class DietRecommendationResponse(BaseModel):
    stone_type: str
    restricted_foods: List[str]
    recommended_foods: List[str]
    daily_fluid_intake_ml: int
    daily_sodium_limit_mg: int
    tips: List[str]


class DietRecommendationRequest(BaseModel):
    stone_type: str


# ============= Risk Prediction Schemas =============

class RiskPredictionRequest(BaseModel):
    patient_id: str
    age: int
    gender: str
    family_history: bool
    previous_stones: int = 0
    treatment_compliance: float = 75.0


class RiskPredictionResponse(BaseModel):
    patient_id: str
    risk_score: float
    risk_level: str  # "Low", "Moderate", "High"
    recommendations: List[str]
    last_updated: datetime


# ============= Health Summary Schemas =============

class HealthSummary(BaseModel):
    patient_id: str
    name: str
    latest_scan: Optional[ScanResponse]
    today_water_intake_ml: float
    water_goal_ml: float
    today_meals_count: int
    risk_score: float
    risk_level: str
    recommendations: List[str]


# ============= Appointment Schemas =============

class AppointmentCreate(BaseModel):
    patient_id: str
    appointment_date: str
    appointment_type: str
    doctor_type: str
    title: str
    reason: str
    description: str


class DoctorRecommendationCreate(BaseModel):
    patient_id: str
    appointment_id: str
    hydration_adjustment: Optional[str] = None
    dietary_changes: Optional[str] = None
    medication_changes: Optional[str] = None
    monitoring_schedule: Optional[str] = None
    follow_up_date: Optional[str] = None
    appointment_date: Optional[str] = None


# ============= Generic Response Schemas =============

class SuccessResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[dict] = None
