from __future__ import annotations

import os

from celery import Celery
from dotenv import load_dotenv

load_dotenv()

BROKER_URL = os.getenv(
    "CELERY_BROKER_URL",
    "redis://localhost:6379/0"
)

RESULT_BACKEND = os.getenv(
    "CELERY_RESULT_BACKEND",
    "redis://localhost:6379/0"
)

celery = Celery(
    "mail_automation",
    broker=BROKER_URL,
    backend=RESULT_BACKEND,
)

celery.conf.update(

    task_serializer="json",

    result_serializer="json",

    accept_content=["json"],

    timezone="Asia/Kolkata",

    enable_utc=False,

    task_track_started=True,

    worker_prefetch_multiplier=1,

    task_acks_late=True,

    result_expires=3600,
)

celery.conf.imports = (
    "workers.tasks",
)