import sys, types

# Stub pandas si absent ou incomplet
pd_stub = types.ModuleType("pandas")
pd_stub.DataFrame = object  # type: ignore
sys.modules.setdefault("pandas", pd_stub)

# Stub assistant_fiscal_simple pour éviter l'import lourd
afs_stub = types.ModuleType("assistant_fiscal_simple")
def _dummy(*args, **kwargs):
    return {}
afs_stub.get_fiscal_response = _dummy  # type: ignore
afs_stub.get_fiscal_response_stream = _dummy  # type: ignore
afs_stub.search_cgi_embeddings = _dummy  # type: ignore
sys.modules.setdefault("assistant_fiscal_simple", afs_stub)

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_endpoint_calc_igi():
    r = client.post("/api/tools/calc-igi", json={"ht": 1000, "taux": "general"})
    assert r.status_code == 200
    data = r.json()
    assert data["igi"] == 45.0 and data["ttc"] == 1045.0


def test_endpoint_calc_irpf():
    r = client.post("/api/tools/calc-irpf", json={"revenu_net": 55_000})
    assert r.status_code == 200
    data = r.json()
    assert data["irpf"] == 2300.0


def test_endpoint_calc_is():
    r = client.post("/api/tools/calc-is", json={"benefice_net": 100_000, "regime": "standard"})
    assert r.status_code == 200
    assert r.json()["is"] == 10_000.0


def test_endpoint_calc_cass():
    r = client.post("/api/tools/calc-cass", json={"brut_annuel": 60_000})
    assert r.status_code == 200
    data = r.json()
    assert data["assiette"] == 49_260 