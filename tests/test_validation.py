from backend.assistant_fiscal import validate_official_source


def test_validate_official_cgi():
    assert validate_official_source({"type": "CGI", "path": "cgi_chunks/article123.txt"}) is True


def test_validate_official_bofip():
    assert validate_official_source({"type": "BOFIP", "path": "bofip_chunks/file.txt"}) is True


def test_validate_non_official():
    assert validate_official_source({"type": "BLOG", "path": "myblog/post"}) is False 