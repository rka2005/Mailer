from __future__ import annotations

import logging
from io import BytesIO
from pathlib import Path
import re
from typing import Any

import pandas as pd
from fastapi import HTTPException, UploadFile
from services.firestore_service import get_firestore_client

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SERVICE_ACCOUNT = BASE_DIR / "credentials" / "mail-automation-83bba-firebase-adminsdk-fbsvc-859cd5b1c9.json"
DEFAULT_COLLECTION = "parties"
COLUMN_ALIASES = {
    "partyname": "Party Name",
    "route": "Route",
    "mail": "Mail",
    "contact": "Contact",
    "billno": "Bill No.",
    "billnumber": "Bill No.",
    "duedate": "Due Date",
    "amount": "Amount",
    "payment": "Payment",
    "pending": "Pending",
    "pendingdays": "Pending Days",
}


def normalize_column_name(column_name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(column_name).strip().lower())


def normalize_dataframe_columns(dataframe: pd.DataFrame) -> pd.DataFrame:
    rename_map = {}
    for column_name in dataframe.columns:
        normalized_name = normalize_column_name(column_name)
        if normalized_name in COLUMN_ALIASES:
            rename_map[column_name] = COLUMN_ALIASES[normalized_name]

    return dataframe.rename(columns=rename_map)


def load_spreadsheet(file_bytes: bytes, filename: str) -> pd.DataFrame:
    suffix = Path(filename).suffix.lower()

    if suffix == ".csv":
        dataframe = pd.read_csv(BytesIO(file_bytes))
    elif suffix in {".xlsx", ".xls"}:
        dataframe = pd.read_excel(BytesIO(file_bytes))
    else:
        raise HTTPException(status_code=400, detail="Only .xlsx, .xls, and .csv files are supported")

    return dataframe.dropna(how="all")


def dataframe_preview(dataframe: pd.DataFrame, limit: int = 8) -> list[dict[str, Any]]:
    preview_frame = dataframe.head(limit).fillna("")
    return preview_frame.to_dict(orient="records")


def process_party_spreadsheet(
    file: UploadFile,
    service_account_path: str | Path | None = None,
    collection_name: str = DEFAULT_COLLECTION,
) -> dict[str, Any]:
    file_bytes = file.file.read()
    dataframe = load_spreadsheet(file_bytes, file.filename or "uploaded-file.csv")
    dataframe = normalize_dataframe_columns(dataframe)

    required_columns = {"Party Name"}
    missing_columns = [column for column in required_columns if column not in dataframe.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_columns)}. Found columns: {', '.join(map(str, dataframe.columns))}",
        )

    db = get_firestore_client(service_account_path)

    party_jobs = []
    
    logger.info("Processing spreadsheet %s with %s rows", file.filename, len(dataframe))

    # Architecture Step: Group all rows by 'Party Name'
    # This automatically collects all rows (bills) for 'Siddheswaari', then 'Gita', etc.
    grouped_parties = dataframe.groupby("Party Name")

    for party_name, group in grouped_parties:
        party_name = str(party_name).strip()

        if not party_name:
            logger.warning(
                "Party Name is empty. Skipping."
            )
            continue

        # Architecture Step: Firestore Lookup (ONCE per party)
        print("=" * 60)
        print("Processing Party :", party_name)

        party_details = get_party_details(db, party_name, collection_name)

        print("Firestore Data :", party_details)

        if not party_details:
            message = (
                f"Party '{party_name}' not found in Firestore "
                f"collection '{collection_name}'"
            )

            logger.error(message)
            continue

        email_address = str(party_details.get("email", "")).strip()
        print("Recipient Email :", email_address)

        if not email_address:
            message = (
                f"Party '{party_name}' has no email stored in Firestore"
            )

            logger.error(message)
            continue

        # Architecture Step: Collect all rows (bills) for the current party
        bills = []
        for _, row in group.iterrows():
            bills.append({
                "billNo": str(row.get("Bill No.", "")).strip(),
                "dueDate": str(row.get("Due Date", "")).strip(),
                "amount": str(row.get("Amount", "")).strip(),
                "payment": str(row.get("Payment", "")).strip(),
                "pending": str(row.get("Pending", "")).strip(),
                "pendingDays": str(row.get("Pending Days", "")).strip(),
            })

        merged_record = {
            "partyName": party_name,
            "route": party_details.get("route", ""),
            "email": email_address,
            "contact": party_details.get("contact", ""),
            "bills": bills,

            "status": "QUEUED",

            "retry_count": 0
        }

        party_jobs.append(merged_record)

    logger.info(
        "Prepared %d party jobs",
        len(party_jobs)
    )

    return {
        "filename": file.filename,
        "rows": len(dataframe),
        "party_jobs": party_jobs,
        "preview": dataframe_preview(dataframe),
        "columns": list(dataframe.columns),
    }


def get_party_details(db, party_name: str, collection_name: str = DEFAULT_COLLECTION) -> dict[str, Any] | None:
    document = db.collection(collection_name).document(party_name).get()
    if document.exists:
        return document.to_dict() or {}

    query = db.collection(collection_name).where("partyName", "==", party_name).limit(1).get()
    if query:
        return query[0].to_dict() or {}

    return None