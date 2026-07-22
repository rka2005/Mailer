from __future__ import annotations

import logging
from io import BytesIO
from pathlib import Path
import re
from typing import Any

import pandas as pd
from fastapi import HTTPException, UploadFile
from services.firestore_service import get_firestore_client
from services.email_sender import send_email_with_pdf_attachment
from services.pdf_generator import generate_party_pdf_buffer

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
    sender_email: str | None = None,
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

    emails_sent = 0
    rows_processed_success = 0
    rows_skipped = 0
    rows_failed = 0
    records = []
    
    logger.info("Processing spreadsheet %s with %s rows", file.filename, len(dataframe))

    # Architecture Step: Group all rows by 'Party Name'
    # This automatically collects all rows (bills) for 'Siddheswaari', then 'Gita', etc.
    grouped_parties = dataframe.groupby("Party Name")

    for party_name, group in grouped_parties:
        party_name = str(party_name).strip()
        num_rows_in_group = len(group)

        if not party_name:
            rows_skipped += num_rows_in_group
            logger.warning("Skipped %s rows because Party Name is empty", num_rows_in_group)
            continue

        # Architecture Step: Firestore Lookup (ONCE per party)
        print("=" * 60)
        print("Processing Party :", party_name)

        party_details = get_party_details(db, party_name, collection_name)

        print("Firestore Data :", party_details)
        if not party_details:
            rows_failed += num_rows_in_group
            message = f"Party '{party_name}' not found in Firestore collection '{collection_name}'"
            logger.error(message)
            records.append({"partyName": party_name, "status": "not_found_in_firestore", "error": message, "rows_affected": num_rows_in_group})
            continue

        email_address = str(party_details.get("email", "")).strip()
        print("Recipient Email :", email_address)
        if not email_address:
            rows_skipped += num_rows_in_group
            message = f"Party '{party_name}' has no email stored in Firestore"
            logger.error(message)
            records.append({"partyName": party_name, "status": "missing_email", "error": message, "rows_affected": num_rows_in_group})
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
            "bills": bills  # Pass the entire list of bills to the PDF generator
        }

        # Architecture Step: Generate ONE PDF containing all party rows
        print("Bills :", len(merged_record["bills"]))
        pdf_buffer = generate_party_pdf_buffer(merged_record)
        print("PDF Generated")
        
        try:

            print("\n")
            print("="*70)
            print("Party :", party_name)
            print("Recipient :", email_address)
            print("Bills :", len(bills))
            print("="*70)

            send_email_with_pdf_attachment(
                recipient_email=email_address,
                sender_email=sender_email,
                subject=f"Account Statement - {party_name}",
                body=f"Hello {party_name}",
                pdf_buffer=pdf_buffer,
                attachment_filename=f"{party_name}.pdf",
            )

            print("EMAIL SENT")

            emails_sent += 1

        except Exception as e:

            print("\n")
            print("EMAIL FAILED")
            print(e)
            print("\n")

            raise          # <-- IMPORTANT

        finally:

            pdf_buffer.close()

    logger.info(
        "Finished spreadsheet %s: emails_sent=%s rows_processed=%s rows_skipped=%s rows_failed=%s",
        file.filename, emails_sent, rows_processed_success, rows_skipped, rows_failed
    )

    return {
        "filename": file.filename,
        "rows": int(len(dataframe)),
        "emails_sent_count": emails_sent,
        "sent": rows_processed_success,
        "skipped": rows_skipped,
        "failed": rows_failed,
        "records": records,
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