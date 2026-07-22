from fastapi import APIRouter, File, Form, UploadFile
from services.excel_processor import process_party_spreadsheet

router = APIRouter(
    prefix="/api",
    tags=["Upload"]
)

@router.post("/upload")
async def upload_excel(
    file: UploadFile = File(...),
    sender_email: str | None = Form(None),
):
    print("\n" + "="*70)
    print("✅ /api/upload endpoint called")
    print("File:", file.filename)
    print("Sender:", sender_email)
    print("="*70)

    try:
        result = process_party_spreadsheet(
        file=file,
        sender_email=sender_email
    )

        return {
            "status":"success",
            "data":result
        }

    except Exception as e:
        print(e)
        raise