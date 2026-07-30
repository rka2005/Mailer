from __future__ import annotations

import logging

from services.pdf_generator import generate_party_pdf_buffer

from workers.worker_reader import (
    build_party_payload,
)

from workers.worker_sender import (
    send_all,
)

from workers.worker_progress import (
    mark_processing,
    mark_completed,
    mark_failed,
    save_failed_party,
    delete_failed_party,
)

logger = logging.getLogger(__name__)


def process_party(
    task,
    job_id: str,
    party_key: str,
    sender_email: str | None = None,
):
    """
    Complete lifecycle of one party.

    Worker Entry Point.
    """

    pdf_buffer = None

    try:

        logger.info(
            "Starting Party %s",
            party_key,
        )

        # ---------------------------------------
        # Processing Started
        # ---------------------------------------

        mark_processing(job_id)

        # ---------------------------------------
        # Read Party
        # ---------------------------------------

        party = build_party_payload(
            job_id,
            party_key,
        )

        logger.info(
            "Party Loaded : %s",
            party["partyName"],
        )

        # ---------------------------------------
        # Generate PDF
        # ---------------------------------------

        pdf_buffer = generate_party_pdf_buffer(
            party
        )

        logger.info(
            "PDF Generated"
        )

        # ---------------------------------------
        # Send Email / WhatsApp
        # ---------------------------------------

        send_all(
            party=party,
            pdf_buffer=pdf_buffer,
            sender_email=sender_email,
        )

        # ---------------------------------------
        # Remove old failed document
        # ---------------------------------------

        delete_failed_party(
            job_id,
            party_key,
        )

        # ---------------------------------------
        # Success
        # ---------------------------------------

        mark_completed(job_id)

        logger.info(
            "Completed : %s",
            party["partyName"],
        )

        return {
            "status": "SUCCESS",
            "party": party["partyName"],
        }

    except ValueError as e:

        logger.warning(str(e))

        # Save reason in Firestore (optional)
        save_failed_party(
            job_id=job_id,
            party_key=party_key,
            party_name=party_key,
            start_row=0,
            end_row=0,
            reason=str(e),
            retry_count=0,
        )

        # Don't retry this task
        mark_failed(job_id)

        return {
            "status": "SKIPPED",
            "reason": str(e)
        }

    except Exception as e:

        logger.exception(e)

        try:

            save_failed_party(

                job_id=job_id,

                party_key=party_key,

                party_name=party.get(
                    "partyName",
                    party_key,
                ),

                start_row=party.get(
                    "startRow",
                    0,
                ),

                end_row=party.get(
                    "endRow",
                    0,
                ),

                reason = repr(e),

                retry_count=1,
            )

        except Exception:

            logger.exception(
                "Unable to save failed party."
            )

        mark_failed(job_id)

        return {
            "status": "FAILED",
            "party": party_key,
        }

    finally:

        try:

            if pdf_buffer:
                pdf_buffer.close()

        except Exception:
            pass