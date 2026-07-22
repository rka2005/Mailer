from __future__ import annotations

from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SERVICE_ACCOUNT = BASE_DIR / "credentials" / "mail-automation-83bba-firebase-adminsdk-fbsvc-859cd5b1c9.json"


def get_firestore_client(service_account_path: str | Path | None = None):
	credential_path = Path(service_account_path or DEFAULT_SERVICE_ACCOUNT)

	if not credential_path.exists():
		raise FileNotFoundError(f"Firebase JSON not found: {credential_path}")

	if not firebase_admin._apps:
		cred = credentials.Certificate(str(credential_path))
		firebase_admin.initialize_app(cred)

	return firestore.client()
