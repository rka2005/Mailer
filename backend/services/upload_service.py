from __future__ import annotations

import shutil
from pathlib import Path

from fastapi import UploadFile


# ==========================================================
# PATHS
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOADS_DIR = BASE_DIR / "uploads"


# ==========================================================
# CREATE JOB DIRECTORY
# ==========================================================

def create_job_directory(job_id: str) -> Path:
    """
    Creates the folder structure for one job.

    uploads/
        JOB001/
            temp_pdf/

    Returns
    -------
    Path
        Job directory path.
    """

    job_folder = UPLOADS_DIR / job_id

    temp_pdf = job_folder / "temp_pdf"

    job_folder.mkdir(
        parents=True,
        exist_ok=True,
    )

    temp_pdf.mkdir(
        exist_ok=True,
    )

    return job_folder


# ==========================================================
# SAVE EXCEL
# ==========================================================

def save_excel(
    file: UploadFile,
    job_id: str,
) -> Path:
    """
    Saves the uploaded excel.

    uploads/
        JOB001/
            source.xlsx

    Returns
    -------
    Path
        Saved excel path.
    """

    job_folder = create_job_directory(job_id)

    extension = Path(file.filename).suffix.lower()

    if extension not in [".xlsx", ".xls", ".csv"]:
        raise ValueError(
            "Only Excel and CSV files are supported."
        )

    excel_path = job_folder / f"source{extension}"

    file.file.seek(0)

    with open(excel_path, "wb") as destination:
        shutil.copyfileobj(
            file.file,
            destination,
        )

    return excel_path


# ==========================================================
# GET JOB DIRECTORY
# ==========================================================

def get_job_directory(job_id: str) -> Path:
    """
    Returns

    uploads/JOB001/
    """

    return UPLOADS_DIR / job_id


# ==========================================================
# GET SOURCE FILE
# ==========================================================

def get_source_file(job_id: str) -> Path:
    """
    Returns the uploaded source file.
    """

    job_folder = get_job_directory(job_id)

    for ext in [".xlsx", ".xls", ".csv"]:

        path = job_folder / f"source{ext}"

        if path.exists():
            return path

    raise FileNotFoundError(
        f"No uploaded source file found for {job_id}"
    )


# ==========================================================
# TEMP PDF DIRECTORY
# ==========================================================

def get_temp_pdf_directory(job_id: str) -> Path:
    """
    uploads/JOB001/temp_pdf/
    """

    return get_job_directory(job_id) / "temp_pdf"


# ==========================================================
# DELETE JOB DIRECTORY
# ==========================================================

def delete_job_directory(job_id: str):
    """
    Deletes the complete job folder.
    """

    job_folder = get_job_directory(job_id)

    if job_folder.exists():
        shutil.rmtree(job_folder)