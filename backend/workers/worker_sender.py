from __future__ import annotations

import logging

from services.email_sender import send_email_with_pdf_attachment

logger = logging.getLogger(__name__)


# ==========================================================
# EMAIL
# ==========================================================

def send_email(
    party: dict,
    pdf_buffer,
    sender_email: str | None,
):
    """
    Sends the PDF through email.
    """

    logger.info(
        "Sending Email : %s",
        party["partyName"],
    )

    send_email_with_pdf_attachment(

        recipient_email=party["email"],

        sender_email=sender_email,

        subject=f"Account Statement - {party['partyName']}",

        body=f"Hello {party['partyName']},\n\nPlease find your account statement attached.",

        pdf_buffer=pdf_buffer,

        attachment_filename=f"{party['partyName']}.pdf",
    )

    logger.info(
        "Email Sent : %s",
        party["partyName"],
    )


# ==========================================================
# WHATSAPP
# ==========================================================

def send_whatsapp(
    party: dict,
    pdf_path: str | None = None,
):
    """
    Placeholder.

    Will be implemented using
    WhatsApp Cloud API.
    """

    logger.info(
        "WhatsApp Service Pending : %s",
        party["partyName"],
    )

    return True


# ==========================================================
# SEND ALL
# ==========================================================

def send_all(
    party: dict,
    pdf_buffer,
    sender_email: str | None,
):
    """
    Sends through every enabled channel.

    Future

        Email

        WhatsApp

        SMS

        Telegram
    """

    send_email(
        party,
        pdf_buffer,
        sender_email,
    )

    # Uncomment after WhatsApp implementation

    # send_whatsapp(
    #     party,
    # )