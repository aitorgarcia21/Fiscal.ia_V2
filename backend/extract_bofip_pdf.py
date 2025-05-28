import PyPDF2
import os

def extract_text_from_pdf(pdf_path, output_txt_path):
    """
    Extrait le texte d'un fichier PDF et le sauvegarde dans un fichier texte.
    """
    try:
        with open(pdf_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() or "" # Ajouter or "" pour gérer les pages sans texte extrayable
            
            with open(output_txt_path, 'w', encoding='utf-8') as txt_file:
                txt_file.write(text)
            print(f"Texte extrait avec succès de {pdf_path} et sauvegardé dans {output_txt_path}")
            return True
    except FileNotFoundError:
        print(f"Erreur : Le fichier PDF {pdf_path} n'a pas été trouvé.")
        return False
    except Exception as e:
        print(f"Une erreur est survenue lors de l'extraction du texte du PDF : {e}")
        return False

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_filename = "panier_bofip.pdf"
    txt_filename = "bofip_extracted_text.txt"
    
    pdf_file_path = os.path.join(current_dir, pdf_filename)
    txt_file_path = os.path.join(current_dir, "data", txt_filename) # Sauvegarde dans le dossier data

    # S'assurer que le dossier data existe
    data_dir = os.path.join(current_dir, "data")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"Dossier créé : {data_dir}")

    if os.path.exists(pdf_file_path):
        extract_text_from_pdf(pdf_file_path, txt_file_path)
    else:
        print(f"Le fichier PDF source '{pdf_file_path}' n'existe pas. Veuillez vérifier le chemin et le nom du fichier.") 