from workers.celery_app import celery

from workers.worker_service import process_party


@celery.task(
    bind=True,
    name="process_party",
    max_retries=3,
)

def process_party_task(
    self,
    job_id: str,
    party_key: str,
    sender_email: str | None = None,
):

    return process_party(
        self,
        job_id,
        party_key,
        sender_email,
    )