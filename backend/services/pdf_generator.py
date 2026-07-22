from __future__ import annotations
from io import BytesIO
from typing import Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Spacer, Table, TableStyle, Paragraph
from datetime import datetime
import pandas as pd


def format_date(value):
    if value is None or value == "":
        return ""

    try:
        if pd.isna(value):
            return ""

        if isinstance(value, datetime):
            return value.strftime("%Y-%m-%d")

        text = str(value)
        return text.split(" ")[0]

    except Exception:
        return str(value)

def format_number(value):
    """Format numbers with commas."""
    if value is None or value == "":
        return ""

    try:
        number = float(value)

        if number.is_integer():
            number = int(number)

        return f"{number:,}"

    except Exception:
        return str(value)
    
def generate_party_pdf_buffer(party_data: dict[str, Any]) -> BytesIO:
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "PartyTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1f2937"),
    )
    body_style = ParagraphStyle(
        "PartyBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#374151"),
    )
    
    subtitle_style = ParagraphStyle(
        "PartySubtitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1f2937"),
        spaceBefore=15,
        spaceAfter=10,
    )

    party_name = str(party_data.get("partyName") or "Party Details")
    
    # 1. Top Section Table (Party info from Firestore)
    info_rows = [
        [Paragraph("Field", body_style), Paragraph("Value", body_style)],
        [Paragraph("Party Name", body_style), Paragraph(party_name, body_style)],
        [Paragraph("Route", body_style), Paragraph(str(party_data.get("route", "")), body_style)],
        [Paragraph("Email", body_style), Paragraph(str(party_data.get("email", "")), body_style)],
        [Paragraph("Contact", body_style), Paragraph(str(party_data.get("contact", "")), body_style)],
    ]

    info_table = Table(info_rows, colWidths=[45 * mm, 105 * mm])
    info_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e5eefc")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("LEADING", (0, 0), (-1, -1), 14),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    story = [
        Paragraph("Account Statement", title_style),
        Spacer(1, 10),
        Paragraph("Consolidated party details and bill summary.", body_style),
        Paragraph(
            f"Generated On : {datetime.now().strftime('%d-%m-%Y %I:%M %p')}",
            body_style
        ),
        Spacer(1, 16),
        info_table,
    ]

    # 2. Bottom Section Table (All bills from Excel mapped to this party)
    bills = party_data.get("bills", [])
    if bills:
        story.append(
            Paragraph(
                f"Bill Details (Total Bills : {len(bills)})",
                subtitle_style
            )
        )
        
        # Table Headers
        bill_rows = [["Bill No.", "Due Date", "Amount", "Payment", "Pending", "Days"]]
        
        # Populate rows
        total_pending = 0
        total_amount = 0
        total_payment = 0

        for bill in bills:

            amount = bill.get("amount", 0)
            payment = bill.get("payment", 0)
            pending = bill.get("pending", 0)

            try:
                total_amount += float(amount)
            except:
                pass

            try:
                total_payment += float(payment)
            except:
                pass

            try:
                total_pending += float(pending)
            except:
                pass

            bill_rows.append([
                bill.get("billNo", ""),
                format_date(bill.get("dueDate", "")),
                format_number(amount),
                format_number(payment),
                format_number(pending),
                bill.get("pendingDays", "")
            ])

        # Add Total Row
        bill_rows.append([
            "",
            "",
            Paragraph("<b>Total</b>", body_style),
            Paragraph(f"<b>{format_number(total_payment)}</b>", body_style),
            Paragraph(f"<b>{format_number(total_pending)}</b>", body_style),
            ""
        ])

        # Widths to perfectly fit standard A4 (approx 174mm total width available)
        bills_table = Table(
            bill_rows,
            colWidths=[
                36*mm,   # Bill No.
                32*mm,   # Due Date
                28*mm,   # Amount
                28*mm,   # Payment
                32*mm,   # Pending
                18*mm    # Days
            ],
            repeatRows=1
        )
        bills_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#475569")), # Dark Slate for Bills Header
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("ALIGN", (2,1), (4,-2), "RIGHT"),
                    ("ALIGN", (5,1), (5,-2), "CENTER"),

                    ("BACKGROUND", (0,-1), (-1,-1), colors.HexColor("#dbeafe")),
                    ("FONTNAME", (0,-1), (-1,-1), "Helvetica-Bold"),
                    ("LINEABOVE", (0,-1), (-1,-1), 1, colors.black),

                    ("BOTTOMPADDING", (0,-1), (-1,-1), 8),
                    ("TOPPADDING", (0,-1), (-1,-1), 8),
                ]
            )
        )
        story.append(bills_table)
    else:
        story.append(Spacer(1, 20))
        story.append(Paragraph("No bills found for this party in the uploaded file.", body_style))

    document.build(story)
    buffer.seek(0)
    return buffer