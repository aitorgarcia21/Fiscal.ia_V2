"""
Endpoints API pour les calculs fiscaux suisses
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import sys
import os

# Ajouter le répertoire parent au path pour importer le module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from calculs_fiscaux_suisse import SwissTaxCalculator, get_available_cantons
except ImportError:
    # Fallback si le module n'est pas trouvé
    class SwissTaxCalculator:
        def calculate_total_tax_burden(self, situation):
            return {"error": "Module de calcul non disponible"}
        def compare_cantons(self, situation):
            return {"error": "Module de calcul non disponible"}
        def calculate_pillar_3a_optimization(self, situation):
            return {"error": "Module de calcul non disponible"}
    
    def get_available_cantons():
        return {"geneva": "Genève", "zurich": "Zurich"}

router = APIRouter(prefix="/api", tags=["swiss-tax"])

class SwissTaxRequest(BaseModel):
    gross_income: float
    canton: str
    marital_status: str = "single"
    children: int = 0
    pillar_3a: float = 0
    insurance_premiums: float = 0
    employment_type: str = "employed"

class WithholdingTaxRequest(BaseModel):
    monthly_salary: float
    status: str = "single"

@router.get("/swiss-cantons")
async def get_swiss_cantons():
    """Retourne la liste des cantons suisses disponibles"""
    try:
        cantons = get_available_cantons()
        return {"cantons": cantons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des cantons: {str(e)}")

@router.post("/calculate-swiss-tax")
async def calculate_swiss_tax(request: SwissTaxRequest):
    """Calcule les impôts suisses pour une situation donnée"""
    try:
        calculator = SwissTaxCalculator()
        
        # Conversion de la requête en dictionnaire
        situation = {
            "gross_income": request.gross_income,
            "canton": request.canton,
            "marital_status": request.marital_status,
            "children": request.children,
            "pillar_3a": request.pillar_3a,
            "insurance_premiums": request.insurance_premiums,
            "employment_type": request.employment_type
        }
        
        # Validation des données
        if request.gross_income <= 0:
            raise HTTPException(status_code=400, detail="Le revenu brut doit être positif")
        
        if request.canton not in get_available_cantons():
            raise HTTPException(status_code=400, detail=f"Canton {request.canton} non supporté")
        
        # Calcul des impôts
        result = calculator.calculate_total_tax_burden(situation)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul: {str(e)}")

@router.post("/compare-swiss-cantons")
async def compare_swiss_cantons(request: SwissTaxRequest):
    """Compare la charge fiscale entre les cantons suisses"""
    try:
        calculator = SwissTaxCalculator()
        
        situation = {
            "gross_income": request.gross_income,
            "canton": request.canton,
            "marital_status": request.marital_status,
            "children": request.children,
            "pillar_3a": request.pillar_3a,
            "insurance_premiums": request.insurance_premiums,
            "employment_type": request.employment_type
        }
        
        if request.gross_income <= 0:
            raise HTTPException(status_code=400, detail="Le revenu brut doit être positif")
        
        # Comparaison des cantons
        comparison = calculator.compare_cantons(situation)
        
        return comparison
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la comparaison: {str(e)}")

@router.post("/optimize-pillar-3a")
async def optimize_pillar_3a(request: SwissTaxRequest):
    """Optimise les versements Pilier 3A"""
    try:
        calculator = SwissTaxCalculator()
        
        situation = {
            "gross_income": request.gross_income,
            "canton": request.canton,
            "marital_status": request.marital_status,
            "children": request.children,
            "pillar_3a": request.pillar_3a,
            "insurance_premiums": request.insurance_premiums,
            "employment_type": request.employment_type
        }
        
        if request.gross_income <= 0:
            raise HTTPException(status_code=400, detail="Le revenu brut doit être positif")
        
        # Optimisation Pilier 3A
        optimization = calculator.calculate_pillar_3a_optimization(situation)
        
        return optimization
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'optimisation: {str(e)}")

@router.post("/calculate-withholding-tax")
async def calculate_withholding_tax(request: WithholdingTaxRequest):
    """Calcule l'impôt à la source mensuel"""
    try:
        calculator = SwissTaxCalculator()
        
        if request.monthly_salary <= 0:
            raise HTTPException(status_code=400, detail="Le salaire mensuel doit être positif")
        
        # Calcul de l'impôt à la source
        withholding_tax = calculator.calculate_withholding_tax(
            request.monthly_salary, 
            request.status
        )
        
        annual_withholding = withholding_tax * 12
        net_monthly = request.monthly_salary - withholding_tax
        
        return {
            "monthly_salary": request.monthly_salary,
            "monthly_withholding_tax": withholding_tax,
            "annual_withholding_tax": annual_withholding,
            "net_monthly_salary": net_monthly,
            "withholding_rate": round((withholding_tax / request.monthly_salary * 100), 2) if request.monthly_salary > 0 else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul de l'impôt à la source: {str(e)}")

@router.get("/swiss-tax-brackets/{canton}")
async def get_swiss_tax_brackets(canton: str):
    """Retourne les tranches d'imposition pour un canton donné"""
    try:
        if canton not in get_available_cantons():
            raise HTTPException(status_code=404, detail=f"Canton {canton} non trouvé")
        
        calculator = SwissTaxCalculator()
        
        # Récupération des données fiscales
        federal_brackets = calculator.tax_data['federal_tax']['brackets']
        cantonal_brackets = calculator.tax_data['cantonal_tax'][canton]['brackets']
        canton_name = calculator.tax_data['cantonal_tax'][canton]['name']
        
        return {
            "canton": canton_name,
            "federal_brackets": federal_brackets,
            "cantonal_brackets": cantonal_brackets,
            "cantonal_rate": calculator.tax_data['cantonal_tax'][canton]['cantonal_rate'],
            "communal_rate": calculator.tax_data['cantonal_tax'][canton]['communal_rate']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des tranches: {str(e)}")

@router.get("/swiss-deductions")
async def get_swiss_deductions():
    """Retourne les déductions disponibles en Suisse"""
    try:
        calculator = SwissTaxCalculator()
        deductions = calculator.tax_data['deductions']
        
        return {
            "deductions": deductions,
            "description": "Déductions fiscales disponibles en Suisse pour 2025"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des déductions: {str(e)}")

@router.get("/swiss-social-contributions")
async def get_swiss_social_contributions():
    """Retourne les taux de cotisations sociales suisses"""
    try:
        calculator = SwissTaxCalculator()
        social_contributions = calculator.tax_data['social_contributions']
        
        return {
            "social_contributions": social_contributions,
            "description": "Taux de cotisations sociales en Suisse pour 2025"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des cotisations: {str(e)}") 