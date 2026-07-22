from pathlib import Path

import pandas as pd
from services.excel_processor import normalize_dataframe_columns
from services.firestore_service import get_firestore_client

BASE_DIR = Path(__file__).resolve().parent
CSV_FILE = BASE_DIR / "party_details.csv"
SERVICE_ACCOUNT_KEY = BASE_DIR / "credentials" / "mail-automation-83bba-firebase-adminsdk-fbsvc-859cd5b1c9.json"
COLLECTION_NAME = "parties"

if not CSV_FILE.exists():
    raise FileNotFoundError(f"CSV file not found:\n{CSV_FILE}")

if not SERVICE_ACCOUNT_KEY.exists():
    raise FileNotFoundError(f"Firebase JSON not found:\n{SERVICE_ACCOUNT_KEY}")

print("CSV File :", CSV_FILE)
print("Firebase :", SERVICE_ACCOUNT_KEY)
print()

db = get_firestore_client(SERVICE_ACCOUNT_KEY)
print("✅ Connected to Firebase\n")

df = normalize_dataframe_columns(pd.read_csv(CSV_FILE).dropna(how="all"))
print(f"Found {len(df)} parties.\n")

uploaded = 0
updated = 0
failed = 0

for index, row in df.iterrows():
    try:
        party_name = str(row["Party Name"]).strip()

        if not party_name:
            print(f"Skipping row {index + 1} (Empty Party Name)")
            continue

        data = {
            "partyName": party_name,
            "route": str(row["Route"]).strip() if pd.notna(row["Route"]) else "",
            "email": str(row["Mail"]).strip() if pd.notna(row["Mail"]) else "",
            "contact": str(row["Contact"]).strip() if pd.notna(row["Contact"]) else "",
        }

        doc_ref = db.collection(COLLECTION_NAME).document(party_name)

        if doc_ref.get().exists:
            updated += 1
        else:
            uploaded += 1

        doc_ref.set(data)
        print(f"✔ {party_name}")
    except Exception as e:
        failed += 1
        print(f"❌ Error on row {index + 1}: {e}")

print("\n===================================")
print("Upload Completed Successfully")
print("===================================")
print(f"New Records : {uploaded}")
print(f"Updated     : {updated}")
print(f"Failed      : {failed}")
print("===================================")