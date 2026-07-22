from __future__ import annotations
import logging
import os
import smtplib
import traceback
from pathlib import Path
from dotenv import load_dotenv
from email.message import EmailMessage
from io import BytesIO

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

print("=" * 60)
print("ENV FILE :", ENV_PATH)
print("SMTP_USERNAME :", os.getenv("SMTP_USERNAME"))
print("SMTP_PASSWORD :", "Loaded" if os.getenv("SMTP_PASSWORD") else "Missing")
print("=" * 60)

def send_email_with_pdf_attachment(
	recipient_email: str,
	sender_email: str | None,
	subject: str,
	body: str,
	pdf_buffer: BytesIO,
	attachment_filename: str,
	smtp_host: str | None = None,
	smtp_port: int | None = None,
	smtp_username: str | None = None,
	smtp_password: str | None = None,
	use_tls: bool = True,
) -> None:
	try:
		host = smtp_host or os.getenv("SMTP_HOST", "smtp.gmail.com")
		port = smtp_port or int(os.getenv("SMTP_PORT", "587"))
		username = smtp_username or os.getenv("SMTP_USERNAME")
		password = smtp_password or os.getenv("SMTP_PASSWORD")

		if not username or not password:
			raise ValueError("SMTP credentials are missing. Set SMTP_USERNAME and SMTP_PASSWORD.")

		message = EmailMessage()
		message["From"] = username
		if sender_email and sender_email != username:
			message["Reply-To"] = sender_email
		message["To"] = recipient_email
		message["Subject"] = subject
		message.set_content(body)
		message.add_attachment(
			pdf_buffer.getvalue(),
			maintype="application",
			subtype="pdf",
			filename=attachment_filename,
		)

		with smtplib.SMTP(host, port) as smtp:
			if use_tls:
				smtp.starttls()
			smtp.login(username, password)
			print("FROM :", message["From"])
			print("TO   :", message["To"])
			print("SUBJECT :", message["Subject"])
			smtp.send_message(message)
		logger.info("Sent email to %s using SMTP account %s", recipient_email, username)
	except Exception as e:
		print("\n")
		print("=" * 60)
		print("EMAIL FAILED")
		print("Recipient :", recipient_email)
		print("Reason    :", str(e))
		traceback.print_exc()
		print("=" * 60)
		raise