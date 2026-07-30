from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from firebase_admin import firestore

from services.firestore_service import get_firestore_client


# ==========================================================
# COLLECTIONS
# ==========================================================

JOBS_COLLECTION = "jobs"


# ==========================================================
# JOB STATUS
# ==========================================================

JOB_STATUS = {
    "QUEUED",
    "ANALYZING",
    "INDEXING",
    "QUEUING",
    "RUNNING",
    "COMPLETED",
    "COMPLETED_WITH_ERRORS",
    "FAILED",
    "CANCELLED",
}


# ==========================================================
# JOB STAGES
# ==========================================================

JOB_STAGE = {
    "UPLOAD",
    "ANALYZE",
    "INDEX",
    "QUEUE",
    "PDF",
    "EMAIL",
    "WHATSAPP",
    "FINISHED",
}


# ==========================================================
# PRIVATE
# ==========================================================

def _db():
    return get_firestore_client()


def _job_ref(job_id: str):
    return _db().collection(JOBS_COLLECTION).document(job_id)


# ==========================================================
# CREATE JOB
# ==========================================================

def create_job(filename: str) -> str:
    """
    Creates a new job document.

    Returns:
        job_id
    """

    job_id = f"JOB_{uuid4().hex[:12].upper()}"

    now = firestore.SERVER_TIMESTAMP

    _job_ref(job_id).set({

        "jobId": job_id,

        "filename": filename,

        "status": "QUEUED",

        "currentStage": "UPLOAD",

        "total": 0,

        "queued": 0,

        "processing": 0,

        "completed": 0,

        "failed": 0,

        "progress": 0,

        "lastFailure": None,

        "createdAt": now,

        "updatedAt": now,

        "finishedAt": None,

    })

    return job_id


# ==========================================================
# GET JOB
# ==========================================================

def get_job(job_id: str):

    doc = _job_ref(job_id).get()

    if not doc.exists:
        return None

    return doc.to_dict()


# ==========================================================
# UPDATE JOB
# ==========================================================

def update_job(
    job_id: str,
    data: dict,
):

    data["updatedAt"] = firestore.SERVER_TIMESTAMP

    _job_ref(job_id).update(data)


# ==========================================================
# UPDATE COUNTS
# ==========================================================

def update_job_counts(
    job_id: str,
    *,
    total: int | None = None,
    queued: int | None = None,
    processing: int | None = None,
    completed: int | None = None,
    failed: int | None = None,
    progress: float | None = None,
):

    payload = {}

    if total is not None:
        payload["total"] = total

    if queued is not None:
        payload["queued"] = queued

    if processing is not None:
        payload["processing"] = processing

    if completed is not None:
        payload["completed"] = completed

    if failed is not None:
        payload["failed"] = failed

    if progress is not None:
        payload["progress"] = progress

    job = get_job(job_id)

    if job:

        total_rows = payload.get("total", job["total"])

        completed_rows = payload.get(
            "completed",
            job["completed"]
        )

        failed_rows = payload.get(
            "failed",
            job["failed"]
        )

        if total_rows > 0:

            payload["progress"] = round(
                ((completed_rows + failed_rows) / total_rows) * 100,
                2
            )

    payload["updatedAt"] = firestore.SERVER_TIMESTAMP

    _job_ref(job_id).update(payload)


# ==========================================================
# UPDATE STATUS
# ==========================================================

def update_status(
    job_id: str,
    status: str,
):

    if status not in JOB_STATUS:
        raise ValueError(
            f"Invalid Job Status : {status}"
        )

    update_job(
        job_id,
        {
            "status": status
        }
    )


# ==========================================================
# UPDATE STAGE
# ==========================================================

def update_stage(
    job_id: str,
    stage: str,
):

    if stage not in JOB_STAGE:
        raise ValueError(
            f"Invalid Stage : {stage}"
        )

    update_job(
        job_id,
        {
            "currentStage": stage
        }
    )


# ==========================================================
# FINISH JOB
# ==========================================================

def finish_job(job_id):

    print("finish_job() called for", job_id)
    update_job(
        job_id,
        {
            "currentStage": "FINISHED",
            "finishedAt": firestore.SERVER_TIMESTAMP,
        }
    )
    print("finish_job() completed")


# ==========================================================
# CANCEL JOB
# ==========================================================

def cancel_job(job_id: str):

    update_job(
        job_id,
        {
            "status": "CANCELLED",
            "finishedAt": firestore.SERVER_TIMESTAMP,
        }
    )


# ==========================================================
# DELETE JOB
# ==========================================================

def delete_job(job_id: str):

    _job_ref(job_id).delete()