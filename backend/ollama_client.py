import os, requests, json, typing

OLLAMA_URL = os.getenv("LLM_ENDPOINT", "http://localhost:11434")


def _post(endpoint: str, payload: dict, timeout: int = 60) -> dict:
    url = f"{OLLAMA_URL}{endpoint}"
    try:
        r = requests.post(url, json=payload, timeout=timeout)
        r.raise_for_status()
        return r.json()
    except (requests.exceptions.ConnectionError, requests.exceptions.RequestException) as e:
        # Fallback automatique : si l'hôte est "llm", retenter sur localhost
        if "//llm" in OLLAMA_URL:
            alt_url = OLLAMA_URL.replace("//llm", "//localhost")
            try:
                alt_full = f"{alt_url}{endpoint}"
                r = requests.post(alt_full, json=payload, timeout=timeout)
                r.raise_for_status()
                return r.json()
            except Exception:
                pass  # Tombe dans l'exception générique plus bas
        raise e


def generate(prompt: str, model: str = "mistral", max_tokens: int = 512, temperature: float = 0.2) -> str:
    """Renvoie la réponse complète (non streamée) du modèle."""
    data = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": max_tokens,
            "temperature": temperature,
        },
    }
    resp = _post("/api/generate", data)
    return resp.get("response", "")


def embed(texts: typing.List[str] | str, model: str = "nomic-embed-text") -> typing.List[typing.List[float]]:
    """Obtient des embeddings (384-d) pour une string ou une liste de strings."""
    if isinstance(texts, str):
        texts = [texts]
    payload = {"model": model, "prompt": texts}
    resp = _post("/api/embeddings", payload)
    return resp.get("embeddings", []) 