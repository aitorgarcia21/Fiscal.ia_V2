"""
🏦 GOCARDLESS BANK ACCOUNT DATA SERVICE
======================================

Service pour intégrer l'API GoCardless Bank Account Data
dans le dashboard particulier de Francis.
"""

import os
import json
import requests
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration GoCardless
GOCARDLESS_BASE_URL = "https://bankaccountdata.gocardless.com/api/v2"
USE_SANDBOX = os.getenv("GOCARDLESS_USE_SANDBOX", "true").lower() == "true"

@dataclass
class GoCardlessCredentials:
    secret_id: str
    secret_key: str

@dataclass
class AccessToken:
    access: str
    access_expires: int
    created_at: datetime

@dataclass
class Institution:
    id: str
    name: str
    bic: str
    countries: List[str]
    logo: str

@dataclass
class Agreement:
    id: str
    institution_id: str
    max_historical_days: int
    access_valid_for_days: int
    status: str

@dataclass
class Requisition:
    id: str
    institution_id: str
    redirect: str
    status: str
    agreement: str
    link: str
    accounts: List[str]

@dataclass
class BankAccount:
    id: str
    iban: Optional[str]
    name: Optional[str]
    currency: str
    status: str
    balance: float = 0.0

@dataclass
class Transaction:
    transaction_id: str
    amount: float
    currency: str
    booking_date: str
    value_date: str
    debtor_name: Optional[str] = None
    creditor_name: Optional[str] = None
    remittance_info: Optional[str] = None

class GoCardlessService:
    """Service principal GoCardless pour l'intégration bancaire"""
    
    def __init__(self):
        self.credentials = self._load_credentials()
        self.current_token: Optional[AccessToken] = None
        self.base_url = GOCARDLESS_BASE_URL
        
    def _load_credentials(self) -> GoCardlessCredentials:
        """Charge les credentials depuis les variables d'environnement"""
        secret_id = os.getenv("GOCARDLESS_SECRET_ID")
        secret_key = os.getenv("GOCARDLESS_SECRET_KEY")
        
        if not secret_id or not secret_key:
            logger.warning("🔧 Credentials GoCardless manquants - utilisation du mode démo")
            return GoCardlessCredentials(
                secret_id="DEMO_SECRET_ID",
                secret_key="DEMO_SECRET_KEY"
            )
        
        return GoCardlessCredentials(secret_id=secret_id, secret_key=secret_key)
    
    def _is_token_valid(self) -> bool:
        """Vérifie si le token actuel est valide"""
        if not self.current_token:
            return False
        
        expires_at = self.current_token.created_at + timedelta(seconds=self.current_token.access_expires - 300)
        return datetime.now() < expires_at
    
    async def get_access_token(self) -> str:
        """Récupère un token d'accès valide"""
        if self._is_token_valid():
            return self.current_token.access
        
        try:
            response = requests.post(
                f"{self.base_url}/token/new/",
                json={
                    "secret_id": self.credentials.secret_id,
                    "secret_key": self.credentials.secret_key
                },
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.current_token = AccessToken(
                    access=data["access"],
                    access_expires=data["access_expires"],
                    created_at=datetime.now()
                )
                logger.info("✅ Token GoCardless récupéré avec succès")
                return self.current_token.access
            else:
                logger.error(f"❌ Erreur récupération token: {response.status_code}")
                raise Exception(f"Erreur authentification GoCardless: {response.status_code}")
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'authentification: {str(e)}")
            # En mode démo, retourner un token simulé
            if self.credentials.secret_id == "DEMO_SECRET_ID":
                self.current_token = AccessToken(
                    access="DEMO_TOKEN",
                    access_expires=3600,
                    created_at=datetime.now()
                )
                return "DEMO_TOKEN"
            raise e
    
    async def get_institutions(self, country: str = "FR") -> List[Institution]:
        """Récupère la liste des institutions bancaires disponibles"""
        try:
            token = await self.get_access_token()
            
            if token == "DEMO_TOKEN":
                # Retourner des institutions simulées pour la démo
                return self._get_demo_institutions()
            
            response = requests.get(
                f"{self.base_url}/institutions/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                params={"country": country}
            )
            
            if response.status_code == 200:
                institutions_data = response.json()
                logger.info(f"🔍 DEBUG institutions_data type: {type(institutions_data)}")
                logger.info(f"🔍 DEBUG institutions_data content: {institutions_data}")
                
                # S'assurer que c'est une liste et non une string
                if isinstance(institutions_data, str):
                    institutions_data = json.loads(institutions_data)
                    
                institutions = []
                
                for inst_data in institutions_data:
                    institution = Institution(
                        id=inst_data["id"],
                        name=inst_data["name"],
                        bic=inst_data.get("bic", ""),
                        countries=inst_data.get("countries", []),
                        logo=inst_data.get("logo", "")
                    )
                    institutions.append(institution)
                
                return institutions
            else:
                logger.error(f"❌ Erreur récupération institutions: {response.status_code}")
                return self._get_demo_institutions()
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la récupération des institutions: {str(e)}")
            return self._get_demo_institutions()
    
    def _get_demo_institutions(self) -> List[Institution]:
        """Retourne des institutions simulées pour la démo"""
        return [
            Institution(
                id="BNP_PARIBAS_FR",
                name="BNP Paribas",
                bic="BNPAFRPP",
                countries=["FR"],
                logo="🏦"
            ),
            Institution(
                id="CREDIT_AGRICOLE_FR",
                name="Crédit Agricole",
                bic="AGRIFRPP",
                countries=["FR"],
                logo="🌱"
            ),
            Institution(
                id="SOCIETE_GENERALE_FR",
                name="Société Générale",
                bic="SOGEFRPP",
                countries=["FR"],
                logo="🔴"
            ),
            Institution(
                id="BOURSORAMA_FR",
                name="Boursorama",
                bic="BOUSFRPP",
                countries=["FR"],
                logo="📱"
            ),
            Institution(
                id="REVOLUT_FR",
                name="Revolut",
                bic="REVOFR22",
                countries=["FR"],
                logo="💳"
            )
        ]
    
    async def create_agreement(self, institution_id: str, max_historical_days: int = 90) -> Agreement:
        """Crée un accord utilisateur final"""
        try:
            token = await self.get_access_token()
            
            if token == "DEMO_TOKEN":
                # Simuler un agreement pour la démo
                return Agreement(
                    id=f"DEMO_AGREEMENT_{institution_id}",
                    institution_id=institution_id,
                    max_historical_days=max_historical_days,
                    access_valid_for_days=90,
                    status="CREATED"
                )
            
            response = requests.post(
                f"{self.base_url}/agreements/enduser/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json={
                    "institution_id": institution_id,
                    "max_historical_days": max_historical_days,
                    "access_valid_for_days": 90,
                    "access_scope": ["balances", "details", "transactions"]
                }
            )
            
            if response.status_code == 201:
                data = response.json()
                logger.info(f"🔍 DEBUG agreement data type: {type(data)}")
                logger.info(f"🔍 DEBUG agreement data content: {data}")
                
                # S'assurer que c'est un dict et non une string
                if isinstance(data, str):
                    data = json.loads(data)
                    
                return Agreement(
                    id=data["id"],
                    institution_id=data["institution_id"],
                    max_historical_days=data["max_historical_days"],
                    access_valid_for_days=data["access_valid_for_days"],
                    status=data.get("status", "CREATED")
                )
            else:
                logger.error(f"❌ Erreur création agreement: {response.status_code}")
                raise Exception(f"Erreur création agreement: {response.status_code}")
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la création de l'agreement: {str(e)}")
            raise e
    
    async def create_requisition(self, institution_id: str, redirect_uri: str, agreement_id: str, user_id: str) -> Requisition:
        """Crée une réquisition pour la connexion bancaire"""
        try:
            token = await self.get_access_token()
            
            if token == "DEMO_TOKEN":
                # Simuler une requisition pour la démo
                return Requisition(
                    id=f"DEMO_REQ_{user_id}_{institution_id}",
                    institution_id=institution_id,
                    redirect=redirect_uri,
                    status="CREATED",
                    agreement=agreement_id,
                    link=f"https://demo-bank-redirect.com/auth?req=DEMO_REQ_{user_id}",
                    accounts=[]
                )
            
            response = requests.post(
                f"{self.base_url}/requisitions/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json={
                    "redirect": redirect_uri,
                    "institution_id": institution_id,
                    "agreement": agreement_id,
                    "reference": f"user_{user_id}",
                    "user_language": "FR"
                }
            )
            
            if response.status_code == 201:
                data = response.json()
                return Requisition(
                    id=data["id"],
                    institution_id=data["institution_id"],
                    redirect=data["redirect"],
                    status=data["status"],
                    agreement=data["agreement"],
                    link=data["link"],
                    accounts=data.get("accounts", [])
                )
            else:
                logger.error(f"❌ Erreur création requisition: {response.status_code}")
                raise Exception(f"Erreur création requisition: {response.status_code}")
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la création de la requisition: {str(e)}")
            raise e
    
    async def get_requisition_status(self, requisition_id: str) -> Dict[str, Any]:
        """Récupère le statut d'une réquisition"""
        try:
            token = await self.get_access_token()
            
            if token == "DEMO_TOKEN":
                # Simuler un statut pour la démo
                return {
                    "id": requisition_id,
                    "status": "LN",  # Linked
                    "accounts": [f"DEMO_ACCOUNT_{requisition_id}_1", f"DEMO_ACCOUNT_{requisition_id}_2"]
                }
            
            response = requests.get(
                f"{self.base_url}/requisitions/{requisition_id}/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"❌ Erreur récupération statut requisition: {response.status_code}")
                return {"status": "ERROR"}
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la récupération du statut: {str(e)}")
            return {"status": "ERROR"}
    
    async def get_account_details(self, account_id: str) -> Optional[BankAccount]:
        """Récupère les détails d'un compte bancaire"""
        try:
            token = await self.get_access_token()
            
            if token == "DEMO_TOKEN":
                # Simuler des détails de compte pour la démo
                return BankAccount(
                    id=account_id,
                    iban=f"FR76 3000 3000 0000 0000 0000 {account_id[-3:]}",
                    name="Compte Courant",
                    currency="EUR",
                    status="READY",
                    balance=5420.50
                )
            
            response = requests.get(
                f"{self.base_url}/accounts/{account_id}/details/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"🔍 DEBUG account_details data type: {type(data)}")
                
                # S'assurer que c'est un dict et non une string
                if isinstance(data, str):
                    data = json.loads(data)
                    
                account_data = data.get("account", {})
                
                return BankAccount(
                    id=account_id,
                    iban=account_data.get("iban"),
                    name=account_data.get("name"),
                    currency=account_data.get("currency", "EUR"),
                    status="READY"
                )
            else:
                logger.error(f"❌ Erreur récupération détails compte: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la récupération des détails du compte: {str(e)}")
            return None
    
    async def get_account_balances(self, account_id: str) -> Optional[float]:
        """Récupère le solde d'un compte bancaire"""
        try:
            token = await self.get_access_token()
            
            if token == "DEMO_TOKEN":
                # Simuler un solde pour la démo
                import random
                return round(random.uniform(1000, 10000), 2)
            
            response = requests.get(
                f"{self.base_url}/accounts/{account_id}/balances/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"🔍 DEBUG balances data type: {type(data)}")
                
                # S'assurer que c'est un dict et non une string
                if isinstance(data, str):
                    data = json.loads(data)
                    
                balances = data.get("balances", [])
                
                if balances:
                    # Prendre le premier solde disponible
                    balance_data = balances[0]
                    amount = balance_data.get("balanceAmount", {}).get("amount", "0")
                    return float(amount)
                
                return 0.0
            else:
                logger.error(f"❌ Erreur récupération soldes: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la récupération des soldes: {str(e)}")
            return None
    
    async def get_account_transactions(self, account_id: str, date_from: Optional[str] = None, date_to: Optional[str] = None) -> List[Transaction]:
        """Récupère les transactions d'un compte bancaire"""
        try:
            token = await self.get_access_token()
            
            if token == "DEMO_TOKEN":
                # Simuler des transactions pour la démo
                return self._get_demo_transactions(account_id)
            
            params = {}
            if date_from:
                params["date_from"] = date_from
            if date_to:
                params["date_to"] = date_to
            
            response = requests.get(
                f"{self.base_url}/accounts/{account_id}/transactions/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"🔍 DEBUG transactions data type: {type(data)}")
                
                # S'assurer que c'est un dict et non une string
                if isinstance(data, str):
                    data = json.loads(data)
                    
                transactions_data = data.get("transactions", {}).get("booked", [])
                
                transactions = []
                for trans_data in transactions_data:
                    transaction = Transaction(
                        transaction_id=trans_data.get("transactionId", ""),
                        amount=float(trans_data.get("transactionAmount", {}).get("amount", 0)),
                        currency=trans_data.get("transactionAmount", {}).get("currency", "EUR"),
                        booking_date=trans_data.get("bookingDate", ""),
                        value_date=trans_data.get("valueDate", ""),
                        debtor_name=trans_data.get("debtorName"),
                        creditor_name=trans_data.get("creditorName"),
                        remittance_info=trans_data.get("remittanceInformationUnstructured")
                    )
                    transactions.append(transaction)
                
                return transactions
            else:
                logger.error(f"❌ Erreur récupération transactions: {response.status_code}")
                return self._get_demo_transactions(account_id)
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la récupération des transactions: {str(e)}")
            return self._get_demo_transactions(account_id)
    
    def _get_demo_transactions(self, account_id: str) -> List[Transaction]:
        """Retourne des transactions simulées pour la démo"""
        return [
            Transaction(
                transaction_id=f"DEMO_TRANS_001_{account_id}",
                amount=3500.00,
                currency="EUR",
                booking_date="2024-01-15",
                value_date="2024-01-15",
                creditor_name="Entreprise XYZ",
                remittance_info="Salaire janvier 2024"
            ),
            Transaction(
                transaction_id=f"DEMO_TRANS_002_{account_id}",
                amount=-1200.00,
                currency="EUR",
                booking_date="2024-01-12",
                value_date="2024-01-12",
                debtor_name="Proprio Immobilier",
                remittance_info="Loyer appartement"
            ),
            Transaction(
                transaction_id=f"DEMO_TRANS_003_{account_id}",
                amount=-89.50,
                currency="EUR",
                booking_date="2024-01-10",
                value_date="2024-01-10",
                debtor_name="EDF",
                remittance_info="Facture électricité"
            )
        ]

# Instance globale du service
gocardless_service = GoCardlessService()
