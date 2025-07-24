"""
🏦 ROUTES API GOCARDLESS
========================

Routes FastAPI pour l'intégration GoCardless dans le dashboard particulier.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import RedirectResponse
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime, timedelta

try:
    from gocardless_service import gocardless_service, Institution, Agreement, Requisition, BankAccount, Transaction
    from dependencies import verify_token
except ImportError:
    try:
        from backend.gocardless_service import gocardless_service, Institution, Agreement, Requisition, BankAccount, Transaction
        from backend.dependencies import verify_token
    except ImportError:
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from gocardless_service import gocardless_service, Institution, Agreement, Requisition, BankAccount, Transaction
        from dependencies import verify_token
        
# Alias pour compatibilité
get_current_user = verify_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gocardless", tags=["GoCardless"])

@router.get("/institutions", response_model=List[Dict[str, Any]])
async def get_institutions(
    country: str = Query(default="FR", description="Code pays (FR, DE, ES, etc.)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Récupère la liste des institutions bancaires disponibles pour un pays.
    """
    try:
        logger.info(f"📋 Récupération des institutions pour {country} - User: {current_user.get('user_id')}")
        
        institutions = await gocardless_service.get_institutions(country=country)
        
        institutions_data = []
        for institution in institutions:
            institutions_data.append({
                "id": institution.id,
                "name": institution.name,
                "bic": institution.bic,
                "countries": institution.countries,
                "logo": institution.logo
            })
        
        logger.info(f"✅ {len(institutions_data)} institutions trouvées")
        return institutions_data
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération institutions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des institutions: {str(e)}")

@router.post("/agreements", response_model=Dict[str, Any])
async def create_agreement(
    institution_id: str,
    max_historical_days: int = 90,
    current_user: dict = Depends(get_current_user)
):
    """
    Crée un accord utilisateur final pour une institution bancaire.
    """
    try:
        logger.info(f"📝 Création agreement pour {institution_id} - User: {current_user.get('user_id')}")
        
        agreement = await gocardless_service.create_agreement(
            institution_id=institution_id,
            max_historical_days=max_historical_days
        )
        
        agreement_data = {
            "id": agreement.id,
            "institution_id": agreement.institution_id,
            "max_historical_days": agreement.max_historical_days,
            "access_valid_for_days": agreement.access_valid_for_days,
            "status": agreement.status
        }
        
        logger.info(f"✅ Agreement créé: {agreement.id}")
        return agreement_data
        
    except Exception as e:
        logger.error(f"❌ Erreur création agreement: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de l'accord: {str(e)}")

@router.post("/requisitions", response_model=Dict[str, Any])
async def create_requisition(
    institution_id: str,
    agreement_id: str,
    redirect_uri: str = "https://fiscal-ia.net/dashboard/particulier/callback",
    current_user: dict = Depends(get_current_user)
):
    """
    Crée une réquisition pour la connexion bancaire.
    """
    try:
        user_id = current_user.get('user_id', 'unknown')
        logger.info(f"🔗 Création requisition pour {institution_id} - User: {user_id}")
        
        requisition = await gocardless_service.create_requisition(
            institution_id=institution_id,
            redirect_uri=redirect_uri,
            agreement_id=agreement_id,
            user_id=str(user_id)
        )
        
        requisition_data = {
            "id": requisition.id,
            "institution_id": requisition.institution_id,
            "redirect": requisition.redirect,
            "status": requisition.status,
            "agreement": requisition.agreement,
            "link": requisition.link,
            "accounts": requisition.accounts
        }
        
        logger.info(f"✅ Requisition créée: {requisition.id}")
        return requisition_data
        
    except Exception as e:
        logger.error(f"❌ Erreur création requisition: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la réquisition: {str(e)}")

@router.get("/requisitions/{requisition_id}/status", response_model=Dict[str, Any])
async def get_requisition_status(
    requisition_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Récupère le statut d'une réquisition.
    """
    try:
        logger.info(f"📊 Récupération statut requisition {requisition_id} - User: {current_user.get('user_id')}")
        
        status_data = await gocardless_service.get_requisition_status(requisition_id)
        
        logger.info(f"✅ Statut requisition: {status_data.get('status')}")
        return status_data
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération statut: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du statut: {str(e)}")

@router.get("/accounts", response_model=List[Dict[str, Any]])
async def get_user_accounts(
    current_user: dict = Depends(get_current_user)
):
    """
    Récupère tous les comptes bancaires de l'utilisateur connecté selon l'API GoCardless officielle.
    """
    try:
        user_id = current_user.get('user_id')
        logger.info(f"🏦 Récupération comptes GoCardless pour User: {user_id}")
        
        # TODO: Dans une vraie implémentation, récupérer les requisitions depuis la DB
        # Pour l'instant, utiliser des données de démo qui simulent le flow GoCardless
        
        # Simule le processus GoCardless:
        # 1. L'utilisateur a déjà des requisitions avec des account IDs
        # 2. On récupère les détails de chaque compte via l'API GoCardless
        
        demo_requisitions = [
            {
                "id": f"req_{user_id}_1",
                "status": "LN",  # Linked status selon GoCardless
                "accounts": [f"acc_{user_id}_1", f"acc_{user_id}_2"]
            }
        ]
        
        accounts = []
        
        for requisition in demo_requisitions:
            if requisition["status"] == "LN":  # Status "Linked" selon GoCardless
                for account_id in requisition["accounts"]:
                    # Dans une vraie implémentation, on appellerait gocardless_service.get_account_details(account_id)
                    account_details = await gocardless_service.get_account_details(account_id)
                    if account_details:
                        # Récupérer aussi le solde
                        balance = await gocardless_service.get_account_balances(account_id)
                        
                        accounts.append({
                            "id": account_details.id,
                            "name": account_details.name or "Compte bancaire",
                            "iban": account_details.iban,
                            "balance": balance or 0.0,
                            "currency": account_details.currency,
                            "bank_name": "Banque connectée",
                            "status": "connected",
                            "last_sync": datetime.now().isoformat()
                        })
        
        # Si aucun compte réel trouvé, utiliser les données de démo
        if not accounts:
            accounts = [
                {
                    "id": f"DEMO_ACCOUNT_1_{user_id}",
                    "name": "Compte Courant",
                    "iban": "FR76 3000 3000 0000 0000 0000 001",
                    "balance": 5420.50,
                    "currency": "EUR",
                    "bank_name": "BNP Paribas",
                    "status": "connected",
                    "last_sync": datetime.now().isoformat()
                },
                {
                    "id": f"DEMO_ACCOUNT_2_{user_id}",
                    "name": "Livret A",
                    "iban": "FR76 3000 3000 0000 0000 0000 002",
                    "balance": 15000.00,
                    "currency": "EUR",
                    "bank_name": "BNP Paribas",
                    "status": "connected",
                    "last_sync": datetime.now().isoformat()
                }
            ]
        
        logger.info(f"✅ {len(accounts)} comptes trouvés")
        return accounts
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération comptes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des comptes: {str(e)}")

@router.get("/accounts/{account_id}/details", response_model=Dict[str, Any])
async def get_account_details(
    account_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Récupère les détails d'un compte bancaire spécifique.
    """
    try:
        logger.info(f"📋 Récupération détails compte {account_id} - User: {current_user.get('user_id')}")
        
        account = await gocardless_service.get_account_details(account_id)
        
        if not account:
            raise HTTPException(status_code=404, detail="Compte non trouvé")
        
        # Récupérer également le solde
        balance = await gocardless_service.get_account_balances(account_id)
        
        account_data = {
            "id": account.id,
            "iban": account.iban,
            "name": account.name,
            "currency": account.currency,
            "status": account.status,
            "balance": balance or 0.0,
            "last_sync": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Détails compte récupérés: {account.name}")
        return account_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur récupération détails compte: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des détails: {str(e)}")

@router.get("/accounts/{account_id}/transactions", response_model=List[Dict[str, Any]])
async def get_account_transactions(
    account_id: str,
    date_from: Optional[str] = Query(None, description="Date de début (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Date de fin (YYYY-MM-DD)"),
    limit: int = Query(default=50, le=100, description="Nombre max de transactions"),
    current_user: dict = Depends(get_current_user)
):
    """
    Récupère les transactions d'un compte bancaire.
    """
    try:
        logger.info(f"💳 Récupération transactions compte {account_id} - User: {current_user.get('user_id')}")
        
        # Par défaut, récupérer les 30 derniers jours
        if not date_from:
            date_from = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not date_to:
            date_to = datetime.now().strftime("%Y-%m-%d")
        
        transactions = await gocardless_service.get_account_transactions(
            account_id=account_id,
            date_from=date_from,
            date_to=date_to
        )
        
        # Limiter le nombre de transactions
        transactions = transactions[:limit]
        
        transactions_data = []
        for transaction in transactions:
            # Déterminer le type de transaction et la catégorie
            transaction_type = "credit" if transaction.amount > 0 else "debit"
            category = _categorize_transaction(transaction.remittance_info or "", transaction.amount)
            
            transactions_data.append({
                "id": transaction.transaction_id,
                "date": transaction.booking_date,
                "value_date": transaction.value_date,
                "description": transaction.remittance_info or f"{transaction.creditor_name or transaction.debtor_name or 'Transaction'}",
                "amount": transaction.amount,
                "currency": transaction.currency,
                "category": category,
                "account_id": account_id,
                "type": transaction_type,
                "debtor_name": transaction.debtor_name,
                "creditor_name": transaction.creditor_name
            })
        
        logger.info(f"✅ {len(transactions_data)} transactions récupérées")
        return transactions_data
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération transactions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des transactions: {str(e)}")

@router.get("/summary", response_model=Dict[str, Any])
async def get_user_financial_summary(
    current_user: dict = Depends(get_current_user)
):
    """
    Génère un résumé financier basé sur les données bancaires de l'utilisateur.
    """
    try:
        user_id = current_user.get('user_id')
        logger.info(f"📊 Génération résumé financier pour User: {user_id}")
        
        # Récupérer tous les comptes
        accounts = await get_user_accounts(current_user)
        
        total_balance = sum(account['balance'] for account in accounts)
        
        # Calculer les revenus et dépenses du mois
        monthly_income = 0
        monthly_expenses = 0
        
        for account in accounts:
            transactions = await get_account_transactions(
                account_id=account['id'],
                date_from=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
                current_user=current_user
            )
            
            for transaction in transactions:
                if transaction['type'] == 'credit':
                    monthly_income += transaction['amount']
                else:
                    monthly_expenses += abs(transaction['amount'])
        
        # Estimation fiscale simplifiée
        annual_income = monthly_income * 12
        estimated_tmi = _estimate_tmi(annual_income)
        estimated_tax = annual_income * (estimated_tmi / 100) * 0.7  # Approximation
        possible_savings = estimated_tax * 0.15  # 15% d'économies possibles
        
        summary = {
            "total_balance": total_balance,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "net_monthly": monthly_income - monthly_expenses,
            "fiscal_summary": {
                "revenus_annuels": annual_income,
                "charges_deductibles": monthly_expenses * 12 * 0.1,  # 10% de charges déductibles
                "tmi_estime": estimated_tmi,
                "impot_estime": estimated_tax,
                "economies_possibles": possible_savings
            },
            "accounts_count": len(accounts),
            "last_updated": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Résumé financier généré - Solde total: {total_balance}€")
        return summary
        
    except Exception as e:
        logger.error(f"❌ Erreur génération résumé: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du résumé: {str(e)}")

def _categorize_transaction(description: str, amount: float) -> str:
    """
    Catégorise une transaction basée sur sa description.
    """
    description_lower = description.lower()
    
    if amount > 0:
        if any(word in description_lower for word in ['salaire', 'paie', 'salary', 'wages']):
            return 'Salaire'
        elif any(word in description_lower for word in ['remboursement', 'refund', 'reimbursement']):
            return 'Remboursement'
        elif any(word in description_lower for word in ['virement', 'transfer']):
            return 'Virement'
        else:
            return 'Revenus'
    else:
        if any(word in description_lower for word in ['loyer', 'rent', 'location']):
            return 'Logement'
        elif any(word in description_lower for word in ['edf', 'gdf', 'engie', 'électricité', 'gaz', 'energy']):
            return 'Énergie'
        elif any(word in description_lower for word in ['carrefour', 'leclerc', 'auchan', 'courses', 'supermarché']):
            return 'Alimentation'
        elif any(word in description_lower for word in ['essence', 'station', 'carburant', 'fuel']):
            return 'Transport'
        elif any(word in description_lower for word in ['restaurant', 'café', 'bar', 'mcdo', 'quick']):
            return 'Restaurants'
        elif any(word in description_lower for word in ['pharmacie', 'médecin', 'docteur', 'hopital']):
            return 'Santé'
        elif any(word in description_lower for word in ['netflix', 'spotify', 'amazon', 'subscription']):
            return 'Abonnements'
        else:
            return 'Autres'

def _estimate_tmi(annual_income: float) -> int:
    """
    Estime le TMI basé sur les revenus annuels (barème 2024).
    """
    if annual_income <= 11294:
        return 0
    elif annual_income <= 28797:
        return 11
    elif annual_income <= 82341:
        return 30
    elif annual_income <= 177106:
        return 41
    else:
        return 45
