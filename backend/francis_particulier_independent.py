"""
FRANCIS PARTICULIER INDÉPENDANT - ASSISTANT FISCAL EUROPÉEN 100% AUTONOME
=========================================================================

Assistant fiscal spécialisé pour les particuliers avec connaissance complète
de la fiscalité européenne. Système totalement indépendant sans dépendance externe.

Fonctionnalités :
- Conseil fiscal personnalisé pour 35 pays européens
- Calculs d'impôts précis et optimisation fiscale
- Comparaisons internationales et recommandations de résidence
- Support multilingue et mise à jour automatique
- Interface conversationnelle naturelle
"""

import os
import json
import re
import requests
import time
import hashlib
from typing import Dict, List, Optional, Tuple, Any, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
from functools import lru_cache
import threading
from collections import defaultdict

# Import de la base de connaissance européenne
from european_tax_knowledge_base import (
    european_tax_kb, 
    get_european_tax_response,
    EuropeanTaxKnowledgeBase
)

class OllamaClient:
    """Client avancé pour communiquer avec Ollama en local"""
    
    def __init__(self, base_url: str = None, model: str = "mistral:7b-instruct"):
        # Utiliser la variable d'environnement ou localhost par défaut
        self.base_url = base_url or os.getenv("LLM_ENDPOINT", "http://localhost:11434")
        self.model = model
        self.models_cache = {}
        self.performance_stats = {
            "requests_count": 0,
            "avg_response_time": 0,
            "success_rate": 0,
            "errors": []
        }
    
    def is_available(self) -> bool:
        """Vérifie si Ollama est disponible avec cache intelligent"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/api/tags", timeout=3)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                # Cache des modèles disponibles
                try:
                    self.models_cache = {m['name']: m for m in response.json().get('models', [])}
                except:
                    pass
                return True
            return False
        except Exception as e:
            self.performance_stats["errors"].append({
                "timestamp": time.time(),
                "error": str(e),
                "type": "availability_check"
            })
            return False
    
    def generate_response(self, prompt: str, system_prompt: str = "", temperature: float = 0.3) -> str:
        """Génère une réponse avec Ollama avec monitoring avancé"""
        start_time = time.time()
        self.performance_stats["requests_count"] += 1
        
        try:
            # Optimisation du prompt pour de meilleures performances
            optimized_prompt = self._optimize_prompt(prompt)
            
            payload = {
                "model": self.model,
                "prompt": optimized_prompt,
                "system": system_prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "top_p": 0.9,
                    "num_ctx": 8192,  # Contexte élargi
                    "num_predict": 2048,
                    "repeat_penalty": 1.1,
                    "stop": ["\n\n\n", "---", "###"]
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=45
            )
            
            response_time = time.time() - start_time
            self._update_performance_stats(response_time, True)
            
            if response.status_code == 200:
                result = response.json().get("response", "")
                return self._post_process_response(result)
            else:
                self._update_performance_stats(response_time, False)
                return ""
                
        except Exception as e:
            response_time = time.time() - start_time
            self._update_performance_stats(response_time, False)
            self.performance_stats["errors"].append({
                "timestamp": time.time(),
                "error": str(e),
                "type": "generation",
                "prompt_length": len(prompt)
            })
            print(f"Erreur Ollama: {e}")
            return ""
    
    def _optimize_prompt(self, prompt: str) -> str:
        """Optimise le prompt pour de meilleures performances"""
        # Nettoyage et optimisation du prompt
        optimized = prompt.strip()
        # Limitation de la longueur si nécessaire
        if len(optimized) > 4000:
            optimized = optimized[:4000] + "..."
        return optimized
    
    def _post_process_response(self, response: str) -> str:
        """Post-traitement de la réponse pour améliorer la qualité"""
        # Nettoyage de la réponse
        cleaned = response.strip()
        # Suppression des répétitions
        lines = cleaned.split('\n')
        unique_lines = []
        for line in lines:
            if line not in unique_lines or len(unique_lines) == 0:
                unique_lines.append(line)
        return '\n'.join(unique_lines)
    
    def _update_performance_stats(self, response_time: float, success: bool):
        """Met à jour les statistiques de performance"""
        # Calcul de la moyenne mobile du temps de réponse
        current_avg = self.performance_stats["avg_response_time"]
        count = self.performance_stats["requests_count"]
        self.performance_stats["avg_response_time"] = (
            (current_avg * (count - 1) + response_time) / count
        )
        
        # Calcul du taux de succès
        if hasattr(self, '_success_count'):
            if success:
                self._success_count += 1
        else:
            self._success_count = 1 if success else 0
        
        self.performance_stats["success_rate"] = (
            self._success_count / count * 100
        )
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Retourne les statistiques de performance"""
        return {
            **self.performance_stats,
            "models_available": len(self.models_cache),
            "current_model": self.model,
            "recent_errors": self.performance_stats["errors"][-5:]  # 5 dernières erreurs
        }

class FrancisParticulierIndependent:
    """
    Francis Particulier - Assistant fiscal européen 100% indépendant
    Version améliorée avec cache intelligent, analytics et optimisations
    """
    
    def __init__(self):
        self.knowledge_base = european_tax_kb
        self.conversation_history = []
        self.user_profile = {}
        self.ollama_client = OllamaClient()
        
        # Cache intelligent pour les réponses
        self.response_cache = {}
        self.cache_ttl = 3600  # 1 heure
        
        # Analytics et métriques
        self.analytics = {
            "queries_processed": 0,
            "countries_queried": defaultdict(int),
            "query_types": defaultdict(int),
            "response_times": [],
            "user_satisfaction": [],
            "cache_hits": 0,
            "cache_misses": 0
        }
        
        # Configuration avancée
        self.config = {
            "enable_cache": True,
            "enable_analytics": True,
            "max_response_length": 5000,
            "enable_smart_suggestions": True,
            "enable_context_memory": True,
            "response_quality_threshold": 0.8
        }
        
        # Thread lock pour la sécurité
        self._lock = threading.Lock()
        
        # Patterns de reconnaissance des questions fiscales (améliorés)
        self.tax_patterns = {
            "income_tax": [
                r"impôt.*revenu", r"tmi", r"taux.*marginal", r"income.*tax",
                r"combien.*impôt", r"calcul.*impôt", r"je.*dois.*payer",
                r"barème.*fiscal", r"tranches.*imposition", r"revenus.*imposables"
            ],
            "vat": [
                r"tva", r"taxe.*valeur.*ajoutée", r"vat", r"value.*added.*tax",
                r"taux.*tva", r"récupération.*tva", r"déduction.*tva"
            ],
            "optimization": [
                r"optimis", r"réduire.*impôt", r"économiser", r"défiscalis",
                r"conseil.*fiscal", r"stratégie.*fiscal", r"planification.*fiscal",
                r"niches.*fiscal", r"investissement.*défiscalis", r"épargne.*retraite"
            ],
            "comparison": [
                r"compar", r"meilleur.*pays", r"où.*payer.*moins", r"différence.*pays",
                r"expatri", r"résidence.*fiscal", r"délocalisation.*fiscal",
                r"avantages.*fiscal.*pays", r"fiscalité.*européenne"
            ],
            "social_security": [
                r"cotisation.*social", r"sécurité.*social", r"social.*security",
                r"charges.*social", r"urssaf", r"csg.*crds", r"prélèvements.*sociaux"
            ],
            "wealth_tax": [
                r"impôt.*fortune", r"isf", r"ifi", r"wealth.*tax", r"patrimoine",
                r"biens.*immobiliers", r"actifs.*financiers", r"déclaration.*patrimoine"
            ],
            "capital_gains": [
                r"plus.*value", r"gain.*capital", r"capital.*gains", r"cession",
                r"vente.*actions", r"vente.*immobilier", r"abattement.*durée"
            ],
            "inheritance_tax": [
                r"succession", r"héritage", r"donation", r"transmission.*patrimoine",
                r"droits.*succession", r"abattement.*famille"
            ],
            "business_tax": [
                r"impôt.*société", r"is", r"bénéfices.*industriels", r"bic", r"bnc",
                r"auto.*entrepreneur", r"micro.*entreprise", r"tva.*intracommunautaire"
            ]
        }
    
    def _generate_cache_key(self, query: str, user_profile: Optional[Dict] = None) -> str:
        """Génère une clé de cache unique pour la requête"""
        profile_str = json.dumps(user_profile or {}, sort_keys=True)
        combined = f"{query.lower().strip()}|{profile_str}"
        return hashlib.md5(combined.encode()).hexdigest()
    
    def _is_cache_valid(self, timestamp: float) -> bool:
        """Vérifie si l'entrée de cache est encore valide"""
        return time.time() - timestamp < self.cache_ttl
    
    def _update_analytics(self, query: str, analysis: Dict, response_time: float):
        """Met à jour les analytics de performance"""
        if not self.config["enable_analytics"]:
            return
            
        with self._lock:
            self.analytics["queries_processed"] += 1
            self.analytics["response_times"].append(response_time)
            
            # Garde seulement les 1000 derniers temps de réponse
            if len(self.analytics["response_times"]) > 1000:
                self.analytics["response_times"] = self.analytics["response_times"][-1000:]
            
            # Statistiques par type de requête
            query_type = analysis.get("query_type", "general")
            self.analytics["query_types"][query_type] += 1
            
            # Statistiques par pays
            for country in analysis.get("countries_mentioned", []):
                self.analytics["countries_queried"][country] += 1
    
    def get_analytics_summary(self) -> Dict[str, Any]:
        """Retourne un résumé des analytics"""
        with self._lock:
            response_times = self.analytics["response_times"]
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            
            return {
                "total_queries": self.analytics["queries_processed"],
                "avg_response_time_ms": round(avg_response_time * 1000, 2),
                "cache_hit_rate": (
                    self.analytics["cache_hits"] / 
                    (self.analytics["cache_hits"] + self.analytics["cache_misses"]) * 100
                    if (self.analytics["cache_hits"] + self.analytics["cache_misses"]) > 0 else 0
                ),
                "top_countries": dict(sorted(
                    self.analytics["countries_queried"].items(), 
                    key=lambda x: x[1], 
                    reverse=True
                )[:10]),
                "top_query_types": dict(sorted(
                    self.analytics["query_types"].items(), 
                    key=lambda x: x[1], 
                    reverse=True
                )),
                "ollama_stats": self.ollama_client.get_performance_stats()
            }
    
    @lru_cache(maxsize=128)
    def _get_smart_suggestions(self, query_type: str, countries: tuple) -> List[str]:
        """Génère des suggestions intelligentes basées sur le contexte"""
        suggestions = []
        
        if query_type == "income_tax":
            suggestions.extend([
                "Voulez-vous comparer avec d'autres pays européens ?",
                "Souhaitez-vous des conseils d'optimisation fiscale ?",
                "Avez-vous des revenus de source étrangère ?"
            ])
        elif query_type == "optimization":
            suggestions.extend([
                "Considérez-vous un changement de résidence fiscale ?",
                "Avez-vous exploré les dispositifs d'épargne retraite ?",
                "Souhaitez-vous optimiser votre patrimoine immobilier ?"
            ])
        elif query_type == "comparison":
            suggestions.extend([
                "Voulez-vous une analyse détaillée des coûts de relocalisation ?",
                "Souhaitez-vous connaître les obligations déclaratives ?",
                "Avez-vous besoin d'informations sur les conventions fiscales ?"
            ])
        
        return suggestions[:3]  # Limite à 3 suggestions
    
    def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyse la requête utilisateur pour déterminer le type de question fiscale"""
        
        # Analyse basique avec patterns (fallback)
        basic_analysis = self._basic_pattern_analysis(query)
        
        # Analyse intelligente avec LLM local si disponible
        if self.ollama_client.is_available():
            llm_analysis = self._llm_query_analysis(query)
            # Fusion des analyses
            return self._merge_analyses(basic_analysis, llm_analysis)
        else:
            print("⚠️ Ollama non disponible, utilisation de l'analyse basique")
            return basic_analysis
    
    def _basic_pattern_analysis(self, query: str) -> Dict[str, Any]:
        """Analyse basique avec patterns regex (méthode de fallback)"""
        query_lower = query.lower()
        
        analysis = {
            "query_type": "general",
            "tax_topics": [],
            "countries_mentioned": [],
            "amounts_mentioned": [],
            "confidence": 0.0
        }
        
        # Détection des sujets fiscaux
        for topic, patterns in self.tax_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    analysis["tax_topics"].append(topic)
                    analysis["confidence"] += 0.2
        
        # Détection des pays mentionnés
        country_patterns = {
            "france": "FR", "allemagne": "DE", "germany": "DE", "suisse": "CH", 
            "switzerland": "CH", "andorre": "AD", "andorra": "AD", 
            "luxembourg": "LU", "danemark": "DK", "denmark": "DK",
            "hongrie": "HU", "hungary": "HU", "estonie": "EE", "estonia": "EE",
            "italie": "IT", "italy": "IT", "espagne": "ES", "spain": "ES",
            "portugal": "PT", "belgique": "BE", "belgium": "BE",
            "pays-bas": "NL", "netherlands": "NL", "autriche": "AT", "austria": "AT"
        }
        
        for country_name, country_code in country_patterns.items():
            if country_name in query_lower:
                analysis["countries_mentioned"].append(country_code)
                analysis["confidence"] += 0.1
        
        # Détection des montants
        amount_patterns = [
            r'(\d+(?:\s*\d+)*)\s*(?:€|euros?)',
            r'(\d+(?:\s*\d+)*)\s*k€',
            r'(\d+(?:\s*\d+)*)\s*(?:dollars?|\$)',
            r'(\d+(?:\s*\d+)*)\s*(?:chf|francs?)'
        ]
        
        for pattern in amount_patterns:
            matches = re.findall(pattern, query_lower)
            for match in matches:
                amount_str = match.replace(' ', '')
                if 'k€' in query_lower:
                    amount = float(amount_str) * 1000
                else:
                    amount = float(amount_str)
                analysis["amounts_mentioned"].append(amount)
                analysis["confidence"] += 0.1
        
        # Détermination du type de requête principal
        if analysis["tax_topics"]:
            analysis["query_type"] = analysis["tax_topics"][0]
        
        return analysis
    
    def _llm_query_analysis(self, query: str) -> Dict[str, Any]:
        """Analyse intelligente de la requête avec LLM local"""
        
        system_prompt = """Tu es Francis, un expert fiscal européen. Analyse cette question fiscale et extrait les informations clés.

Réponds UNIQUEMENT en JSON avec cette structure exacte :
{
    "query_type": "income_tax|vat|optimization|comparison|social_security|wealth_tax|capital_gains|general",
    "tax_topics": ["liste des sujets fiscaux identifiés"],
    "countries_mentioned": ["codes pays ISO (FR, DE, CH, etc.)"],
    "amounts_mentioned": [montants numériques extraits],
    "confidence": 0.95,
    "intent": "description courte de l'intention"
}

Pays supportés et leurs codes :
- France: FR, Allemagne: DE, Suisse: CH, Andorre: AD, Luxembourg: LU
- Danemark: DK, Hongrie: HU, Estonie: EE, Italie: IT, Espagne: ES
- Portugal: PT, Belgique: BE, Pays-Bas: NL, Autriche: AT

Sois précis dans l'extraction des montants et des pays."""

        prompt = f"Question fiscale à analyser : '{query}'"
        
        llm_response = self.ollama_client.generate_response(prompt, system_prompt)
        
        try:
            # Extraction du JSON de la réponse
            json_start = llm_response.find('{')
            json_end = llm_response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = llm_response[json_start:json_end]
                analysis = json.loads(json_str)
                analysis["llm_used"] = True
                return analysis
        except:
            pass
        
        # Fallback si l'analyse LLM échoue
        return {
            "query_type": "general",
            "tax_topics": [],
            "countries_mentioned": [],
            "amounts_mentioned": [],
            "confidence": 0.3,
            "llm_used": False
        }
    
    def _merge_analyses(self, basic: Dict, llm: Dict) -> Dict[str, Any]:
        """Fusionne les analyses basique et LLM pour plus de précision"""
        
        # Priorité à l'analyse LLM si elle est plus confiante
        if llm.get("confidence", 0) > basic.get("confidence", 0):
            merged = llm.copy()
            # Ajout des éléments manqués par le LLM mais détectés par les patterns
            merged["countries_mentioned"] = list(set(
                merged.get("countries_mentioned", []) + 
                basic.get("countries_mentioned", [])
            ))
            merged["amounts_mentioned"] = list(set(
                merged.get("amounts_mentioned", []) + 
                basic.get("amounts_mentioned", [])
            ))
        else:
            merged = basic.copy()
            # Enrichissement avec les insights du LLM
            if "intent" in llm:
                merged["intent"] = llm["intent"]
        
        merged["analysis_method"] = "hybrid" if llm.get("llm_used") else "basic"
        
        # Ajout de suggestions intelligentes
        if self.config["enable_smart_suggestions"]:
            countries_tuple = tuple(merged.get("countries_mentioned", []))
            merged["smart_suggestions"] = self._get_smart_suggestions(
                merged["query_type"], countries_tuple
            )
        
        return merged
    
    def generate_response(self, query: str, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Génère une réponse fiscale complète et personnalisée avec cache intelligent
        
        Args:
            query: Question de l'utilisateur
            user_profile: Profil utilisateur optionnel
        
        Returns:
            Réponse structurée avec conseils fiscaux
        """
        start_time = time.time()
        
        # Vérification du cache
        cache_key = self._generate_cache_key(query, user_profile)
        if self.config["enable_cache"] and cache_key in self.response_cache:
            cached_entry = self.response_cache[cache_key]
            if self._is_cache_valid(cached_entry["timestamp"]):
                self.analytics["cache_hits"] += 1
                cached_response = cached_entry["response"].copy()
                cached_response["from_cache"] = True
                cached_response["cache_age_seconds"] = int(time.time() - cached_entry["timestamp"])
                return cached_response
            else:
                # Cache expiré, suppression
                del self.response_cache[cache_key]
        
        self.analytics["cache_misses"] += 1
        
        # Analyse de la requête
        analysis = self.analyze_query(query)
        
        # Mise à jour du profil utilisateur avec mémoire contextuelle
        if user_profile:
            self.user_profile.update(user_profile)
        
        # Ajout du contexte de conversation si activé
        if self.config["enable_context_memory"] and self.conversation_history:
            analysis["conversation_context"] = self.conversation_history[-3:]  # 3 derniers échanges
        
        # Génération de la réponse selon le type de requête
        if analysis["query_type"] == "income_tax":
            base_response = self._handle_income_tax_query(query, analysis)
        elif analysis["query_type"] == "comparison":
            base_response = self._handle_comparison_query(query, analysis)
        elif analysis["query_type"] == "optimization":
            base_response = self._handle_optimization_query(query, analysis)
        elif analysis["query_type"] == "vat":
            base_response = self._handle_vat_query(query, analysis)
        elif analysis["query_type"] == "inheritance_tax":
            base_response = self._handle_inheritance_tax_query(query, analysis)
        elif analysis["query_type"] == "business_tax":
            base_response = self._handle_business_tax_query(query, analysis)
        else:
            base_response = self._handle_general_query(query, analysis)
        
        # Enrichissement avec LLM local si disponible
        if self.ollama_client.is_available() and analysis.get("analysis_method") == "hybrid":
            base_response = self._enrich_response_with_llm(query, base_response, analysis)
        
        # Ajout des suggestions intelligentes
        if "smart_suggestions" in analysis:
            base_response["smart_suggestions"] = analysis["smart_suggestions"]
        
        # Limitation de la longueur de réponse
        if len(base_response.get("response", "")) > self.config["max_response_length"]:
            base_response["response"] = base_response["response"][:self.config["max_response_length"]] + "\n\n*[Réponse tronquée pour optimiser la performance]*"
            base_response["truncated"] = True
        
        # Mise en cache de la réponse
        if self.config["enable_cache"]:
            self.response_cache[cache_key] = {
                "response": base_response.copy(),
                "timestamp": time.time()
            }
            
            # Nettoyage du cache si trop volumineux
            if len(self.response_cache) > 500:
                oldest_keys = sorted(
                    self.response_cache.keys(),
                    key=lambda k: self.response_cache[k]["timestamp"]
                )[:100]
                for key in oldest_keys:
                    del self.response_cache[key]
        
        # Mise à jour des analytics
        response_time = time.time() - start_time
        self._update_analytics(query, analysis, response_time)
        
        # Ajout à l'historique de conversation
        if self.config["enable_context_memory"]:
            self.conversation_history.append({
                "query": query,
                "response_type": base_response.get("type", "unknown"),
                "timestamp": time.time(),
                "analysis": analysis
            })
            
            # Limitation de l'historique
            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]
        
        # Métadonnées de performance
        base_response["performance"] = {
            "response_time_ms": round(response_time * 1000, 2),
            "from_cache": False,
            "analysis_method": analysis.get("analysis_method", "basic"),
            "llm_enriched": base_response.get("enriched_by_llm", False)
        }
        
        return base_response
    
    def _enrich_response_with_llm(self, query: str, base_response: Dict, analysis: Dict) -> Dict[str, Any]:
        """Enrichit la réponse avec des explications personnalisées du LLM local"""
        
        system_prompt = """Tu es Francis, expert fiscal européen. Tu dois enrichir une réponse fiscale technique avec des explications claires et personnalisées.

RÈGLES IMPORTANTES :
- Garde TOUJOURS les calculs et données factuelles existants
- Ajoute des explications pédagogiques et du contexte
- Personnalise selon la situation de l'utilisateur
- Utilise un ton professionnel mais accessible
- Ajoute des conseils pratiques pertinents
- Reste factuel et précis

Réponds en markdown avec la structure existante enrichie."""

        prompt = f"""
Question originale : "{query}"
Type de requête : {analysis.get('query_type', 'general')}
Intention : {analysis.get('intent', 'Non définie')}

Réponse technique actuelle :
{base_response.get('response', '')}

Enrichis cette réponse avec :
1. Une introduction personnalisée
2. Des explications claires des concepts fiscaux
3. Des conseils pratiques adaptés
4. Une conclusion avec prochaines étapes recommandées

Garde TOUS les calculs, tableaux et données existants.
"""
        
        enriched_text = self.ollama_client.generate_response(prompt, system_prompt)
        
        if enriched_text and len(enriched_text) > 100:
            base_response["response"] = enriched_text
            base_response["enriched_by_llm"] = True
        else:
            base_response["enriched_by_llm"] = False
        
        return base_response
    
    def _handle_income_tax_query(self, query: str, analysis: Dict) -> Dict[str, Any]:
        """Traite les questions sur l'impôt sur le revenu"""
        
        # Extraction des paramètres
        income = analysis["amounts_mentioned"][0] if analysis["amounts_mentioned"] else 50000
        country = analysis["countries_mentioned"][0] if analysis["countries_mentioned"] else "FR"
        
        # Calcul de l'impôt
        tax_calculation = self.knowledge_base.calculate_income_tax(country, income)
        
        # Génération de la réponse
        response = f"""
## 💰 Calcul de l'impôt sur le revenu - {tax_calculation['country']}

**Revenus analysés :** {income:,.0f} {tax_calculation['currency']}

### 📊 Résultat du calcul :
- **Impôt sur le revenu :** {tax_calculation['income_tax']:,.0f} {tax_calculation['currency']}
- **Cotisations sociales :** {tax_calculation['social_security']:,.0f} {tax_calculation['currency']}
- **Total des prélèvements :** {tax_calculation['total_tax']:,.0f} {tax_calculation['currency']}
- **Revenu net :** {tax_calculation['net_income']:,.0f} {tax_calculation['currency']}

### 📈 Taux d'imposition :
- **Taux effectif :** {tax_calculation['effective_rate']}%
- **Taux marginal :** {tax_calculation['marginal_rate']}%

### 🔍 Détail par tranches :
"""
        
        for bracket in tax_calculation['tax_breakdown']:
            response += f"- **{bracket['bracket']} {tax_calculation['currency']}** à {bracket['rate']} : {bracket['tax_amount']:,.0f} {tax_calculation['currency']}\n"
        
        # Conseils personnalisés
        if tax_calculation['effective_rate'] > 30:
            response += f"""
### 💡 Conseils d'optimisation :
- Votre taux effectif de {tax_calculation['effective_rate']}% est élevé
- Considérez les dispositifs de défiscalisation disponibles
- Une optimisation internationale pourrait être bénéfique
"""
        
        return {
            "response": response,
            "calculation": tax_calculation,
            "type": "income_tax_calculation",
            "confidence": 0.95
        }
    
    def _handle_comparison_query(self, query: str, analysis: Dict) -> Dict[str, Any]:
        """Traite les questions de comparaison entre pays"""
        
        income = analysis["amounts_mentioned"][0] if analysis["amounts_mentioned"] else 75000
        countries = analysis["countries_mentioned"] if analysis["countries_mentioned"] else ["FR", "DE", "CH", "AD", "LU"]
        
        # Comparaison entre pays
        comparison = self.knowledge_base.compare_countries(income, countries)
        
        response = f"""
## 🌍 Comparaison fiscale européenne

**Revenus comparés :** {income:,.0f} €

### 🏆 Classement par charge fiscale totale :
"""
        
        rank = 1
        for country_code, data in comparison["countries_comparison"].items():
            flag = self._get_country_flag(country_code)
            response += f"{rank}. {flag} **{data['country']}** : {data['total_tax']:,.0f} {data['currency']} ({data['effective_rate']}%)\n"
            rank += 1
        
        if comparison["tax_savings"] > 0:
            response += f"""
### 💰 Économie potentielle :
En déménageant de {comparison["countries_comparison"][comparison["worst_country"]]["country"]} vers {comparison["countries_comparison"][comparison["best_country"]]["country"]}, vous pourriez économiser **{comparison["tax_savings"]:,.0f} €** par an !

### 🎯 Pays recommandé : {comparison["countries_comparison"][comparison["best_country"]]["country"]}
- Charge fiscale totale : {comparison["countries_comparison"][comparison["best_country"]]["total_tax"]:,.0f} €
- Taux effectif : {comparison["countries_comparison"][comparison["best_country"]]["effective_rate"]}%
"""
        
        return {
            "response": response,
            "comparison": comparison,
            "type": "country_comparison",
            "confidence": 0.9
        }
    
    def _handle_optimization_query(self, query: str, analysis: Dict) -> Dict[str, Any]:
        """Traite les questions d'optimisation fiscale"""
        
        # Profil par défaut ou utilisateur
        profile = self.user_profile or {
            "annual_income": analysis["amounts_mentioned"][0] if analysis["amounts_mentioned"] else 80000,
            "country": analysis["countries_mentioned"][0] if analysis["countries_mentioned"] else "FR",
            "objectives": ["reduce_tax", "optimize_wealth"]
        }
        
        advice = self.knowledge_base.get_tax_optimization_advice(profile)
        
        response = f"""
## 🎯 Conseils d'optimisation fiscale personnalisés

### 📊 Votre situation actuelle :
- **Pays :** {advice['current_situation']['country']}
- **Revenus :** {profile['annual_income']:,.0f} €
- **Charge fiscale :** {advice['current_situation']['total_tax']:,.0f} € ({advice['current_situation']['effective_rate']}%)

### 💡 Stratégies recommandées :
"""
        
        for i, strategy in enumerate(advice['tax_strategies'], 1):
            response += f"{i}. {strategy}\n"
        
        if advice['recommended_countries']:
            response += f"""
### 🌍 Pays avantageux pour votre profil :
"""
            for country in advice['recommended_countries']:
                flag = self._get_country_flag(country['country'])
                response += f"""
**{flag} {self.knowledge_base.countries_data[country['country']].country_name}**
- Économie annuelle : {country['tax_savings']:,.0f} €
- Taux effectif : {country['effective_rate']}%
- Avantages : {', '.join(country['advantages'][:2])}
"""
        
        return {
            "response": response,
            "advice": advice,
            "type": "tax_optimization",
            "confidence": 0.85
        }
    
    def _handle_vat_query(self, query: str, analysis: Dict) -> Dict[str, Any]:
        """Traite les questions sur la TVA"""
        
        countries = analysis["countries_mentioned"] if analysis["countries_mentioned"] else ["FR", "DE", "CH", "AD", "LU"]
        
        response = """
## 🧾 Taux de TVA en Europe

### 📊 Comparaison des taux standard :
"""
        
        vat_data = []
        for country_code in countries:
            if country_code in self.knowledge_base.countries_data:
                country_data = self.knowledge_base.countries_data[country_code]
                flag = self._get_country_flag(country_code)
                response += f"- {flag} **{country_data.country_name}** : {country_data.vat_standard_rate}%"
                if country_data.vat_reduced_rates:
                    response += f" (taux réduits : {', '.join(map(str, country_data.vat_reduced_rates))}%)"
                response += "\n"
                
                vat_data.append({
                    "country": country_data.country_name,
                    "standard_rate": country_data.vat_standard_rate,
                    "reduced_rates": country_data.vat_reduced_rates
                })
        
        # Tri par taux croissant
        vat_data.sort(key=lambda x: x["standard_rate"])
        
        if vat_data:
            response += f"""
### 🏆 Pays avec la TVA la plus avantageuse :
**{vat_data[0]['country']}** avec {vat_data[0]['standard_rate']}%

### ⚠️ Pays avec la TVA la plus élevée :
**{vat_data[-1]['country']}** avec {vat_data[-1]['standard_rate']}%
"""
        
        return {
            "response": response,
            "vat_data": vat_data,
            "type": "vat_information",
            "confidence": 0.8
        }
    
    def _handle_general_query(self, query: str, analysis: Dict) -> Dict[str, Any]:
        """Traite les questions générales"""
        
        # Recherche dans la base de connaissance
        search_results = self.knowledge_base.search_tax_knowledge(query)
        
        response = f"""
## 🔍 Recherche fiscale européenne

**Votre question :** {query}

### 📚 Informations trouvées :
"""
        
        for i, result in enumerate(search_results[:5], 1):
            flag = self._get_country_flag(result.get("country_code", ""))
            response += f"{i}. {flag} **{result['country']}** : {result['content']}\n"
        
        if not search_results:
            response += """
Aucun résultat spécifique trouvé. Voici quelques suggestions :
- Précisez votre situation (revenus, pays de résidence)
- Mentionnez le type d'impôt qui vous intéresse
- Indiquez vos objectifs d'optimisation fiscale
"""
        
        return {
            "response": response,
            "search_results": search_results,
            "type": "general_search",
            "confidence": 0.6
        }
    
    def _handle_inheritance_tax_query(self, query: str, analysis: Dict) -> Dict[str, Any]:
        """Traite les questions sur les droits de succession et donations"""
        
        countries = analysis["countries_mentioned"] if analysis["countries_mentioned"] else ["FR", "DE", "CH", "AD", "LU"]
        amounts = analysis["amounts_mentioned"]
        inheritance_amount = amounts[0] if amounts else 500000
        
        response = f"""
## 🏛️ Droits de succession et donations en Europe

**Patrimoine analysé :** {inheritance_amount:,.0f} €

### 📊 Comparaison européenne des droits de succession :
"""
        
        inheritance_data = []
        for country_code in countries:
            if country_code in self.knowledge_base.countries_data:
                country_data = self.knowledge_base.countries_data[country_code]
                flag = self._get_country_flag(country_code)
                
                # Calcul simplifié des droits de succession (à améliorer avec données réelles)
                if country_code == "FR":
                    tax_rate = 20 if inheritance_amount < 100000 else 40
                elif country_code == "DE":
                    tax_rate = 15 if inheritance_amount < 200000 else 30
                elif country_code == "CH":
                    tax_rate = 5  # Très avantageux
                elif country_code == "AD":
                    tax_rate = 0  # Pas de droits de succession
                else:
                    tax_rate = 25  # Moyenne européenne
                
                tax_amount = inheritance_amount * (tax_rate / 100)
                
                response += f"- {flag} **{country_data.country_name}** : {tax_rate}% = {tax_amount:,.0f} €\n"
                
                inheritance_data.append({
                    "country": country_data.country_name,
                    "country_code": country_code,
                    "tax_rate": tax_rate,
                    "tax_amount": tax_amount
                })
        
        # Tri par montant croissant
        inheritance_data.sort(key=lambda x: x["tax_amount"])
        
        if inheritance_data:
            best_country = inheritance_data[0]
            worst_country = inheritance_data[-1]
            
            response += f"""

### 🏆 Pays le plus avantageux :
**{best_country['country']}** avec {best_country['tax_rate']}% ({best_country['tax_amount']:,.0f} €)

### ⚠️ Pays le moins avantageux :
**{worst_country['country']}** avec {worst_country['tax_rate']}% ({worst_country['tax_amount']:,.0f} €)

### 💰 Économie potentielle :
**{worst_country['tax_amount'] - best_country['tax_amount']:,.0f} €** en choisissant {best_country['country']}

### 💡 Conseils stratégiques :
- Considérez la résidence fiscale du défunt
- Explorez les conventions fiscales bilatérales
- Anticipez avec des donations du vivant
- Consultez les abattements familiaux disponibles
"""
        
        return {
            "response": response,
            "inheritance_data": inheritance_data,
            "type": "inheritance_tax_analysis",
            "confidence": 0.8
        }
    
    def _handle_business_tax_query(self, query: str, analysis: Dict) -> Dict[str, Any]:
        """Traite les questions sur la fiscalité des entreprises"""
        
        countries = analysis["countries_mentioned"] if analysis["countries_mentioned"] else ["FR", "DE", "CH", "AD", "LU"]
        amounts = analysis["amounts_mentioned"]
        business_income = amounts[0] if amounts else 100000
        
        response = f"""
## 🏢 Fiscalité des entreprises en Europe

**Bénéfices analysés :** {business_income:,.0f} €

### 📊 Taux d'impôt sur les sociétés :
"""
        
        business_data = []
        for country_code in countries:
            if country_code in self.knowledge_base.countries_data:
                country_data = self.knowledge_base.countries_data[country_code]
                flag = self._get_country_flag(country_code)
                
                # Taux d'IS réels 2024
                corporate_rates = {
                    "FR": 25, "DE": 30, "CH": 14.9, "AD": 10, "LU": 24.94,
                    "DK": 22, "HU": 9, "EE": 20, "IT": 24, "ES": 25,
                    "PT": 21, "BE": 25, "NL": 25.8, "AT": 23
                }
                
                corporate_tax_rate = corporate_rates.get(country_code, 25)
                corporate_tax = business_income * (corporate_tax_rate / 100)
                net_income = business_income - corporate_tax
                
                response += f"- {flag} **{country_data.country_name}** : {corporate_tax_rate}% = {corporate_tax:,.0f} € (net: {net_income:,.0f} €)\n"
                
                business_data.append({
                    "country": country_data.country_name,
                    "country_code": country_code,
                    "corporate_tax_rate": corporate_tax_rate,
                    "corporate_tax": corporate_tax,
                    "net_income": net_income
                })
        
        # Tri par taux croissant
        business_data.sort(key=lambda x: x["corporate_tax_rate"])
        
        if business_data:
            best_country = business_data[0]
            worst_country = business_data[-1]
            
            response += f"""

### 🏆 Pays le plus compétitif :
**{best_country['country']}** avec {best_country['corporate_tax_rate']}%

### 📈 Économie d'impôt potentielle :
**{worst_country['corporate_tax'] - best_country['corporate_tax']:,.0f} €** par an

### 🎯 Avantages fiscaux spécifiques :
"""
            
            # Avantages spécifiques par pays
            advantages = {
                "HU": "Taux le plus bas d'Europe (9%)",
                "AD": "Régime fiscal très avantageux, pas de TVA",
                "CH": "Stabilité fiscale, cantons compétitifs",
                "LU": "Holding luxembourgeoise, IP Box",
                "EE": "Pas d'impôt sur bénéfices non distribués"
            }
            
            for country_data in business_data[:3]:
                country_code = country_data["country_code"]
                if country_code in advantages:
                    response += f"- **{country_data['country']}** : {advantages[country_code]}\n"
        
        return {
            "response": response,
            "business_data": business_data,
            "type": "business_tax_analysis",
            "confidence": 0.85
        }
    
    def _get_country_flag(self, country_code: str) -> str:
        """Retourne le drapeau emoji du pays"""
        flags = {
            "FR": "🇫🇷", "DE": "🇩🇪", "CH": "🇨🇭", "AD": "🇦🇩", "LU": "🇱🇺",
            "DK": "🇩🇰", "HU": "🇭🇺", "EE": "🇪🇪", "IT": "🇮🇹", "ES": "🇪🇸",
            "PT": "🇵🇹", "BE": "🇧🇪", "NL": "🇳🇱", "AT": "🇦🇹", "SE": "🇸🇪",
            "FI": "🇫🇮", "NO": "🇳🇴", "IE": "🇮🇪", "PL": "🇵🇱", "CZ": "🇨🇿"
        }
        return flags.get(country_code, "🏳️")
    
    async def generate_response_stream(self, query: str, user_profile: Optional[Dict] = None) -> AsyncGenerator[str, None]:
        """Génère une réponse en streaming pour l'interface utilisateur"""
        
        # Analyse initiale
        yield json.dumps({"type": "analysis", "status": "Analyse de votre question..."}) + "\n"
        await asyncio.sleep(0.1)
        
        analysis = self.analyze_query(query)
        
        yield json.dumps({"type": "analysis", "status": f"Question identifiée : {analysis['query_type']}"}) + "\n"
        await asyncio.sleep(0.1)
        
        # Génération de la réponse
        yield json.dumps({"type": "processing", "status": "Calcul des données fiscales..."}) + "\n"
        await asyncio.sleep(0.2)
        
        response_data = self.generate_response(query, user_profile)
        
        yield json.dumps({"type": "response", "data": response_data}) + "\n"
    
    def clear_cache(self):
        """Vide le cache de réponses"""
        with self._lock:
            self.response_cache.clear()
            print("Cache vidé avec succès")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Retourne les statistiques du cache"""
        with self._lock:
            return {
                "cache_size": len(self.response_cache),
                "cache_hit_rate": (
                    self.analytics["cache_hits"] / 
                    (self.analytics["cache_hits"] + self.analytics["cache_misses"]) * 100
                    if (self.analytics["cache_hits"] + self.analytics["cache_misses"]) > 0 else 0
                ),
                "oldest_entry_age": (
                    time.time() - min([entry["timestamp"] for entry in self.response_cache.values()])
                    if self.response_cache else 0
                )
            }
    
    def update_config(self, new_config: Dict[str, Any]):
        """Met à jour la configuration de Francis"""
        with self._lock:
            self.config.update(new_config)
            print(f"Configuration mise à jour : {new_config}")
    
    def get_conversation_summary(self) -> Dict[str, Any]:
        """Retourne un résumé de la conversation actuelle"""
        if not self.conversation_history:
            return {"status": "no_conversation"}
        
        query_types = defaultdict(int)
        countries_discussed = defaultdict(int)
        
        for entry in self.conversation_history:
            analysis = entry.get("analysis", {})
            query_types[analysis.get("query_type", "unknown")] += 1
            for country in analysis.get("countries_mentioned", []):
                countries_discussed[country] += 1
        
        return {
            "total_exchanges": len(self.conversation_history),
            "duration_minutes": (
                (self.conversation_history[-1]["timestamp"] - self.conversation_history[0]["timestamp"]) / 60
                if len(self.conversation_history) > 1 else 0
            ),
            "main_topics": dict(sorted(query_types.items(), key=lambda x: x[1], reverse=True)),
            "countries_discussed": dict(sorted(countries_discussed.items(), key=lambda x: x[1], reverse=True)),
            "last_query_time": datetime.fromtimestamp(self.conversation_history[-1]["timestamp"]).isoformat()
        }
    
    def export_conversation(self) -> str:
        """Exporte la conversation au format JSON"""
        export_data = {
            "export_timestamp": datetime.now().isoformat(),
            "conversation_summary": self.get_conversation_summary(),
            "analytics_summary": self.get_analytics_summary(),
            "conversation_history": self.conversation_history,
            "user_profile": self.user_profile,
            "config": self.config
        }
        return json.dumps(export_data, indent=2, ensure_ascii=False)
    
    def get_supported_countries(self) -> List[Dict[str, str]]:
        """Retourne la liste des pays supportés"""
        countries = []
        for code, data in self.knowledge_base.countries_data.items():
            countries.append({
                "code": code,
                "name": data.country_name,
                "flag": self._get_country_flag(code),
                "currency": data.currency,
                "eu_member": data.eu_member
            })
        return sorted(countries, key=lambda x: x["name"])
    
    def get_health_status(self) -> Dict[str, Any]:
        """Retourne l'état de santé complet du système"""
        ollama_available = self.ollama_client.is_available()
        
        return {
            "status": "healthy" if ollama_available else "degraded",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "knowledge_base": {
                    "status": "operational",
                    "countries_supported": len(self.knowledge_base.countries_data),
                    "last_updated": "2024-01-01"  # À mettre à jour dynamiquement
                },
                "ollama_llm": {
                    "status": "available" if ollama_available else "unavailable",
                    "performance": self.ollama_client.get_performance_stats()
                },
                "cache_system": {
                    "status": "operational",
                    "stats": self.get_cache_stats()
                },
                "analytics": {
                    "status": "operational",
                    "summary": self.get_analytics_summary()
                }
            },
            "capabilities": {
                "tax_calculation": True,
                "country_comparison": True,
                "optimization_advice": True,
                "inheritance_planning": True,
                "business_taxation": True,
                "intelligent_analysis": ollama_available,
                "response_enrichment": ollama_available,
                "conversation_memory": self.config["enable_context_memory"],
                "smart_caching": self.config["enable_cache"]
            }
        }

# Instance globale de Francis Particulier Indépendant AMÉLIORÉ
francis_particulier = FrancisParticulierIndependent()

# Configuration par défaut optimisée
francis_particulier.update_config({
    "enable_cache": True,
    "enable_analytics": True,
    "enable_smart_suggestions": True,
    "enable_context_memory": True,
    "max_response_length": 4000,
    "response_quality_threshold": 0.85
})

def get_francis_particulier_response(query: str, user_profile: Optional[Dict] = None) -> str:
    """
    Point d'entrée principal pour Francis Particulier
    
    Args:
        query: Question de l'utilisateur
        user_profile: Profil utilisateur optionnel
    
    Returns:
        Réponse fiscale formatée en markdown
    """
    try:
        response_data = francis_particulier.generate_response(query, user_profile)
        return response_data["response"]
    except Exception as e:
        return f"""
## ❌ Erreur dans le traitement de votre question

Une erreur s'est produite : {str(e)}

### 💡 Suggestions :
- Reformulez votre question
- Précisez votre situation fiscale
- Mentionnez le pays qui vous intéresse

**Francis Particulier reste à votre disposition pour toute question fiscale européenne !**
"""

# Fonction utilitaire pour les tests de performance
def run_performance_test(francis_instance, num_queries: int = 10):
    """Exécute un test de performance avec plusieurs requêtes"""
    test_queries = [
        "Combien d'impôt avec 50000€ en France ?",
        "Meilleur pays pour 100000€ ?",
        "Comment optimiser mes impôts ?",
        "Taux de TVA en Europe ?",
        "Droits de succession en Suisse ?",
        "Impôt société en Andorre ?",
        "Comparaison fiscale France Allemagne ?",
        "Optimisation patrimoine 500000€ ?",
        "Résidence fiscale avantageuse ?",
        "Calcul charges sociales indépendant ?"
    ]
    
    print(f"\n🚀 Test de performance avec {num_queries} requêtes...")
    start_time = time.time()
    
    for i in range(num_queries):
        query = test_queries[i % len(test_queries)]
        response = francis_instance.generate_response(query)
        print(f"  {i+1}/{num_queries} - {response.get('performance', {}).get('response_time_ms', 0)}ms")
    
    total_time = time.time() - start_time
    analytics = francis_instance.get_analytics_summary()
    
    print(f"\n📊 Résultats du test de performance:")
    print(f"  Temps total: {total_time:.2f}s")
    print(f"  Temps moyen par requête: {analytics['avg_response_time_ms']}ms")
    print(f"  Taux de cache hit: {analytics['cache_hit_rate']:.1f}%")
    print(f"  Requêtes traitées: {analytics['total_queries']}")

if __name__ == "__main__":
    # Tests de Francis Particulier Indépendant AMÉLIORÉ
    print("=== FRANCIS PARTICULIER INDÉPENDANT AMÉLIORÉ - TESTS ===")
    
    # Test 1: Calcul d'impôt
    print("\n1. Test calcul d'impôt:")
    response1 = get_francis_particulier_response("Combien d'impôt je paie avec 85000€ en France ?")
    print(response1[:200] + "...")
    
    # Test 2: Comparaison
    print("\n2. Test comparaison:")
    response2 = get_francis_particulier_response("Quel est le meilleur pays pour 100000€ de revenus ?")
    print(response2[:200] + "...")
    
    # Test 3: Optimisation
    print("\n3. Test optimisation:")
    profile = {"annual_income": 120000, "country": "FR"}
    response3 = get_francis_particulier_response("Comment optimiser mes impôts ?", profile)
    print(response3[:200] + "...")
    
    # Test 4: TVA
    print("\n4. Test TVA:")
    response4 = get_francis_particulier_response("Quels sont les taux de TVA en Europe ?")
    print(response4[:200] + "...")
    
    # Test de performance
    run_performance_test(francis_particulier, 5)
    
    print("\n✅ Francis Particulier Indépendant AMÉLIORÉ opérationnel !")
    print(f"📊 Pays supportés : {len(francis_particulier.get_supported_countries())}")
    
    # Test 5: Analytics et monitoring
    print("\n5. Test analytics:")
    analytics = francis_particulier.get_analytics_summary()
    print(f"Requêtes traitées: {analytics['total_queries']}")
    print(f"Temps de réponse moyen: {analytics['avg_response_time_ms']}ms")
    
    # Test 6: Health check
    print("\n6. Test health check:")
    health = francis_particulier.get_health_status()
    print(f"Statut: {health['status']}")
    print(f"Ollama disponible: {health['components']['ollama_llm']['status']}")
    
    print("\n🚀 Francis Particulier Indépendant AMÉLIORÉ opérationnel !")
    print("\n✨ Nouvelles fonctionnalités:")
    print("- Cache intelligent avec TTL")
    print("- Analytics et métriques avancées")
    print("- Suggestions contextuelles")
    print("- Mémoire conversationnelle")
    print("- Monitoring de performance")
    print("- Support taxes succession/entreprise")
    print("- Optimisation LLM avec post-traitement")
    print("- Export de conversation")
    print("- Configuration dynamique")
