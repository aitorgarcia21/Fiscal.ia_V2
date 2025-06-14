import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from .supabase_client import get_supabase
from .questionnaire_schema import QuestionnaireCGP, Identite, RevenusCharges, PatrimoineImmobilier, PatrimoineFinancier, DettesIFIDeductibles, Objectifs, InputsPourOptimisations

# Détection Supabase
_USE_SB = False
try:
    sb = get_supabase()
    _USE_SB = True
except Exception:
    _USE_SB = False

TABLE = "questionnaires"

# Fallback JSON local
DATA_PATH = Path(__file__).parent / "data" / "questionnaires.json"
DATA_PATH.parent.mkdir(parents=True, exist_ok=True)

def _load_json() -> Dict[str, List[Dict]]:
    if DATA_PATH.exists():
        return json.loads(DATA_PATH.read_text())
    return {}

def _save_json(data: Dict[str, List[Dict]]):
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2))

# --- Supabase implementation ---
if _USE_SB:
    def save_questionnaire(client_id: str, answers: Dict) -> str:
        qid = str(uuid.uuid4())
        sb.table(TABLE).insert({
            "id": qid,
            "client_id": client_id,
            "answers": answers,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        return qid

    def get_latest_questionnaire(client_id: str) -> Optional[Dict]:
        res = sb.table(TABLE).select("*").eq("client_id", client_id).order("created_at", desc=True).limit(1).execute()
        return res.data[0] if res.data else None

    def list_questionnaires_for_client(client_id: str) -> List[Dict]:
        res = sb.table(TABLE).select("*").eq("client_id", client_id).order("created_at", desc=True).execute()
        return res.data if res.data else []

    def get_questionnaire_by_id(questionnaire_id: str) -> Optional[Dict]:
        res = sb.table(TABLE).select("*").eq("id", questionnaire_id).single().execute()
        return res.data if res.data else None

    def update_questionnaire(questionnaire_id: str, updated_answers: Dict) -> bool:
        """Met à jour un questionnaire existant.
           Retourne True si la mise à jour a réussi, False sinon.
        """
        # Vérifier si le questionnaire existe serait une bonne pratique avant update,
        # mais update().eq() ne lèvera pas d'erreur si la ligne n'existe pas, il ne fera juste rien (res.data sera vide).
        update_payload = {
            "answers": updated_answers,
            "updated_at": datetime.utcnow().isoformat()
        }
        res = sb.table(TABLE).update(update_payload).eq("id", questionnaire_id).execute()
        # Supabase retourne les données modifiées dans res.data. S'il y a des données, la MàJ a eu lieu.
        return bool(res.data)
else:
    # JSON fallback
    def save_questionnaire(client_id: str, answers: Dict) -> str:
        qid = str(uuid.uuid4())
        data = _load_json()
        data.setdefault(client_id, []).append({
            "id": qid,
            "answers": answers,
            "created_at": datetime.utcnow().isoformat()
        })
        _save_json(data)
        return qid

    def get_latest_questionnaire(client_id: str) -> Optional[Dict]:
        data = _load_json()
        if client_id not in data or not data[client_id]:
            return None
        return sorted(data[client_id], key=lambda x: x["created_at"], reverse=True)[0]

    def list_questionnaires_for_client(client_id: str) -> List[Dict]:
        data = _load_json()
        if client_id not in data or not data[client_id]:
            return []
        # Trier par date de création, du plus récent au plus ancien
        return sorted(data[client_id], key=lambda x: x.get("created_at", ""), reverse=True)

    def get_questionnaire_by_id(questionnaire_id: str) -> Optional[Dict]:
        all_questionnaires = _load_json()
        for client_id_key in all_questionnaires:
            for q_data in all_questionnaires[client_id_key]:
                if q_data.get("id") == questionnaire_id:
                    return q_data
        return None

    def update_questionnaire(questionnaire_id: str, updated_answers: Dict) -> bool:
        """Met à jour un questionnaire existant dans le fichier JSON.
           Retourne True si la mise à jour a réussi, False sinon.
        """
        all_questionnaires_by_client = _load_json()
        found_and_updated = False
        for client_id, questionnaires_list in all_questionnaires_by_client.items():
            for i, q_data in enumerate(questionnaires_list):
                if q_data.get("id") == questionnaire_id:
                    # Mise à jour des réponses et ajout/mise à jour de updated_at
                    q_data["answers"] = updated_answers
                    q_data["updated_at"] = datetime.utcnow().isoformat()
                    all_questionnaires_by_client[client_id][i] = q_data # Remplace l'ancien dict
                    found_and_updated = True
                    break
            if found_and_updated:
                break
        
        if found_and_updated:
            _save_json(all_questionnaires_by_client)
            return True
        return False 