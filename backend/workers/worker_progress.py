from __future__ import annotations

from firebase_admin import firestore

from services.firestore_service import get_firestore_client

from services.job_service import (
    get_job,
    update_job_counts,
    update_stage,
    update_status,
    finish_job,
)

FAILED_COLLECTION = "failed_parties"


# ==========================================================
# PROCESSING
# ==========================================================

def mark_processing(job_id: str):

    job = get_job(job_id)

    processing = job.get("processing", 0) + 1
    queued = max(job.get("queued", 0) - 1, 0)

    update_job_counts(
        job_id,
        processing=processing,
        queued=queued,
    )

    update_status(job_id, "RUNNING")
    update_stage(job_id, "PDF")


# ==========================================================
# COMPLETED
# ==========================================================

def mark_completed(job_id: str):

    job = get_job(job_id)

    processing = max(job.get("processing", 0) - 1, 0)
    completed = job.get("completed", 0) + 1

    update_job_counts(
        job_id,
        processing=processing,
        completed=completed,
    )

    update_stage(job_id, "EMAIL")

    finish_if_completed(
        job_id,
        total=job["total"],
        completed=completed,
        failed=job["failed"],
        queued=job["queued"],
        processing=processing,
    )

# ==========================================================
# FAILED
# ==========================================================

def mark_failed(job_id: str):

    job = get_job(job_id)

    processing = max(job.get("processing", 0) - 1, 0)
    failed = job.get("failed", 0) + 1

    update_job_counts(
        job_id,
        processing=processing,
        failed=failed,
    )

    update_stage(job_id, "FAILED")

    finish_if_completed(
        job_id,
        total=job["total"],
        completed=job["completed"],
        failed=failed,
        queued=job["queued"],
        processing=processing,
    )

# ==========================================================
# SAVE FAILED PARTY
# ==========================================================

def save_failed_party(
    job_id: str,
    party_key: str,
    party_name: str,
    start_row: int,
    end_row: int,
    reason: str,
    retry_count: int,
):

    db = get_firestore_client()

    db.collection("jobs")\
        .document(job_id)\
        .collection(FAILED_COLLECTION)\
        .document(party_key)\
        .set({

            "partyKey": party_key,

            "partyName": party_name,    

            "startRow": start_row,

            "endRow": end_row,

            "reason": reason,

            "retryCount": firestore.Increment(1),

            "status": "FAILED",

            "updatedAt": firestore.SERVER_TIMESTAMP,

        }, merge=True)


# ==========================================================
# DELETE FAILED PARTY
# ==========================================================

def delete_failed_party(
    job_id: str,
    party_key: str,
):

    db = get_firestore_client()

    db.collection("jobs")\
        .document(job_id)\
        .collection(FAILED_COLLECTION)\
        .document(party_key)\
        .delete()


# ==========================================================
# FINISH JOB
# ==========================================================

def finish_if_completed(
    job_id: str,
    *,
    total: int,
    completed: int,
    failed: int,
    queued: int,
    processing: int,
):
    try:
        print("\n" + "=" * 70)
        print("finish_if_completed() called")
        print(f"job_id      : {job_id}")
        print(f"total       : {total}")
        print(f"completed   : {completed}")
        print(f"failed      : {failed}")
        print(f"queued      : {queued}")
        print(f"processing  : {processing}")
        print("=" * 70)

        if (
            completed + failed == total
            and queued == 0
            and processing == 0
        ):
            print(">>> CONDITION TRUE <<<")

            if failed == 0:
                print("Updating status -> COMPLETED")
                update_status(job_id, "COMPLETED")
            else:
                print("Updating status -> COMPLETED_WITH_ERRORS")
                update_status(job_id, "COMPLETED_WITH_ERRORS")

            print("Calling finish_job()")
            finish_job(job_id)
            print("finish_job() returned")

    except Exception as e:
        print("=" * 70)
        print("ERROR INSIDE finish_if_completed()")
        print(type(e).__name__)
        print(e)
        print("=" * 70)
        raise