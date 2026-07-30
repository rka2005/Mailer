from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from services.job_service import get_job
from services.job_manager import start_job

router = APIRouter(
    prefix="/api",
    tags=["Upload"]
)


@router.post("/upload")
async def upload_excel(
    file: UploadFile = File(...),
    sender_email: str | None = Form(None),
):
    return start_job(
        file=file,
        sender_email=sender_email,
    )


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    job = get_job(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "status": "ok",
        "data": job,
    }