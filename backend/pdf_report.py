from typing import List, Dict, Optional, Union
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from backend.questionnaire_schema import QuestionnaireCGP

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