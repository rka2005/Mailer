from __future__ import annotations

from fastapi import UploadFile

from services.job_service import (
    create_job,
    update_job_counts,
    update_stage,
    update_status,
)

from services.upload_service import save_excel

from services.index_service import create_index

from services.queue_service import queue_job


def start_job(
    file: UploadFile,
    sender_email: str | None = None,
):
    """
    Complete upload workflow.

    1. Create Firestore Job
    2. Save Excel
    3. Create Index
    4. Update Job
    5. Queue Celery Tasks
    """

    # -----------------------------------
    # Create Job
    # -----------------------------------

    job_id = create_job(file.filename)

    # -----------------------------------
    # Save Excel
    # -----------------------------------

    excel_path = save_excel(
        file=file,
        job_id=job_id,
    )

    # -----------------------------------
    # Analyze Excel
    # -----------------------------------

    update_stage(
        job_id,
        "ANALYZE"
    )

    update_status(
        job_id,
        "ANALYZING"
    )

    index_result = create_index(
        job_id=job_id,
        excel_path=excel_path,
    )

    # -----------------------------------
    # Update Job Information
    # -----------------------------------

    update_job_counts(
        job_id,
        total=index_result["partyCount"],
        queued=index_result["partyCount"],
    )

    # -----------------------------------
    # Queue Stage
    # -----------------------------------

    update_stage(
        job_id,
        "QUEUE"
    )

    update_status(
        job_id,
        "QUEUING"
    )

    total_tasks = queue_job(
        job_id=job_id,
        job_folder=excel_path.parent,
        sender_email=sender_email,
    )

    # -----------------------------------
    # Running
    # -----------------------------------

    update_stage(
        job_id,
        "PDF"
    )

    update_status(
        job_id,
        "RUNNING"
    )

    return {

        "status": "queued",

        "jobId": job_id,

        "totalParties": total_tasks,

        "rowCount": index_result["rowCount"],

        "preview": index_result["preview"],

        "columns": index_result["columns"],

        "message": "Background processing started."
    }