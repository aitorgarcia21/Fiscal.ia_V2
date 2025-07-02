from fastapi import APIRouter
from backend.tax_data_loader import get_tax_data

router = APIRouter(prefix="/api/meta", tags=["Meta"])

@router.get("/tax-data")
async def tax_data_meta():
    data = get_tax_data()
    return {"version": data.get("version"), "updated": True} 