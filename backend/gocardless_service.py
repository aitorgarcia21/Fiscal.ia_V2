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
            
            response.raise_for_status()  # Lève une exception pour les codes d'erreur HTTP
            
            # Parsing JSON robuste
            try:
                institutions_data = response.json()
            except ValueError as e:
                logger.error(f"❌ Erreur parsing JSON institutions: {e}")
                logger.error(f"❌ Response text: {response.text[:500]}")
                return self._get_demo_institutions()
            
            logger.info(f"🔍 DEBUG institutions_data type: {type(institutions_data)}")
            
            # Selon le guide GoCardless, la réponse devrait être une liste directement
            if not isinstance(institutions_data, list):
                logger.error(f"❌ Format de réponse inattendu: {type(institutions_data)}")
                return self._get_demo_institutions()
                
            institutions = []
            
            for inst_data in institutions_data:
                if not isinstance(inst_data, dict):
                    logger.warning(f"⚠️ Données institution invalides: {inst_data}")
                    continue
                    
                try:
                    institution = Institution(
                        id=inst_data["id"],
                        name=inst_data["name"],
                        bic=inst_data.get("bic", ""),
                        countries=inst_data.get("countries", []),
                        logo=inst_data.get("logo", "")
                    )
                    institutions.append(institution)
                except KeyError as e:
                    logger.warning(f"⚠️ Champ manquant dans institution: {e}")
                    continue
            
            return institutions
                
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
            
            # Payload selon le guide officiel GoCardless
            payload = {
                "institution_id": institution_id,
                "max_historical_days": str(max_historical_days),  # String selon la doc
                "access_valid_for_days": "90",  # String selon la doc
                "access_scope": ["balances", "details", "transactions"]
            }
            
            logger.info(f"📝 Création agreement avec payload: {payload}")
            
            response = requests.post(
                f"{self.base_url}/agreements/enduser/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "accept": "application/json"
                },
                json=payload
            )
            
            logger.info(f"🔍 Response status: {response.status_code}")
            logger.info(f"🔍 Response text: {response.text[:500]}")
            
            # Gestion robuste des réponses
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    logger.info(f"✅ Agreement créé avec succès: {data.get('id')}")
                    
                    return Agreement(
                        id=data["id"],
                        institution_id=data["institution_id"],
                        max_historical_days=int(data["max_historical_days"]),
                        access_valid_for_days=int(data["access_valid_for_days"]),
                        status="CREATED"
                    )
                except (ValueError, KeyError) as e:
                    logger.error(f"❌ Erreur parsing réponse agreement: {e}")
                    raise Exception(f"Réponse API invalide: {e}")
            else:
                logger.error(f"❌ Erreur création agreement: {response.status_code}")
                logger.error(f"❌ Response body: {response.text}")
                raise Exception(f"Erreur création agreement: {response.status_code} - {response.text}")
                
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
            
            # Payload selon le guide officiel GoCardless
            payload = {
                "redirect": redirect_uri,
                "institution_id": institution_id,
                "agreement": agreement_id,
                "reference": f"user_{user_id}",
                "user_language": "FR"
            }
            
            logger.info(f"📝 Création requisition avec payload: {payload}")
            
            response = requests.post(
                f"{self.base_url}/requisitions/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "accept": "application/json"
                },
                json=payload
            )
            
            logger.info(f"🔍 Response status: {response.status_code}")
            logger.info(f"🔍 Response text: {response.text[:500]}")
            
            # Gestion robuste des réponses
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    logger.info(f"✅ Requisition créée avec succès: {data.get('id')}")
                    
                    return Requisition(
                        id=data["id"],
                        institution_id=data.get("institution_id", institution_id),
                        redirect=data["redirect"],
                        status=data["status"],
                        agreement=data["agreement"],
                        link=data["link"],
                        accounts=data.get("accounts", [])
                    )
                except (ValueError, KeyError) as e:
                    logger.error(f"❌ Erreur parsing réponse requisition: {e}")
                    raise Exception(f"Réponse API invalide: {e}")
            else:
                logger.error(f"❌ Erreur création requisition: {response.status_code}")
                logger.error(f"❌ Response body: {response.text}")
                raise Exception(f"Erreur création requisition: {response.status_code} - {response.text}")
                
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
        """Récupère les détails d'un compte bancaire selon l'API GoCardless officielle"""
        try:
            token = await self.get_access_token()
            
            if token == "DEMO_TOKEN":
                # Simuler des détails de compte pour la démo
                return BankAccount(
                    id=account_id,
                    iban=f"FR76 3000 3000 0000 0000 000{account_id[-1]}",
                    name="Compte Courant",
                    currency="EUR",
                    status="READY"
                )
            
            logger.info(f"📋 Récupération détails compte: {account_id}")
            
            response = requests.get(
                f"{self.base_url}/accounts/{account_id}/details/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "accept": "application/json"
                }
            )
            
            logger.info(f"🔍 Response status: {response.status_code}")
            logger.info(f"🔍 Response text: {response.text[:500]}")
            
            response.raise_for_status()  # Lève une exception pour les codes d'erreur HTTP
            
            # Parsing JSON robuste
            try:
                data = response.json()
            except ValueError as e:
                logger.error(f"❌ Erreur parsing JSON account details: {e}")
                logger.error(f"❌ Response text: {response.text[:500]}")
                return None
            
            # Selon GoCardless, la réponse contient directement les détails du compte
            if not isinstance(data, dict):
                logger.error(f"❌ Format de réponse inattendu: {type(data)}")
                return None
            
            # Extraire les données selon le format GoCardless officiel
            account_data = data.get("account", data)  # Parfois la réponse est directe
            
            return BankAccount(
                id=account_id,
                iban=account_data.get("iban"),
                name=account_data.get("name") or account_data.get("product"),
                currency=account_data.get("currency", "EUR"),
                status="READY"
            )
                
            balances = data.get("balances", [])
            
            if not isinstance(balances, list):
                logger.error(f"❌ Format balances inattendu: {type(balances)}")
                return None
            
            # Chercher le solde current ou available selon le format GoCardless officiel
            for balance in balances:
                if not isinstance(balance, dict):
                    continue
                    
                balance_type = balance.get("balanceType")
                if balance_type in ["closingBooked", "expected", "interimAvailable"]:
                    balance_amount = balance.get("balanceAmount", {})
                    if isinstance(balance_amount, dict):
                        amount = balance_amount.get("amount")
                        if amount is not None:
                            try:
                                return float(amount)
                            except (ValueError, TypeError):
                                logger.warning(f"⚠️ Impossible de convertir le montant: {amount}")
                                continue
            
            logger.warning(f"⚠️ Aucun solde valide trouvé pour le compte {account_id}")
            return 0.0
                
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
            
            logger.info(f"💳 Récupération transactions compte: {account_id}")
            
            response = requests.get(
                f"{self.base_url}/accounts/{account_id}/transactions/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "accept": "application/json"
                },
                params=params
            )
            
            logger.info(f"🔍 Response status: {response.status_code}")
            logger.info(f"🔍 Response text: {response.text[:500]}")
            
            response.raise_for_status()  # Lève une exception pour les codes d'erreur HTTP
            
            # Parsing JSON robuste
            try:
                data = response.json()
            except ValueError as e:
                logger.error(f"❌ Erreur parsing JSON transactions: {e}")
                logger.error(f"❌ Response text: {response.text[:500]}")
                return self._get_demo_transactions(account_id)
            
            # Selon GoCardless, la réponse contient un objet "transactions" avec "booked" et "pending"
            if not isinstance(data, dict):
                logger.error(f"❌ Format de réponse inattendu: {type(data)}")
                return self._get_demo_transactions(account_id)
            
            transactions_obj = data.get("transactions", {})
            if not isinstance(transactions_obj, dict):
                logger.error(f"❌ Format transactions inattendu: {type(transactions_obj)}")
                return self._get_demo_transactions(account_id)
                
            transactions_data = transactions_obj.get("booked", [])
            if not isinstance(transactions_data, list):
                logger.error(f"❌ Format booked transactions inattendu: {type(transactions_data)}")
                return self._get_demo_transactions(account_id)
            
            transactions = []
            for trans_data in transactions_data:
                if not isinstance(trans_data, dict):
                    logger.warning(f"⚠️ Transaction data invalide: {trans_data}")
                    continue
                    
                try:
                    # Extraire le montant selon le format GoCardless officiel
                    transaction_amount = trans_data.get("transactionAmount", {})
                    amount = 0.0
                    currency = "EUR"
                    
                    if isinstance(transaction_amount, dict):
                        amount_str = transaction_amount.get("amount", "0")
                        currency = transaction_amount.get("currency", "EUR")
                        try:
                            amount = float(amount_str)
                        except (ValueError, TypeError):
                            logger.warning(f"⚠️ Impossible de convertir le montant: {amount_str}")
                            amount = 0.0
                    
                    transaction = Transaction(
                        transaction_id=trans_data.get("transactionId", ""),
                        amount=amount,
                        currency=currency,
                        booking_date=trans_data.get("bookingDate", ""),
                        value_date=trans_data.get("valueDate", ""),
                        debtor_name=trans_data.get("debtorName"),
                        creditor_name=trans_data.get("creditorName"),
                        remittance_info=trans_data.get("remittanceInformationUnstructured")
                    )
                    transactions.append(transaction)
                    
                except Exception as trans_error:
                    logger.warning(f"⚠️ Erreur parsing transaction: {trans_error}")
                    continue
            
            logger.info(f"✅ {len(transactions)} transactions récupérées")
            return transactions
                
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
