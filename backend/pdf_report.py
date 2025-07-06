from typing import List, Dict, Optional, Union, Any
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from questionnaire_schema import QuestionnaireCGP
from models_pro import ClientProfile
from schemas_pro import AnalysisResultSchema

# ======================================================
# Fonction simple : rapport mono-scenario
# ======================================================

def generate_pdf_report(answer: str, sources: List[str], output_path: str) -> str:
    """Génère un rapport PDF très simple (ancienne version)."""
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    margin = 2 * cm
    text_object = c.beginText(margin, height - margin)
    text_object.setFont("Helvetica", 11)
    text_object.setFont("Helvetica-Bold", 14)
    text_object.textLine("Rapport d'analyse fiscale personnalisé – Francis")
    text_object.setFont("Helvetica", 10)
    text_object.textLine(f"Date : {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    text_object.textLine(" ")
    text_object.setFont("Helvetica-Bold", 12)
    text_object.textLine("Réponse :")
    text_object.setFont("Helvetica", 11)
    for line in answer.split("\n"):
        text_object.textLine(line)
    text_object.textLine(" ")
    text_object.setFont("Helvetica-Bold", 12)
    text_object.textLine("Sources officielles :")
    text_object.setFont("Helvetica", 11)
    for src in sources:
        text_object.textLine(f"- {src}")
    c.drawText(text_object)
    c.showPage()
    c.save()
    return output_path

# ======================================================
# Fonction avancée : rapport multi-scénarios
# ======================================================

def generate_pdf_multiscenario(scenarios: List[dict], sources: List[str], output_path: str) -> str:
    """Génère un rapport PDF contenant plusieurs scénarios d'analyse.

    Args:
        scenarios (List[dict]): Liste de scénarios. Chaque élément doit être
            un dict avec les clés "titre" (str) et "contenu" (str).
        sources (List[str]): Sources officielles communes.
        output_path (str): Chemin de sortie du PDF.

    Returns:
        str: Chemin absolu du fichier PDF généré.
    """

    if not scenarios:
        raise ValueError("La liste des scénarios est vide.")

    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    margin = 2 * cm
    y_start = height - margin

    # Page de garde
    c.setFont("Helvetica-Bold", 16)
    c.drawString(margin, y_start, "Rapport d'analyse fiscale – Multi-scénarios")
    c.setFont("Helvetica", 10)
    c.drawString(margin, y_start - 1.2 * cm, f"Date : {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    c.showPage()

    for idx, sc in enumerate(scenarios, 1):
        title = sc.get("titre", f"Scénario {idx}")
        content = sc.get("contenu", "(contenu vide)")

        text_obj = c.beginText(margin, height - margin)
        text_obj.setFont("Helvetica-Bold", 14)
        text_obj.textLine(title)
        text_obj.setFont("Helvetica", 11)

        for line in content.split("\n"):
            text_obj.textLine(line)

        c.drawText(text_obj)
        c.showPage()

    # Dernière page – sources
    txt = c.beginText(margin, height - margin)
    txt.setFont("Helvetica-Bold", 12)
    txt.textLine("Sources officielles :")
    txt.setFont("Helvetica", 10)
    for src in sources:
        txt.textLine(f"- {src}")

    c.drawText(txt)
    c.showPage()
    c.save()

    return output_path

# --- Nouvelle fonction pour rapport détaillé avec Platypus --- 

def generate_professional_report(
    output_target: Union[str, BytesIO], 
    client_name: Optional[str],
    questionnaire: Optional[QuestionnaireCGP],
    scenarios_data: List[Dict] # Liste de ScenarioOutputDetail.model_dump()
) -> None: # Ne retourne plus de chemin, écrit directement dans le buffer ou le fichier
    doc = SimpleDocTemplate(output_target, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(name='CustomMainTitle', parent=styles['h1'], fontSize=20, alignment=TA_CENTER, spaceAfter=0.8*cm))
    styles.add(ParagraphStyle(name='CustomSubTitle', parent=styles['Normal'], fontSize=11, alignment=TA_CENTER, spaceAfter=0.4*cm, textColor=colors.HexColor("#555555")))
    styles.add(ParagraphStyle(name='CustomClientName', parent=styles['Normal'], fontSize=12, alignment=TA_CENTER, spaceAfter=0.4*cm, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='CustomReportDate', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER, spaceAfter=1.5*cm))
    styles.add(ParagraphStyle(name='CustomScenarioTitle', parent=styles['h2'], fontSize=16, spaceBefore=0.5*cm, spaceAfter=0.5*cm, alignment=TA_LEFT, textColor=colors.HexColor("#1A2942")))
    styles.add(ParagraphStyle(name='CustomSectionTitle', parent=styles['h3'], fontSize=12, spaceBefore=0.6*cm, spaceAfter=0.2*cm, alignment=TA_LEFT, textColor=colors.HexColor("#2A3952"), fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='CustomBodyText', parent=styles['Normal'], fontSize=10, alignment=TA_JUSTIFY, leading=14, spaceAfter=0.2*cm))
    styles.add(ParagraphStyle(name='CustomListItem', parent=styles['CustomBodyText'], leftIndent=10, bulletIndent=0, spaceBefore=0.1*cm))
    styles.add(ParagraphStyle(name='CustomFooterText', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name='TableHeader', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.whitesmoke, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='TableCell', parent=styles['Normal'], fontSize=9, alignment=TA_LEFT, leading=10))
    styles.add(ParagraphStyle(name='TableCellNumber', parent=styles['TableCell'], alignment=TA_RIGHT))

    story = []

    # 1. Page de Titre
    story.append(Paragraph("Analyse et Stratégies d'Optimisation Fiscale & Patrimoniale", styles['CustomMainTitle']))
    story.append(Paragraph("Rapport Généré par Francis, Expert Fiscal", styles['CustomSubTitle']))
    if client_name:
        story.append(Paragraph(f"Préparé pour : {client_name}", styles['CustomClientName']))
    if questionnaire and questionnaire.identite:
        story.append(Paragraph(f"(Situation au {questionnaire.identite.date_naissance if questionnaire.identite.date_naissance else 'date non spécifiée'})", styles['CustomSubTitle'])) # Exemple d'utilisation
    story.append(Paragraph(f"Date de génération : {datetime.now().strftime('%d %B %Y')}", styles['CustomReportDate']))
    story.append(PageBreak())

    # 2. Contenu des scénarios
    for i, scenario_dict in enumerate(scenarios_data):
        if i > 0: # Saut de page avant chaque scénario sauf le tout premier (après la page de titre)
            story.append(PageBreak())

        titre_sc = scenario_dict.get('titre_strategie', f'Scénario Inconnu {i}')
        story.append(Paragraph(titre_sc, styles['CustomScenarioTitle']))
        
        description_sc = scenario_dict.get('description_breve', '')
        if description_sc:
            story.append(Paragraph(description_sc, styles['CustomBodyText']))
            story.append(Spacer(1, 0.3*cm))

        impacts = scenario_dict.get('impacts_chiffres_cles', [])
        if impacts:
            story.append(Paragraph("Impacts Chiffrés Clés :", styles['CustomSectionTitle']))
            header = [Paragraph(txt, styles['TableHeader']) for txt in ["Libellé", "Avant", "Après", "Variation", "Unité"]]
            data_table = [header]
            for impact in impacts:
                val_avant_raw = impact.get('valeur_avant')
                val_avant_str = str(val_avant_raw) if val_avant_raw is not None else '-'
                
                val_apres_raw = impact.get('valeur_apres')
                val_apres_str = str(val_apres_raw) if val_apres_raw is not None else '?'
                
                variation_raw = impact.get('variation')
                variation_str = str(variation_raw) if variation_raw is not None else '-'
                
                unite = impact.get('unite', '€')
                
                # Les stratégies fournissent des valeurs numériques SANS unité.
                # Le rapporteur ajoute l'unité.
                display_avant = f"{val_avant_str} {unite}" if val_avant_raw is not None and unite else val_avant_str
                display_apres = f"{val_apres_str} {unite}" if val_apres_raw is not None and unite else val_apres_str
                display_variation = f"{variation_str} {unite}" if variation_raw is not None and unite and not ("(" in variation_str or ")" in variation_str) else variation_str
                display_unite_col = unite if unite else ""

                if impact.get('libelle') == "Parts Fiscales" or impact.get('libelle') == "Durée de détention (années)":
                    display_avant = val_avant_str
                    display_apres = val_apres_str
                    display_variation = variation_str
                    display_unite_col = unite if unite else impact.get('libelle').split('(')[-1].replace(')', '') if '(' in impact.get('libelle') else ""
                elif not unite: # Si l'unité est explicitement vide, ne pas l'ajouter
                    display_avant = val_avant_str
                    display_apres = val_apres_str
                    display_variation = variation_str
                    display_unite_col = ""

                data_table.append([
                    Paragraph(impact.get('libelle', '?'), styles['TableCell']),
                    Paragraph(display_avant, styles['TableCellNumber']),
                    Paragraph(display_apres, styles['TableCellNumber']),
                    Paragraph(display_variation, styles['TableCellNumber']),
                    Paragraph(display_unite_col, styles['TableCellNumber']) 
                ])
            table = Table(data_table, colWidths=[5.5*cm, 3*cm, 3*cm, 3.5*cm, 1*cm])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#4a6984")),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 8),
                ('TOPPADDING', (0,0), (-1,0), 8),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#f0f0f0")),
                ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
                ('LEFTPADDING', (0,0), (-1,-1), 4),
                ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ]))
            story.append(table)
            story.append(Spacer(1, 0.5*cm))

        def create_list_flowable(items: List[str], style: ParagraphStyle):
            return [ListFlowable([Paragraph(item, style)], bulletType='bullet', leftIndent=15, bulletRightIndent=5, spaceBefore=2, bulletFontSize=10) for item in items]

        avantages = scenario_dict.get('avantages', [])
        if avantages:
            story.append(Paragraph("Avantages de cette stratégie :", styles['CustomSectionTitle']))
            story.extend(create_list_flowable(avantages, styles['CustomListItem']))
            story.append(Spacer(1, 0.5*cm))

        inconvenients = scenario_dict.get('inconvenients_ou_points_attention', [])
        if inconvenients:
            story.append(Paragraph("Points d'Attention et Inconvénients :", styles['CustomSectionTitle']))
            story.extend(create_list_flowable(inconvenients, styles['CustomListItem']))
            story.append(Spacer(1, 0.5*cm))
        
        texte_explicatif = scenario_dict.get('texte_explicatif_complementaire')
        if texte_explicatif:
            story.append(Paragraph("Explications Complémentaires :", styles['CustomSectionTitle']))
            for ligne_explicative in texte_explicatif.split('\n'):
                 story.append(Paragraph(ligne_explicative, styles['CustomBodyText']))
            story.append(Spacer(1, 0.5*cm))

        sources_rag = scenario_dict.get('sources_rag_text')
        if sources_rag:
            story.append(Paragraph("Sources Légales Suggérées (Indicatives) :", styles['CustomSectionTitle']))
            cleaned_sources = sources_rag.replace("\n\nSources légales suggérées (CGI) :\n", "").strip()
            for ligne_source in cleaned_sources.split('\n'):
                if ligne_source.strip().startswith("-"):
                    story.append(ListFlowable([Paragraph(ligne_source.strip()[1:].strip(), styles['CustomListItem'])], bulletType='bullet', leftIndent=10, bulletRightIndent=5, spaceBefore=2))
                elif ligne_source.strip():
                    story.append(Paragraph(ligne_source.strip(), styles['CustomBodyText']))
            story.append(Spacer(1, 0.5*cm))

    def _add_page_numbers(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        page_number_text = f"Page {doc.page}"
        canvas.drawCentredString(A4[0]/2, 1.5*cm, page_number_text)
        canvas.restoreState()

    doc.build(story, onFirstPage=_add_page_numbers, onLaterPages=_add_page_numbers)
    # Ne retourne plus de chemin, car il écrit dans le buffer/fichier passé en argument

# Pour tester localement si besoin
# if __name__ == '__main__':
#     from backend.scenario_output import ScenarioOutputDetail, ImpactChiffre # Mettre le bon import
#     # Créer des données de scénario factices
#     client_test_name = "M. Jean Dupont"
#     scenario_test_1 = ScenarioOutputDetail(
#         titre_strategie="Test Stratégie PER",
#         description_breve="Ceci est une brève description de la stratégie PER.",
#         impacts_chiffres_cles=[
#             ImpactChiffre(libelle="Revenu Imposable", valeur_avant="70,000.00", valeur_apres="63,000.00", variation="-7,000.00"),
#             ImpactChiffre(libelle="Impôt sur le Revenu", valeur_avant="15,000.00", valeur_apres="12,000.00", variation="-3,000.00")
#         ],
#         avantages=["Avantage 1 du PER.", "Avantage 2 du PER."],
#         inconvenients_ou_points_attention=["Inconvénient 1 du PER.", "Point d'attention spécifique."],
#         texte_explicatif_complementaire="Ceci est un texte explicatif plus long pour le PER. Il détaille le fonctionnement et les implications.\nUne deuxième ligne pour voir.",
#         sources_rag_text="\n\nSources légales suggérées (CGI) :\n- Article 123 du CGI (Pertinence indicative)\n- Article XYZ du CGI (Pertinence indicative)"
#     ).model_dump()
#     scenario_test_2 = ScenarioOutputDetail(
#         titre_strategie="Test Stratégie LMNP",
#         description_breve="Description du LMNP.",
#         impacts_chiffres_cles=[
#             ImpactChiffre(libelle="Revenus Locatifs Bruts", valeur_apres="20,000.00"),
#             ImpactChiffre(libelle="Abattement Micro-BIC", valeur_apres="10,000.00"),
#             ImpactChiffre(libelle="Impôt sur le Revenu", valeur_avant="15,000.00", valeur_apres="14,000.00", variation="-1,000.00")
#         ],
#         avantages=["Simple.", "Efficace."],
#         inconvenients_ou_points_attention=["Plafonné."],
#         texte_explicatif_complementaire="Le LMNP est une bonne option pour les petits revenus locatifs."
#     ).model_dump()
#     scenarios_list = [scenario_test_1, scenario_test_2]
#     generate_professional_report("rapport_detaille_test.pdf", client_test_name, scenarios_list)
#     print("Rapport PDF de test généré : rapport_detaille_test.pdf") 

def generate_client_pdf_report(output_target: Union[str, BytesIO], client: ClientProfile) -> None:
    """Génère un rapport PDF détaillé pour une fiche client complète."""
    doc = SimpleDocTemplate(output_target, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    
    styles = getSampleStyleSheet()

    # Styles personnalisés
    styles.add(ParagraphStyle(name='CustomMainTitle', parent=styles['h1'], fontSize=20, alignment=TA_CENTER, spaceAfter=0.8*cm))
    styles.add(ParagraphStyle(name='CustomSubTitle', parent=styles['Normal'], fontSize=11, alignment=TA_CENTER, spaceAfter=0.4*cm, textColor=colors.HexColor("#555555")))
    styles.add(ParagraphStyle(name='CustomClientName', parent=styles['Normal'], fontSize=14, alignment=TA_CENTER, spaceAfter=0.4*cm, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='CustomReportDate', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER, spaceAfter=1.5*cm))
    styles.add(ParagraphStyle(name='CustomSectionTitle', parent=styles['h3'], fontSize=12, spaceBefore=0.6*cm, spaceAfter=0.2*cm, alignment=TA_LEFT, textColor=colors.HexColor("#2A3952"), fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='CustomBodyText', parent=styles['Normal'], fontSize=10, alignment=TA_JUSTIFY, leading=14, spaceAfter=0.2*cm))
    styles.add(ParagraphStyle(name='CustomListItem', parent=styles['CustomBodyText'], leftIndent=10, bulletIndent=0, spaceBefore=0.1*cm))
    styles.add(ParagraphStyle(name='TableHeader', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.whitesmoke, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='TableCell', parent=styles['Normal'], fontSize=9, alignment=TA_LEFT, leading=10))
    styles.add(ParagraphStyle(name='TableCellNumber', parent=styles['TableCell'], alignment=TA_RIGHT))

    story = []

    # Page de titre
    story.append(Paragraph("FICHE CLIENT COMPLÈTE", styles['CustomMainTitle']))
    story.append(Paragraph("Générée par Francis, Expert Fiscal", styles['CustomSubTitle']))
    story.append(Paragraph(f"Client : {client.prenom_client} {client.nom_client}", styles['CustomClientName']))
    story.append(Paragraph(f"Date de génération : {datetime.now().strftime('%d %B %Y')}", styles['CustomReportDate']))
    story.append(PageBreak())

    # Informations d'identité
    story.append(Paragraph("INFORMATIONS D'IDENTITÉ", styles['CustomSectionTitle']))
    
    identite_data = [
        ["Civilité", client.civilite_client or "Non précisé"],
        ["Nom", client.nom_client or "Non précisé"],
        ["Prénom", client.prenom_client or "Non précisé"],
        ["Nom d'usage", client.nom_usage_client or "Non précisé"],
        ["Date de naissance", client.date_naissance_client or "Non précisé"],
        ["Lieu de naissance", client.lieu_naissance_client or "Non précisé"],
        ["Nationalité", client.nationalite_client or "Non précisé"],
        ["Numéro fiscal", client.numero_fiscal_client or "Non précisé"],
    ]
    
    identite_table = Table(identite_data, colWidths=[4*cm, 10*cm])
    identite_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A2942")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DEE2E6")),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(identite_table)
    story.append(Spacer(1, 0.5*cm))

    # Adresse
    if client.adresse_postale_client or client.code_postal_client or client.ville_client:
        story.append(Paragraph("ADRESSE", styles['CustomSectionTitle']))
        adresse_text = f"{client.adresse_postale_client or ''} {client.code_postal_client or ''} {client.ville_client or ''}".strip()
        story.append(Paragraph(adresse_text, styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Contact
    story.append(Paragraph("INFORMATIONS DE CONTACT", styles['CustomSectionTitle']))
    contact_data = [
        ["Email", client.email_client or "Non précisé"],
        ["Téléphone principal", client.telephone_principal_client or "Non précisé"],
        ["Téléphone secondaire", client.telephone_secondaire_client or "Non précisé"],
    ]
    
    contact_table = Table(contact_data, colWidths=[4*cm, 10*cm])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A2942")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DEE2E6")),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(contact_table)
    story.append(Spacer(1, 0.5*cm))

    # Situation familiale
    story.append(Paragraph("SITUATION FAMILIALE", styles['CustomSectionTitle']))
    famille_data = [
        ["Situation maritale", client.situation_maritale_client or "Non précisé"],
        ["Date mariage/PACS", client.date_mariage_pacs_client or "Non précisé"],
        ["Régime matrimonial", client.regime_matrimonial_client or "Non précisé"],
        ["Nombre d'enfants à charge", str(client.nombre_enfants_a_charge_client or 0)],
        ["Personnes dépendantes", client.personnes_dependantes_client or "Non précisé"],
    ]
    
    famille_table = Table(famille_data, colWidths=[4*cm, 10*cm])
    famille_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A2942")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DEE2E6")),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(famille_table)
    story.append(PageBreak())

    # Revenus
    story.append(Paragraph("REVENUS", styles['CustomSectionTitle']))
    
    # Client 1
    if client.profession_client1 or client.revenu_net_annuel_client1:
        story.append(Paragraph("Client 1", styles['CustomSubTitle']))
        revenus1_data = [
            ["Profession", client.profession_client1 or "Non précisé"],
            ["Statut professionnel", client.statut_professionnel_client1 or "Non précisé"],
            ["Employeur/Entreprise", client.nom_employeur_entreprise_client1 or "Non précisé"],
            ["Type de contrat", client.type_contrat_client1 or "Non précisé"],
            ["Revenu net annuel", f"{client.revenu_net_annuel_client1:,.0f} €" if client.revenu_net_annuel_client1 else "Non précisé"],
        ]
        
        revenus1_table = Table(revenus1_data, colWidths=[4*cm, 10*cm])
        revenus1_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A2942")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DEE2E6")),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ]))
        story.append(revenus1_table)
        story.append(Spacer(1, 0.3*cm))

    # Client 2
    if client.profession_client2 or client.revenu_net_annuel_client2:
        story.append(Paragraph("Client 2", styles['CustomSubTitle']))
        revenus2_data = [
            ["Profession", client.profession_client2 or "Non précisé"],
            ["Statut professionnel", client.statut_professionnel_client2 or "Non précisé"],
            ["Employeur/Entreprise", client.nom_employeur_entreprise_client2 or "Non précisé"],
            ["Type de contrat", client.type_contrat_client2 or "Non précisé"],
            ["Revenu net annuel", f"{client.revenu_net_annuel_client2:,.0f} €" if client.revenu_net_annuel_client2 else "Non précisé"],
        ]
        
        revenus2_table = Table(revenus2_data, colWidths=[4*cm, 10*cm])
        revenus2_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A2942")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DEE2E6")),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ]))
        story.append(revenus2_table)
        story.append(Spacer(1, 0.3*cm))

    # Revenus du foyer
    story.append(Paragraph("Revenus du Foyer", styles['CustomSubTitle']))
    revenus_foyer_data = [
        ["Revenus fonciers bruts", f"{client.revenus_fonciers_annuels_bruts_foyer:,.0f} €" if client.revenus_fonciers_annuels_bruts_foyer else "Non précisé"],
        ["Charges foncières déductibles", f"{client.charges_foncieres_deductibles_foyer:,.0f} €" if client.charges_foncieres_deductibles_foyer else "Non précisé"],
        ["Revenus capitaux mobiliers", f"{client.revenus_capitaux_mobiliers_foyer:,.0f} €" if client.revenus_capitaux_mobiliers_foyer else "Non précisé"],
        ["Plus-values mobilières", f"{client.plus_values_mobilieres_foyer:,.0f} €" if client.plus_values_mobilieres_foyer else "Non précisé"],
        ["Plus-values immobilières", f"{client.plus_values_immobilieres_foyer:,.0f} €" if client.plus_values_immobilieres_foyer else "Non précisé"],
        ["Bénéfices industriels/commerciaux", f"{client.benefices_industriels_commerciaux_foyer:,.0f} €" if client.benefices_industriels_commerciaux_foyer else "Non précisé"],
        ["Bénéfices non commerciaux", f"{client.benefices_non_commerciaux_foyer:,.0f} €" if client.benefices_non_commerciaux_foyer else "Non précisé"],
        ["Pensions retraites perçues", f"{client.pensions_retraites_percues_foyer:,.0f} €" if client.pensions_retraites_percues_foyer else "Non précisé"],
        ["Pensions alimentaires perçues", f"{client.pensions_alimentaires_percues_foyer:,.0f} €" if client.pensions_alimentaires_percues_foyer else "Non précisé"],
    ]
    
    revenus_foyer_table = Table(revenus_foyer_data, colWidths=[4*cm, 10*cm])
    revenus_foyer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A2942")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DEE2E6")),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(revenus_foyer_table)
    story.append(PageBreak())

    # Patrimoine
    story.append(Paragraph("PATRIMOINE", styles['CustomSectionTitle']))
    
    patrimoine_data = [
        ["Comptes courants (solde total)", f"{client.comptes_courants_solde_total_estime:,.0f} €" if client.comptes_courants_solde_total_estime else "Non précisé"],
        ["Compte titres (valeur estimée)", f"{client.compte_titres_valeur_estimee:,.0f} €" if client.compte_titres_valeur_estimee else "Non précisé"],
        ["Valeur entreprise/parts sociales", f"{client.valeur_entreprise_parts_sociales:,.0f} €" if client.valeur_entreprise_parts_sociales else "Non précisé"],
        ["Comptes courants associés", f"{client.comptes_courants_associes_solde:,.0f} €" if client.comptes_courants_associes_solde else "Non précisé"],
        ["Véhicules (valeur estimée)", f"{client.vehicules_valeur_estimee:,.0f} €" if client.vehicules_valeur_estimee else "Non précisé"],
        ["Objets d'art (valeur estimée)", f"{client.objets_art_valeur_estimee:,.0f} €" if client.objets_art_valeur_estimee else "Non précisé"],
        ["Crédits consommation (encours)", f"{client.credits_consommation_encours_total:,.0f} €" if client.credits_consommation_encours_total else "Non précisé"],
    ]
    
    patrimoine_table = Table(patrimoine_data, colWidths=[4*cm, 10*cm])
    patrimoine_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A2942")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DEE2E6")),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(patrimoine_table)
    story.append(Spacer(1, 0.5*cm))

    # Objectifs et projets
    if client.objectifs_fiscaux_client or client.objectifs_patrimoniaux_client:
        story.append(Paragraph("OBJECTIFS ET PROJETS", styles['CustomSectionTitle']))
        
        if client.objectifs_fiscaux_client:
            story.append(Paragraph("Objectifs fiscaux :", styles['CustomSubTitle']))
            story.append(Paragraph(client.objectifs_fiscaux_client, styles['CustomBodyText']))
            story.append(Spacer(1, 0.3*cm))
        
        if client.objectifs_patrimoniaux_client:
            story.append(Paragraph("Objectifs patrimoniaux :", styles['CustomSubTitle']))
            story.append(Paragraph(client.objectifs_patrimoniaux_client, styles['CustomBodyText']))
            story.append(Spacer(1, 0.3*cm))
        
        if client.horizon_placement_client:
            story.append(Paragraph(f"Horizon de placement : {client.horizon_placement_client}", styles['CustomBodyText']))
        
        if client.profil_risque_investisseur_client:
            story.append(Paragraph(f"Profil de risque : {client.profil_risque_investisseur_client}", styles['CustomBodyText']))
        
        if client.notes_objectifs_projets_client:
            story.append(Paragraph("Notes sur les objectifs et projets :", styles['CustomSubTitle']))
            story.append(Paragraph(client.notes_objectifs_projets_client, styles['CustomBodyText']))

    # Informations fiscales
    story.append(PageBreak())
    story.append(Paragraph("INFORMATIONS FISCALES", styles['CustomSectionTitle']))
    
    fiscal_data = [
        ["TMI estimée", f"{client.tranche_marginale_imposition_estimee}%" if client.tranche_marginale_imposition_estimee else "Non précisé"],
        ["Soumis à l'IFI", client.ifi_concerne_client or "Non précisé"],
        ["Crédits/réductions d'impôt", client.credits_reductions_impot_recurrents or "Non précisé"],
    ]
    
    fiscal_table = Table(fiscal_data, colWidths=[4*cm, 10*cm])
    fiscal_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A2942")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DEE2E6")),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(fiscal_table)
    story.append(Spacer(1, 0.5*cm))

    if client.notes_fiscales_client:
        story.append(Paragraph("Notes fiscales :", styles['CustomSubTitle']))
        story.append(Paragraph(client.notes_fiscales_client, styles['CustomBodyText']))

    # Suivi professionnel
    story.append(PageBreak())
    story.append(Paragraph("SUIVI PROFESSIONNEL", styles['CustomSectionTitle']))
    
    suivi_data = [
        ["Statut du dossier", client.statut_dossier_pro or "Non précisé"],
        ["Prochain rendez-vous", client.prochain_rendez_vous_pro or "Non précisé"],
    ]
    
    suivi_table = Table(suivi_data, colWidths=[4*cm, 10*cm])
    suivi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A2942")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#DEE2E6")),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(suivi_table)
    story.append(Spacer(1, 0.5*cm))

    if client.notes_internes_pro:
        story.append(Paragraph("Notes internes :", styles['CustomSubTitle']))
        story.append(Paragraph(client.notes_internes_pro, styles['CustomBodyText']))

    # Pied de page
    story.append(PageBreak())
    story.append(Paragraph("Rapport généré automatiquement par Francis", styles['CustomFooterText']))
    story.append(Paragraph(f"Date : {datetime.now().strftime('%d/%m/%Y à %H:%M')}", styles['CustomFooterText']))

    doc.build(story, onFirstPage=_add_page_numbers, onLaterPages=_add_page_numbers) 

def generate_analysis_pdf_report(output_target: Union[str, BytesIO], client: ClientProfile, analysis_result: AnalysisResultSchema) -> None:
    """Génère un rapport PDF pour l'analyse générale d'un client."""
    
    # Créer le document
    doc = BaseDocTemplate(output_target, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    # Styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Title'],
        fontSize=18,
        spaceAfter=30,
        textColor=colors.HexColor("#1A2942"),
        alignment=1  # Centré
    ))
    styles.add(ParagraphStyle(
        name='CustomSectionTitle',
        parent=styles['Heading1'],
        fontSize=14,
        spaceAfter=12,
        spaceBefore=20,
        textColor=colors.HexColor("#1A2942"),
        borderWidth=0,
        borderColor=colors.HexColor("#88C0D0"),
        borderPadding=5,
        borderRadius=5,
        backColor=colors.HexColor("#F8F9FA")
    ))
    styles.add(ParagraphStyle(
        name='CustomSubTitle',
        parent=styles['Heading2'],
        fontSize=12,
        spaceAfter=8,
        spaceBefore=15,
        textColor=colors.HexColor("#2A3F6C")
    ))
    styles.add(ParagraphStyle(
        name='CustomBodyText',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6,
        textColor=colors.HexColor("#2A3F6C")
    ))
    styles.add(ParagraphStyle(
        name='CustomFooterText',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor("#6C757D"),
        alignment=1
    ))

    def _add_page_numbers(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor("#6C757D"))
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.drawRightString(doc.pagesize[0] - 2*cm, 1*cm, text)
        canvas.restoreState()

    story = []
    
    # En-tête
    story.append(Paragraph("ANALYSE FISCALE FRANCIS", styles['CustomTitle']))
    story.append(Paragraph(f"Client : {client.nom_client} {client.prenom_client}", styles['CustomSubTitle']))
    story.append(Paragraph(f"Date d'analyse : {datetime.now().strftime('%d/%m/%Y à %H:%M')}", styles['CustomBodyText']))
    story.append(Spacer(1, 0.5*cm))

    # Score de risque
    if hasattr(analysis_result, 'score_risque') and analysis_result.score_risque:
        story.append(Paragraph("SCORE DE RISQUE", styles['CustomSectionTitle']))
        story.append(Paragraph(f"Score : {analysis_result.score_risque}/10", styles['CustomBodyText']))
        if hasattr(analysis_result, 'commentaire_score_risque') and analysis_result.commentaire_score_risque:
            story.append(Paragraph(analysis_result.commentaire_score_risque, styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Recommandations principales
    if hasattr(analysis_result, 'recommandations_principales') and analysis_result.recommandations_principales:
        story.append(Paragraph("RECOMMANDATIONS PRINCIPALES", styles['CustomSectionTitle']))
        for i, rec in enumerate(analysis_result.recommandations_principales, 1):
            story.append(Paragraph(f"{i}. {rec}", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Optimisations fiscales
    if hasattr(analysis_result, 'optimisations_fiscales') and analysis_result.optimisations_fiscales:
        story.append(Paragraph("OPTIMISATIONS FISCALES", styles['CustomSectionTitle']))
        for i, opt in enumerate(analysis_result.optimisations_fiscales, 1):
            story.append(Paragraph(f"{i}. {opt}", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Stratégies d'investissement
    if hasattr(analysis_result, 'strategies_investissement') and analysis_result.strategies_investissement:
        story.append(Paragraph("STRATÉGIES D'INVESTISSEMENT", styles['CustomSectionTitle']))
        for i, strat in enumerate(analysis_result.strategies_investissement, 1):
            story.append(Paragraph(f"{i}. {strat}", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Planification patrimoniale
    if hasattr(analysis_result, 'planification_patrimoniale') and analysis_result.planification_patrimoniale:
        story.append(Paragraph("PLANIFICATION PATRIMONIALE", styles['CustomSectionTitle']))
        for i, plan in enumerate(analysis_result.planification_patrimoniale, 1):
            story.append(Paragraph(f"{i}. {plan}", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Risques identifiés
    if hasattr(analysis_result, 'risques_identifies') and analysis_result.risques_identifies:
        story.append(Paragraph("RISQUES IDENTIFIÉS", styles['CustomSectionTitle']))
        for i, risque in enumerate(analysis_result.risques_identifies, 1):
            story.append(Paragraph(f"{i}. {risque}", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Actions prioritaires
    if hasattr(analysis_result, 'actions_prioritaires') and analysis_result.actions_prioritaires:
        story.append(Paragraph("ACTIONS PRIORITAIRES", styles['CustomSectionTitle']))
        for i, action in enumerate(analysis_result.actions_prioritaires, 1):
            story.append(Paragraph(f"{i}. {action}", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Notes
    if hasattr(analysis_result, 'notes') and analysis_result.notes:
        story.append(Paragraph("NOTES", styles['CustomSectionTitle']))
        story.append(Paragraph(analysis_result.notes, styles['CustomBodyText']))

    # Pied de page
    story.append(PageBreak())
    story.append(Paragraph("Rapport d'analyse généré par Francis", styles['CustomFooterText']))
    story.append(Paragraph(f"Date : {datetime.now().strftime('%d/%m/%Y à %H:%M')}", styles['CustomFooterText']))

    doc.build(story, onFirstPage=_add_page_numbers, onLaterPages=_add_page_numbers)

def generate_irpp_analysis_pdf_report(output_target: Union[str, BytesIO], client: ClientProfile, irpp_analysis: Any) -> None:
    """Génère un rapport PDF pour l'analyse IRPP d'un client."""
    
    # Créer le document
    doc = BaseDocTemplate(output_target, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    # Styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Title'],
        fontSize=18,
        spaceAfter=30,
        textColor=colors.HexColor("#1A2942"),
        alignment=1  # Centré
    ))
    styles.add(ParagraphStyle(
        name='CustomSectionTitle',
        parent=styles['Heading1'],
        fontSize=14,
        spaceAfter=12,
        spaceBefore=20,
        textColor=colors.HexColor("#1A2942"),
        borderWidth=0,
        borderColor=colors.HexColor("#88C0D0"),
        borderPadding=5,
        borderRadius=5,
        backColor=colors.HexColor("#F8F9FA")
    ))
    styles.add(ParagraphStyle(
        name='CustomSubTitle',
        parent=styles['Heading2'],
        fontSize=12,
        spaceAfter=8,
        spaceBefore=15,
        textColor=colors.HexColor("#2A3F6C")
    ))
    styles.add(ParagraphStyle(
        name='CustomBodyText',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6,
        textColor=colors.HexColor("#2A3F6C")
    ))
    styles.add(ParagraphStyle(
        name='CustomFooterText',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor("#6C757D"),
        alignment=1
    ))

    def _add_page_numbers(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor("#6C757D"))
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.drawRightString(doc.pagesize[0] - 2*cm, 1*cm, text)
        canvas.restoreState()

    story = []
    
    # En-tête
    story.append(Paragraph("ANALYSE IRPP 2025", styles['CustomTitle']))
    story.append(Paragraph(f"Client : {client.nom_client} {client.prenom_client}", styles['CustomSubTitle']))
    story.append(Paragraph(f"Date d'analyse : {datetime.now().strftime('%d/%m/%Y à %H:%M')}", styles['CustomBodyText']))
    story.append(Spacer(1, 0.5*cm))

    # Résumé de l'analyse
    if hasattr(irpp_analysis, 'resume_analyse') and irpp_analysis.resume_analyse:
        story.append(Paragraph("RÉSUMÉ DE L'ANALYSE", styles['CustomSectionTitle']))
        story.append(Paragraph(irpp_analysis.resume_analyse, styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Montant d'impôt estimé
    if hasattr(irpp_analysis, 'montant_impot_estime') and irpp_analysis.montant_impot_estime:
        story.append(Paragraph("MONTANT D'IMPÔT ESTIMÉ", styles['CustomSectionTitle']))
        story.append(Paragraph(f"Montant : {irpp_analysis.montant_impot_estime:,.0f} €", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Taux marginal d'imposition
    if hasattr(irpp_analysis, 'taux_marginal_imposition') and irpp_analysis.taux_marginal_imposition:
        story.append(Paragraph("TAUX MARGINAL D'IMPOSITION", styles['CustomSectionTitle']))
        story.append(Paragraph(f"TMI : {irpp_analysis.taux_marginal_imposition}%", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Optimisations possibles
    if hasattr(irpp_analysis, 'optimisations_possibles') and irpp_analysis.optimisations_possibles:
        story.append(Paragraph("OPTIMISATIONS POSSIBLES", styles['CustomSectionTitle']))
        for i, opt in enumerate(irpp_analysis.optimisations_possibles, 1):
            story.append(Paragraph(f"{i}. {opt}", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Recommandations
    if hasattr(irpp_analysis, 'recommandations') and irpp_analysis.recommandations:
        story.append(Paragraph("RECOMMANDATIONS", styles['CustomSectionTitle']))
        for i, rec in enumerate(irpp_analysis.recommandations, 1):
            story.append(Paragraph(f"{i}. {rec}", styles['CustomBodyText']))
        story.append(Spacer(1, 0.3*cm))

    # Notes
    if hasattr(irpp_analysis, 'notes') and irpp_analysis.notes:
        story.append(Paragraph("NOTES", styles['CustomSectionTitle']))
        story.append(Paragraph(irpp_analysis.notes, styles['CustomBodyText']))

    # Pied de page
    story.append(PageBreak())
    story.append(Paragraph("Rapport IRPP généré par Francis", styles['CustomFooterText']))
    story.append(Paragraph(f"Date : {datetime.now().strftime('%d/%m/%Y à %H:%M')}", styles['CustomFooterText']))

    doc.build(story, onFirstPage=_add_page_numbers, onLaterPages=_add_page_numbers) 