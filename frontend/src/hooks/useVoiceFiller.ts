import { useState, useCallback } from 'react';
import { ClientProfile } from '../types/ClientProfile';

export function useVoiceFiller(initialProfile: Partial<ClientProfile>) {
  const [profile, setProfile] = useState<Partial<ClientProfile>>(initialProfile);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  
  const MAX_CONTEXT_TURNS = 3; // Garde les 3 dernières phrases

  /**
   * 🚀 FRANCIS IA - SYSTÈME D'EXTRACTION SÉMANTIQUE ULTRA-AVANCÉ
   * Comprendrai TOUT avec l'IA contextuelle multi-tour !
   */

  const computeSuggestions = useCallback((currentProfile: Partial<ClientProfile>): string[] => {
    const suggestions: string[] = [];
    
    if (!currentProfile.nom_client) suggestions.push("Demandez le nom de famille");
    if (!currentProfile.prenom_client) suggestions.push("Demandez le prénom");
    if (!currentProfile.situation_maritale_client) suggestions.push("Demandez la situation maritale");
    if (!currentProfile.revenu_net_annuel_client1) suggestions.push("Demandez les revenus annuels");
    
    return suggestions;
  }, []);

  /**
   * 🤖 FRANCIS IA SÉMANTIQUE - ANALYSE CONTEXTUELLE MULTI-TOUR
   * Utilise l'historique des conversations pour une compréhension parfaite
   */
  const analyzeWithFrancisAI = useCallback(async (text: string, history: string[]): Promise<Partial<ClientProfile>> => {
    try {
      const contextWithHistory = history.length > 0 
        ? history.join(' | ') + ' | ' + text
        : text;
      
      console.log('🧠 Francis IA analyse avec contexte:', {
        currentText: text,
        history: history,
        fullContext: contextWithHistory
      });
      
      const response = await fetch('/api/test-francis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `🧠 FRANCIS - EXPERT CONTEXTUEL MULTI-TOUR ULTRA-POINTU
          
          MISSION: Analyser cette conversation avec CONTEXTE COMPLET pour extraction parfaite.
          
          CONTEXTE CONVERSATIONNEL: "${contextWithHistory}"
          PHRASE ACTUELLE: "${text}"
          
          🚀 INTELLIGENCE CONTEXTUELLE RÉVOLUTIONNAIRE:
          ✅ ANALYSE NARRATIVE: comprend le fil de l'entretien sur plusieurs phrases
          ✅ RECONSTITUTION: "Je suis..." + "euh..." + "Jean Dupont" = extraction complète
          ✅ MÉMOIRE CONVERSATIONNELLE: utilise l'historique pour disambiguïser
          ✅ CORRECTION CONTEXTUELLE: corrige avec l'aide du contexte précédent
          
          🧠 INTELLIGENCE MAXIMALE REQUISE:
          Tu es le MEILLEUR LINGUISTE CONTEXTUEL au monde ! Ton travail est de comprendre
          les conversations humaines même quand elles sont hésitantes, mal articulées,
          coupées, avec des "euh", des répétitions, des corrections, etc.
          
          🚫 REJETTE ABSOLUMENT:
          - Interjections: euh, ah, oh, hein, bon, alors, voilà, ben
          - Questions: c'est quoi, comment, pourquoi, qu'est-ce que
          - Temporel: jour, heure, maintenant, aujourd'hui
          - Non-sens: aberrant, bizarre, wtf, expressions émotionnelles
          - Hésitations pures sans contenu informatif
          
          🎯 CHAMPS AUTORISÉS:
          - nom_client: NOMS DE FAMILLE français (même déformés phonétiquement)
          - prenom_client: PRÉNOMS français (même mal articulés)
          - situation_maritale_client: "Marié(e)", "Célibataire", "Divorcé(e)", "Pacsé(e)", "Veuf/Veuve"
          - revenu_net_annuel_client1: chiffres + mots revenus/salaire/euros
          - nombre_enfants_client: chiffres + mots enfant/gosse/petit
          - age_client: chiffres + ans/âge
          - profession_client: métiers/jobs (pas générique comme "travail")
          
          📝 EXEMPLES OBLIGATOIRES - APPRENDS CES PATTERNS :
          
          💒 STATUT MATRIMONIAL :
          "vous êtes mariés" → {"situation_maritale_client": "Marié(e)"}
          "nous sommes mariés" → {"situation_maritale_client": "Marié(e)"}
          "je suis marié" → {"situation_maritale_client": "Marié(e)"}
          "mariée depuis" → {"situation_maritale_client": "Marié(e)"}
          "célibataire" → {"situation_maritale_client": "Célibataire"}
          "divorcé" → {"situation_maritale_client": "Divorcé(e)"}
          "pacsé" → {"situation_maritale_client": "Pacsé(e)"}
          
          💼 NOMS :
          Contexte: "Je suis... euh... comment dire" | Actuel: "Jean Dupont"
          → {"prenom_client": "Jean", "nom_client": "DUPONT"}
          
          FORMAT RÉPONSE: JSON pur seulement - PAS DE TEXTE EN PLUS
          SI AUCUNE INFO FISCALE VALIDE: {}
          
          SOIS LE MEILLEUR LINGUISTE CONTEXTUEL AU MONDE ! 🔥`
        })
      });

      let extractedData: Partial<ClientProfile> = {};
      
      if (response.ok) {
        const result = await response.text();
        console.log('🤖 Francis IA réponse brute:', result);
        
        try {
          const jsonMatch = result.match(/\{[^{}]*\}/);
          if (jsonMatch) {
            extractedData = JSON.parse(jsonMatch[0]);
            console.log('🎯 Francis IA extraction réussie:', extractedData);
          }
        } catch (e) {
          console.log('🤖 Francis IA: Pas de JSON valide dans la réponse');
        }
      } else {
        console.error('Erreur API Francis:', response.status);
      }
      
      return extractedData;
    } catch (error) {
      console.error('Erreur Francis IA:', error);
      return {};
    }
  }, []);

  /**
   * Traitement d'un snippet de transcript - VERSION CONTEXTUELLE MULTI-TOUR
   */
  const handleTranscript = useCallback(
    async (text: string) => {
      if (!text) return;
      
      // 🧠 GESTION MÉMOIRE CONVERSATIONNELLE
      const updatedHistory = [...conversationHistory];
      
      // Ajouter la nouvelle phrase et garder seulement les N dernières
      updatedHistory.push(text);
      if (updatedHistory.length > MAX_CONTEXT_TURNS) {
        updatedHistory.shift(); // Supprimer la plus ancienne
      }
      
      // Mettre à jour l'historique
      setConversationHistory(updatedHistory);
      
      console.log('🧠 Francis IA analyse CONTEXTUELLE:', {
        currentText: text,
        conversationHistory: updatedHistory,
        contextDepth: updatedHistory.length
      });
      
      let updated: Partial<ClientProfile> = { ...profile };
      let matched = false;
      let matchDetails: string[] = [];

      try {
        // 🧠 PHASE RÉVOLUTIONNAIRE: ANALYSE CONTEXTUELLE MULTI-TOUR
        const aiExtractedData = await analyzeWithFrancisAI(text, updatedHistory);
        
        // Appliquer les données extraites par l'IA
        Object.entries(aiExtractedData).forEach(([key, value]) => {
          if (value && typeof value === 'string' && value.trim() !== '') {
            const cleanValue = value.trim();
            // Validation finale de sécurité
            if (cleanValue.length >= 2 && cleanValue.length <= 50) {
              (updated as any)[key] = cleanValue;
              matched = true;
              matchDetails.push(`🤖 IA ${key}: ${cleanValue}`);
              console.log(`🤖 Francis IA a trouvé ${key}:`, cleanValue);
            }
          }
        });

        if (matched) {
          console.log('🎯 Francis IA CONTEXTUELLE met à jour le profil:', matchDetails);
          setProfile(updated);
          setSuggestions(computeSuggestions(updated));
        } else {
          console.log('🧠 Francis IA CONTEXTUELLE: Aucune information fiscale pertinente détectée dans ce contexte');
        }
      } catch (e) {
        console.error('Erreur Francis IA CONTEXTUELLE:', e);
      }
    },
    [profile, computeSuggestions, analyzeWithFrancisAI, conversationHistory, setConversationHistory, MAX_CONTEXT_TURNS]
  );

  return { profile, suggestions, handleTranscript };
}
