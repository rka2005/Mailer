from __future__ import annotations

import json
from pathlib import Path

from workers.tasks import process_party_task


# ==========================================================
# LOAD PARTY INDEX
# ==========================================================

def load_party_index(job_folder: Path) -> list:
    """
    Reads party_index.json
    """

    index_file = job_folder / "party_index.json"

    if not index_file.exists():
        raise FileNotFoundError(
            "party_index.json not found."
        )

    with open(
        index_file,
        "r",
        encoding="utf8"
    ) as f:

        return json.load(f)


# ==========================================================
# QUEUE JOB
# ==========================================================

def queue_job(
    job_id: str,
    job_folder: Path,
    sender_email: str | None = None,
):
    """
    Reads the party index and pushes every
    party into Redis.
    """

    parties = load_party_index(job_folder)

    total = 0

    for party in parties:

        process_party_task.delay(

            job_id,

            party["partyKey"],

            sender_email,

        )

        total += 1

    return total