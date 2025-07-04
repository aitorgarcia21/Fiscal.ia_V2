"""
Calculs fiscaux suisses - Francis Suisse
Module pour calculer les impôts en Suisse (fédéral, cantonal, communal)
"""

import json
import math
from typing import Dict, Any, Tuple

class SwissTaxCalculator:
    def __init__(self):
        with open('tax_data_swiss_2025.json', 'r', encoding='utf-8') as f:
            self.tax_data = json.load(f)
    
    def calculate_federal_tax(self, taxable_income: float) -> float:
        """Calcule l'impôt fédéral direct"""
        if taxable_income <= 0:
            return 0
        
        brackets = self.tax_data['federal_tax']['brackets']
        total_tax = 0
        
        for bracket in brackets:
            bracket_min = bracket['min']
            bracket_max = bracket['max']
            rate = bracket['rate']
            
            if taxable_income <= bracket_min:
                break
            
            # Calcul de la tranche imposable
            if bracket_max is None:
                taxable_in_bracket = taxable_income - bracket_min
            else:
                taxable_in_bracket = min(taxable_income, bracket_max) - bracket_min
            
            if taxable_in_bracket > 0:
                total_tax += taxable_in_bracket * rate
        
        return round(total_tax, 2)
    
    def calculate_cantonal_tax(self, taxable_income: float, canton: str) -> Dict[str, float]:
        """Calcule l'impôt cantonal et communal"""
        if canton not in self.tax_data['cantonal_tax']:
            raise ValueError(f"Canton {canton} non supporté")
        
        canton_data = self.tax_data['cantonal_tax'][canton]
        
        # Calcul de l'impôt cantonal de base
        base_tax = 0
        brackets = canton_data['brackets']
        
        for bracket in brackets:
            bracket_min = bracket['min']
            bracket_max = bracket['max']
            rate = bracket['rate']
            
            if taxable_income <= bracket_min:
                break
            
            if bracket_max is None:
                taxable_in_bracket = taxable_income - bracket_min
            else:
                taxable_in_bracket = min(taxable_income, bracket_max) - bracket_min
            
            if taxable_in_bracket > 0:
                base_tax += taxable_in_bracket * rate
        
        # Application des multiplicateurs cantonal et communal
        cantonal_tax = base_tax * canton_data['cantonal_rate']
        communal_tax = base_tax * canton_data['communal_rate']
        
        return {
            'base_tax': round(base_tax, 2),
            'cantonal_tax': round(cantonal_tax, 2),
            'communal_tax': round(communal_tax, 2),
            'total_cantonal_communal': round(cantonal_tax + communal_tax, 2)
        }
    
    def calculate_deductions(self, situation: Dict[str, Any]) -> Dict[str, float]:
        """Calcule les déductions personnelles et professionnelles"""
        deductions = self.tax_data['deductions']
        total_deductions = 0
        detail = {}
        
        # Déductions personnelles
        if situation.get('marital_status') == 'married':
            personal_deduction = deductions['personal']['married']
        else:
            personal_deduction = deductions['personal']['single']
        
        total_deductions += personal_deduction
        detail['personal'] = personal_deduction
        
        # Déductions pour enfants
        children = situation.get('children', 0)
        children_deduction = children * deductions['personal']['child']
        total_deductions += children_deduction
        detail['children'] = children_deduction
        
        # Déductions professionnelles
        gross_income = situation.get('gross_income', 0)
        professional_deduction = max(
            deductions['professional']['min'],
            min(deductions['professional']['max'], gross_income * deductions['professional']['rate'])
        )
        total_deductions += professional_deduction
        detail['professional'] = professional_deduction
        
        # Pilier 3A
        pillar_3a = situation.get('pillar_3a', 0)
        if situation.get('employment_type') == 'self_employed':
            max_pillar_3a = deductions['pillar_3a']['max_self_employed']
        else:
            max_pillar_3a = deductions['pillar_3a']['max_employed']
        
        pillar_3a_deduction = min(pillar_3a, max_pillar_3a)
        total_deductions += pillar_3a_deduction
        detail['pillar_3a'] = pillar_3a_deduction
        
        # Primes d'assurance
        insurance_premiums = situation.get('insurance_premiums', 0)
        insurance_deduction = min(insurance_premiums, deductions['insurance']['max_premium'])
        total_deductions += insurance_deduction
        detail['insurance'] = insurance_deduction
        
        return {
            'total': round(total_deductions, 2),
            'detail': detail
        }
    
    def calculate_social_contributions(self, gross_income: float) -> Dict[str, float]:
        """Calcule les cotisations sociales"""
        social = self.tax_data['social_contributions']
        contributions = {}
        
        # AVS/AI/APG
        avs_base = min(gross_income, social['avs_ai_apg']['max_income'])
        contributions['avs_ai_apg'] = round(avs_base * social['avs_ai_apg']['rate'], 2)
        
        # Assurance chômage
        ac_base = min(gross_income, social['ac']['max_income'])
        ac_normal = ac_base * social['ac']['rate']
        
        # Supplément pour hauts revenus
        if gross_income > social['ac']['threshold_high']:
            ac_supplement = (gross_income - social['ac']['threshold_high']) * social['ac']['rate_high']
            contributions['ac'] = round(ac_normal + ac_supplement, 2)
        else:
            contributions['ac'] = round(ac_normal, 2)
        
        # LPP (Pilier 2)
        if gross_income > social['lpp']['min_income']:
            lpp_base = min(gross_income, social['lpp']['max_income']) - social['lpp']['min_income']
            contributions['lpp'] = round(lpp_base * social['lpp']['rate'], 2)
        else:
            contributions['lpp'] = 0
        
        contributions['total'] = sum(contributions.values())
        
        return contributions
    
    def calculate_withholding_tax(self, monthly_salary: float, status: str = 'single') -> float:
        """Calcule l'impôt à la source mensuel"""
        if status not in self.tax_data['withholding_tax']['rates']:
            status = 'single'
        
        brackets = self.tax_data['withholding_tax']['rates'][status]
        
        for bracket in brackets:
            if monthly_salary <= bracket['max'] if bracket['max'] else True:
                if monthly_salary >= bracket['min']:
                    return round(monthly_salary * bracket['rate'], 2)
        
        return 0
    
    def calculate_total_tax_burden(self, situation: Dict[str, Any]) -> Dict[str, Any]:
        """Calcule la charge fiscale totale"""
        gross_income = situation['gross_income']
        canton = situation['canton']
        
        # Calcul des déductions
        deductions = self.calculate_deductions(situation)
        taxable_income = max(0, gross_income - deductions['total'])
        
        # Calcul des impôts
        federal_tax = self.calculate_federal_tax(taxable_income)
        cantonal_taxes = self.calculate_cantonal_tax(taxable_income, canton)
        
        # Calcul des cotisations sociales
        social_contributions = self.calculate_social_contributions(gross_income)
        
        # Calcul du net
        total_tax = federal_tax + cantonal_taxes['total_cantonal_communal']
        total_deductions_and_taxes = total_tax + social_contributions['total']
        net_income = gross_income - total_deductions_and_taxes
        
        # Taux effectif
        effective_rate = (total_tax / gross_income * 100) if gross_income > 0 else 0
        
        return {
            'gross_income': gross_income,
            'deductions': deductions,
            'taxable_income': taxable_income,
            'federal_tax': federal_tax,
            'cantonal_taxes': cantonal_taxes,
            'social_contributions': social_contributions,
            'total_tax': total_tax,
            'net_income': round(net_income, 2),
            'effective_rate': round(effective_rate, 2),
            'canton': self.tax_data['cantonal_tax'][canton]['name']
        }
    
    def compare_cantons(self, situation: Dict[str, Any]) -> Dict[str, Any]:
        """Compare la charge fiscale entre différents cantons"""
        cantons = list(self.tax_data['cantonal_tax'].keys())
        comparison = {}
        
        for canton in cantons:
            situation_copy = situation.copy()
            situation_copy['canton'] = canton
            
            result = self.calculate_total_tax_burden(situation_copy)
            comparison[canton] = {
                'name': result['canton'],
                'total_tax': result['total_tax'],
                'net_income': result['net_income'],
                'effective_rate': result['effective_rate']
            }
        
        # Tri par charge fiscale croissante
        sorted_cantons = sorted(comparison.items(), key=lambda x: x[1]['total_tax'])
        
        return {
            'comparison': comparison,
            'best_canton': sorted_cantons[0],
            'worst_canton': sorted_cantons[-1],
            'savings': sorted_cantons[-1][1]['total_tax'] - sorted_cantons[0][1]['total_tax']
        }
    
    def calculate_pillar_3a_optimization(self, situation: Dict[str, Any]) -> Dict[str, Any]:
        """Optimise les versements Pilier 3A"""
        current_pillar_3a = situation.get('pillar_3a', 0)
        
        # Calcul avec le maximum possible
        max_pillar_3a = (
            self.tax_data['deductions']['pillar_3a']['max_self_employed'] 
            if situation.get('employment_type') == 'self_employed'
            else self.tax_data['deductions']['pillar_3a']['max_employed']
        )
        
        # Calcul actuel
        current_result = self.calculate_total_tax_burden(situation)
        
        # Calcul optimisé
        optimized_situation = situation.copy()
        optimized_situation['pillar_3a'] = max_pillar_3a
        optimized_result = self.calculate_total_tax_burden(optimized_situation)
        
        tax_savings = current_result['total_tax'] - optimized_result['total_tax']
        additional_contribution = max_pillar_3a - current_pillar_3a
        
        return {
            'current_contribution': current_pillar_3a,
            'optimal_contribution': max_pillar_3a,
            'additional_contribution': additional_contribution,
            'tax_savings': round(tax_savings, 2),
            'net_cost': round(additional_contribution - tax_savings, 2),
            'roi': round((tax_savings / additional_contribution * 100) if additional_contribution > 0 else 0, 2)
        }


def get_available_cantons() -> Dict[str, str]:
    """Retourne la liste des cantons disponibles"""
    with open('tax_data_swiss_2025.json', 'r', encoding='utf-8') as f:
        tax_data = json.load(f)
    
    return {
        code: data['name'] 
        for code, data in tax_data['cantonal_tax'].items()
    }


# Exemple d'utilisation
if __name__ == "__main__":
    calculator = SwissTaxCalculator()
    
    # Situation test
    situation = {
        'gross_income': 100000,
        'canton': 'geneva',
        'marital_status': 'single',
        'children': 0,
        'pillar_3a': 5000,
        'insurance_premiums': 1500,
        'employment_type': 'employed'
    }
    
    # Calcul complet
    result = calculator.calculate_total_tax_burden(situation)
    print(f"Revenu brut: {result['gross_income']} CHF")
    print(f"Impôt fédéral: {result['federal_tax']} CHF")
    print(f"Impôt cantonal/communal: {result['cantonal_taxes']['total_cantonal_communal']} CHF")
    print(f"Cotisations sociales: {result['social_contributions']['total']} CHF")
    print(f"Revenu net: {result['net_income']} CHF")
    print(f"Taux effectif: {result['effective_rate']}%")
    
    # Comparaison cantons
    comparison = calculator.compare_cantons(situation)
    print(f"\nMeilleur canton: {comparison['best_canton'][1]['name']}")
    print(f"Économie possible: {comparison['savings']} CHF")
    
    # Optimisation Pilier 3A
    pillar_optimization = calculator.calculate_pillar_3a_optimization(situation)
    print(f"\nOptimisation Pilier 3A:")
    print(f"Économie d'impôt: {pillar_optimization['tax_savings']} CHF")
    print(f"ROI: {pillar_optimization['roi']}%") 