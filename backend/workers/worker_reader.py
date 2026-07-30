from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from services.firestore_service import get_firestore_client
from services.upload_service import get_source_file, get_job_directory


# ==========================================================
# LOAD PARTY INDEX
# ==========================================================

def load_party_index(job_id: str) -> list:

    job_folder = get_job_directory(job_id)

    index_path = job_folder / "party_index.json"

    if not index_path.exists():
        raise FileNotFoundError(
            f"party_index.json not found for {job_id}"
        )

    with open(index_path, "r", encoding="utf8") as f:
        return json.load(f)


# ==========================================================
# LOAD EXCEL
# ==========================================================

def load_excel(job_id: str) -> pd.DataFrame:

    excel_path = get_source_file(job_id)

    suffix = excel_path.suffix.lower()

    if suffix == ".csv":
        df = pd.read_csv(excel_path)
    else:
        df = pd.read_excel(excel_path)

    df = df.fillna("")

    return df


# ==========================================================
# FIND PARTY
# ==========================================================

def find_party(
    party_key: str,
    index_data: list,
) -> dict:

    for party in index_data:

        if party["partyKey"] == party_key:
            return party

    raise Exception(
        f"Party {party_key} not found."
    )


# ==========================================================
# FIRESTORE DETAILS
# ==========================================================

def get_firestore_party(
    party_name: str,
):
    db = get_firestore_client()

    doc = (
        db.collection("parties")
        .document(party_name)
        .get()
    )

    if not doc.exists:
        return None

    return doc.to_dict()


# ==========================================================
# BUILD PARTY PAYLOAD
# ==========================================================

def build_party_payload(
    job_id: str,
    party_key: str,
):
    """
    Returns the same payload that
    pdf_generator already understands.
    """

    index_data = load_party_index(job_id)

    party = find_party(
        party_key,
        index_data,
    )

    df = load_excel(job_id)

    rows = df.iloc[
        party["startRow"]:
        party["endRow"] + 1
    ]

    firestore_party = get_firestore_party(
        party["partyName"]
    )

    if firestore_party is None:
        raise ValueError(
            f"Party '{party['partyName']}' not found in Firestore."
        )

    email = str(firestore_party.get("email", "")).strip()

    if not email:
        raise ValueError(
            f"Email not found for party '{party['partyName']}'."
        )

    bills = []

    for _, row in rows.iterrows():

        bills.append({

            "billNo": str(row.get("Bill No.", "")),

            "dueDate": str(row.get("Due Date", "")),

            "amount": str(row.get("Amount", "")),

            "payment": str(row.get("Payment", "")),

            "pending": str(row.get("Pending", "")),

            "pendingDays": str(row.get("Pending Days", "")),
        })

    return {
        "partyKey": party_key,
        "partyName": party["partyName"],
        "startRow": party["startRow"],
        "endRow": party["endRow"],
        "email": firestore_party.get(
            "email",
            "",
        ),
        "route": firestore_party.get(
            "route",
            "",
        ),
        "contact": firestore_party.get(
            "contact",
            "",
        ),
        "bills": bills,
    }