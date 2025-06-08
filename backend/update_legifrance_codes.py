import subprocess
from pathlib import Path

CODES = {
    "code_civil": "LEGITEXT000006070721",
    "code_du_travail": "LEGITEXT000006072050",
}


def update_all():
    for prefix, cid in CODES.items():
        cmd = [
            "python",
            "extract_legifrance_code.py",
            cid,
            "--prefix",
            prefix,
            "--output",
            "data/legifrance",
        ]
        print("Running", " ".join(cmd))
        subprocess.run(cmd, check=False)


if __name__ == "__main__":
    update_all()
