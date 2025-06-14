from types import SimpleNamespace
from backend import assistant_fiscal
import pytest


def fake_chat(model, messages, temperature, max_tokens):
    """Simule la réponse de l'API Mistral."""
    class FakeResponse:
        class Choice:
            def __init__(self, content):
                self.message = SimpleNamespace(content=content)

        def __init__(self):
            self.choices = [self.Choice("Réponse test – CGI Article 197\nCGI Article 197")]

    return FakeResponse()


def test_get_fiscal_response(monkeypatch):
    """Valide que l'assistant renvoie bien une réponse, des sources et un score de confiance lorsque les dépendances externes sont simulées."""
    # Patch du client Mistral
    fake_client = SimpleNamespace(chat=fake_chat)
    monkeypatch.setattr(assistant_fiscal, "client", fake_client)

    # Patch des fonctions de recherche pour retourner une source CGI factice
    monkeypatch.setattr(
        assistant_fiscal,
        "search_similar_cgi_articles",
        lambda query, top_k=3: [
            {
                "content": "Texte de l'article 197...",
                "source": "CGI Article 197",
                "article_id": "197",
            }
        ],
    )
    monkeypatch.setattr(
        assistant_fiscal,
        "search_similar_bofip_chunks_filtered",
        lambda query, top_k=3: [],
    )

    answer, sources, confidence = assistant_fiscal.get_fiscal_response("Quel est le barème IR ?")

    assert "CGI" in answer, "La réponse ne cite pas le CGI."
    assert sources == ["Article 197 du CGI"], "Les sources retournées sont incorrectes."
    assert confidence > 0, "Le score de confiance devrait être positif." 