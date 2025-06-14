from backend.client_profiles import create_client, get_client, update_client, list_clients


def test_client_crud(tmp_path, monkeypatch):
    # Isoler DATA_PATH vers un tmp pour ne pas polluer les données réelles
    from backend import client_profiles as cp
    monkeypatch.setattr(cp, "DATA_PATH", tmp_path / "clients.json")
    monkeypatch.setattr(cp, "_USE_SUPABASE", False)

    profile = {"nom": "Durand", "revenu_imposable": 50000}
    cid = create_client(profile)
    assert cid

    retrieved = get_client(cid)
    assert retrieved["nom"] == "Durand"

    update_client(cid, {"revenu_imposable": 55000})
    assert get_client(cid)["revenu_imposable"] == 55000

    assert len(list_clients()) == 1 