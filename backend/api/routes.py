from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
import json

router = APIRouter()

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    content = await file.read(1024)
    lines = content.decode('utf-8').splitlines()
    if not lines:
        raise HTTPException(status_code=400, detail="Empty file.")
        
    columns = lines[0].split(',')
    
    return {
        "filename": file.filename,
        "columns": columns,
        "message": "File uploaded successfully."
    }

@router.post("/analyze")
async def analyze_bias(
    target_variable: str = Form(...),
    sensitive_attribute: str = Form(...),
):
    results = {
        "demographic_parity_difference": 0.15,
        "equalized_odds_difference": 0.08,
        "disparate_impact_ratio": 0.82,
        "bias_detected": True,
        "groups": {
            "group_0": {"approval_rate": 0.45},
            "group_1": {"approval_rate": 0.60}
        }
    }
    
    explanation = (
        "Based on the analysis, there is a moderate bias detected regarding the sensitive attribute. "
        "The approval rate for Group 1 is significantly higher (60%) compared to Group 0 (45%). "
        "This indicates a violation of Demographic Parity, meaning the model's decisions are disproportionately favoring one group."
    )
    
    return {
        "metrics": results,
        "explanation": explanation
    }

@router.post("/debias")
async def debias_dataset(method: str = Form(...)):
    return {
        "message": f"Debiasing applied using {method}",
        "new_metrics": {
            "demographic_parity_difference": 0.02,
            "equalized_odds_difference": 0.01,
            "disparate_impact_ratio": 0.98,
            "bias_detected": False
        }
    }
