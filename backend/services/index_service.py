from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from services.excel_processor import (
    dataframe_preview,
    load_spreadsheet,
    normalize_dataframe_columns,
)


# =====================================================
# CREATE INDEX
# =====================================================

def create_index(
    job_id: str,
    excel_path: Path,
):
    """
    Reads the uploaded excel once and creates

    party_index.json

    job_meta.json
    """

    dataframe = load_spreadsheet(
        excel_path.read_bytes(),
        excel_path.name,
    )

    preview_rows = dataframe_preview(dataframe)
    preview_columns = list(dataframe.columns)

    dataframe = normalize_dataframe_columns(dataframe)
    dataframe = dataframe.fillna("")

    if "Party Name" not in dataframe.columns:
        raise Exception(
            "Party Name column not found."
        )

    parties = []

    current_key = 1

    grouped = dataframe.groupby(
        "Party Name",
        sort=False
    )

    for party_name, group in grouped:

        if not str(party_name).strip():
            continue

        row_numbers = group.index.tolist()

        parties.append({

            "partyKey":
                f"P{current_key:06d}",

            "partyName":
                str(party_name).strip(),

            "startRow":
                int(min(row_numbers)),

            "endRow":
                int(max(row_numbers)),

            "totalBills":
                len(group),

        })

        current_key += 1

    job_folder = excel_path.parent

    index_path = job_folder / "party_index.json"

    meta_path = job_folder / "job_meta.json"

    with open(
        index_path,
        "w",
        encoding="utf8"
    ) as f:

        json.dump(
            parties,
            f,
            indent=4,
            ensure_ascii=False
        )

    meta = {

        "jobId": job_id,

        "filename": excel_path.name,

        "sheet": "Sheet1",

        "totalRows": len(dataframe),

        "totalParties": len(parties),

        "createdAt":
            datetime.now().isoformat()

    }

    with open(
        meta_path,
        "w",
        encoding="utf8"
    ) as f:

        json.dump(
            meta,
            f,
            indent=4,
            ensure_ascii=False
        )

    return {

        "partyCount": len(parties),

        "rowCount": len(dataframe),

        "preview": preview_rows,

        "columns": preview_columns,

        "indexPath": index_path,

        "metaPath": meta_path,
    }