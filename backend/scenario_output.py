from typing import List, Optional
from pydantic import BaseModel, Field

class ImpactChiffre(BaseModel):
    libelle: str
    valeur_avant: Optional[str] = None
    valeur_apres: str
    unite: str = "€"
    variation: Optional[str] = None

class ScenarioOutputDetail(BaseModel):
    titre_strategie: str
    description_breve: str
    applicable: bool = True
    impacts_chiffres_cles: List[ImpactChiffre] = Field(default_factory=list)
    avantages: List[str] = Field(default_factory=list)
    inconvenients_ou_points_attention: List[str] = Field(default_factory=list)
    texte_explicatif_complementaire: Optional[str] = None
    sources_rag_text: Optional[str] = None 