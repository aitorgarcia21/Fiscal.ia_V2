import { useState, useCallback } from 'react';
import { ClientProfile } from '../types/clientProfile';

/**
 * useVoiceFiller
 * ---------------
 * Consomme les transcriptions vocales en français (phrase par phrase) et tente d'extraire
 * les entités pertinentes pour compléter un objet ClientProfile.
 *
 * - Une logique basique par RegExp gère les entités les plus courantes (nom, revenu, enfants, etc.)
 * - Un système de "suggestions" liste les champs encore manquants ou détectés incohérents.
 * - Un fallback (optionnel) peut appeler une API /ai/extract pour un parsing plus avancé.
 *
 * @param initialProfile Profil de départ (éventuellement vide)
 * @returns { profile, suggestions, handleTranscript }
 */
export function useVoiceFiller(initialProfile: Partial<ClientProfile> = {}) {
  const [profile, setProfile] = useState<Partial<ClientProfile>>(initialProfile);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  /**
   * RegEx helpers
   */
  const regexps: Array<{ key: keyof ClientProfile; pattern: RegExp; transform?: (m: RegExpMatchArray) => string | number }> = [
    { key: 'nom_client', pattern: /(?:je m'?appelle|nom est)\s+([A-ZÉÈÀÂÇÎÔÛÏÜËÖ][a-zA-ZÀ-ÖØ-öø-ÿ' -]{2,})/i, transform: m => m[1].toUpperCase() },
    { key: 'prenom_client', pattern: /(?:je m'?appelle|prénom est)\s+[A-ZÉÈÀÂÇÎÔÛÏÜËÖ][a-zà-öø-ÿ' -]+\s+([A-ZÉÈÀÂÇÎÔÛÏÜËÖ][a-zà-öø-ÿ' -]+)/i, transform: m => m[1] },
    { key: 'numero_fiscal_client', pattern: /(num(éro)?\s*fiscal|n°\s*fiscal)\s*(?:est\s*)?(\d{7,13})/i, transform: m => m[3] },
    { key: 'revenu_net_annuel_client1', pattern: /(revenu\s+net\s+annuel|salaire\s+annuel)\s*(?:de|:)?\s*(\d+[\s\u00A0]?\d*(?:[.,]\d{1,2})?)/i, transform: m => m[2].replace(/\s|\u00A0/g, '') },
    { key: 'nombre_enfants_a_charge_client', pattern: /(\d+)\s+(?:enfant|enfants)\s+à\s+charge?/i, transform: m => parseInt(m[1], 10) },
    { key: 'situation_maritale_client', pattern: /(célibataire|marié\w*|pacsé\w*|divorcé\w*|veuf|séparé)/i, transform: m => m[1].charAt(0).toUpperCase() + m[1].slice(1) },
    { key: 'regime_matrimonial_client', pattern: /(régime\s+matrimonial)\s*(?:est\s*)?(communauté\s+réduite\s+aux\s+acquêts|séparation\s+de\s+biens|communauté\s+universelle)/i, transform: m => m[2] },
    // Ajoutez d'autres patterns au besoin
  ];

  const mandatoryFields: Array<keyof ClientProfile> = [
    'nom_client',
    'prenom_client',
    'numero_fiscal_client',
    'date_naissance_client',
    'situation_maritale_client',
  ];

  const computeSuggestions = useCallback((current: Partial<ClientProfile>) => {
    const missing: string[] = [];
    mandatoryFields.forEach(field => {
      if (!current[field] || (typeof current[field] === 'string' && (current[field] as string).trim() === '')) {
        switch (field) {
          case 'nom_client':
            missing.push('Nom manquant');
            break;
          case 'prenom_client':
            missing.push('Prénom manquant');
            break;
          case 'numero_fiscal_client':
            missing.push('Numéro fiscal manquant');
            break;
          case 'date_naissance_client':
            missing.push('Date de naissance manquante');
            break;
          case 'situation_maritale_client':
            missing.push('Situation maritale non précisée');
            break;
          default:
            break;
        }
      }
    });
    return missing;
  }, []);

  /**
   * Traitement d'un snippet de transcript.
   */
  const handleTranscript = useCallback(
    (text: string) => {
      if (!text) return;
      let updated: Partial<ClientProfile> = { ...profile };
      let matched = false;

      regexps.forEach(({ key, pattern, transform }) => {
        const res = text.match(pattern);
        if (res) {
          const value = transform ? transform(res) : res[1];
          (updated as any)[key] = value;
          matched = true;
        }
      });

      if (matched) {
        setProfile(updated);
        setSuggestions(computeSuggestions(updated));
      }
    },
    [profile, computeSuggestions]
  );

  return { profile, suggestions, handleTranscript };
}
