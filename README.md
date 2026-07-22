                    ##############################################################
                    #                                                            #
                    #   ███╗   ███╗ █████╗ ██╗██╗     ███████╗██████╗            #
                    #   ████╗ ████║██╔══██╗██║██║     ██╔════╝██╔══██╗           #
                    #   ██╔████╔██║███████║██║██║     █████╗  ██████╔╝           #
                    #   ██║╚██╔╝██║██╔══██║██║██║     ██╔══╝  ██╔══██╗           #
                    #   ██║ ╚═╝ ██║██║  ██║██║███████╗███████╗██║  ██║           #
                    #   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝           #
                    #                                                            #
                    #         Automated Email & PDF Generation System            #
                    ##############################################################

Mail Automation is a full-stack application for importing spreadsheet data, previewing recipient rows in the browser, generating party-wise PDF statements, and emailing those statements through an authenticated backend pipeline.

## Overview

The project combines a React + Vite frontend with a FastAPI backend. Users can sign in with Firebase, upload a spreadsheet, review the first rows locally, and submit the file to the backend for processing. The backend reads the uploaded spreadsheet, groups rows by party name, looks up party contact details from Firestore, generates a single PDF per party, and sends the PDF by email.

## Purpose

The main purpose of this system is to automate repetitive mail and statement generation tasks. Instead of manually preparing PDFs and sending them one by one, the application centralizes the workflow into a single upload-and-send process.

## Features

| Feature | Description |
| --- | --- |
| Spreadsheet upload | Accepts `.xlsx`, `.xls`, and `.csv` files from the frontend. |
| Local preview | Shows the first few rows of the uploaded file before submission. |
| Firebase authentication | Uses Firebase Auth to manage user sign-in and session state. |
| Firestore party lookup | Fetches party route, email, and contact details from Firestore. |
| Column normalization | Supports common spreadsheet column aliases such as `Party Name`, `Route`, `Mail`, and `Contact`. |
| Party-wise grouping | Groups rows by party name so multiple bills for the same party are processed together. |
| PDF generation | Creates one PDF statement per party. |
| Email delivery | Sends the generated PDF as an email attachment using SMTP. |
| Backend API | Exposes a FastAPI endpoint for upload and processing. |
| Responsive dashboard | Provides a modern frontend for upload, preview, and workflow tracking. |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, styled-components |
| UI / Motion | Lucide React, Framer Motion, Sonner, React Dropzone |
| State / Forms | React Hook Form, React Router DOM |
| HTTP Client | Axios |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| Backend | Python, FastAPI, Uvicorn |
| Data Processing | Pandas, OpenPyXL |
| PDF Generation | ReportLab |
| Email Delivery | SMTP via Python `smtplib` |
| Configuration | `python-dotenv` |

## Project Structure

```text

Mail_automation/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── routes/
│   │   └── upload.py
│   ├── services/
│   │   ├── email_sender.py
│   │   ├── excel_processor.py
│   │   ├── firestore_service.py
│   │   └── pdf_generator.py
│   ├── credentials/
│   │   └── Firebase service account JSON
│   └── party_details.csv
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       └── services/
└── README.md

```
## System Architechture

```text
                                      ┌─────────────────────────────┐
                                      │          USER               │
                                      │  (Admin / Organization)     │
                                      └──────────────┬──────────────┘
                                                     │
                                                     │ HTTPS
                                                     ▼
                      ┌────────────────────────────────────────────────┐
                      │          REACT + VITE FRONTEND                 │
                      │────────────────────────────────────────────────│
                      │ • Login / Register                            │
                      │ • Dashboard                                   │
                      │ • Upload Excel                               │
                      │ • Email Template                             │
                      │ • SMTP Settings                              │
                      │ • History                                    │
                      │ • Profile                                    │
                      └───────────────┬────────────────────────────────┘
                                      │
               ┌──────────────────────┼────────────────────────┐
               │                      │                        │
               ▼                      ▼                        ▼
      Firebase Authentication     Firestore Database     FastAPI Backend
       (Email / Google)          (Cloud Firestore)        (REST APIs)
               │                      │                        │
               │                      │                        │
               │                      │                        │
               │              ┌───────┴────────┐              │
               │              │                │              │
               │              ▼                ▼              │
               │         User Settings     Party Database     │
               │         Templates         SMTP Settings      │
               │         History           Profile            │
               │                                              │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │   Excel Processor      │
                         │────────────────────────│
                         │ • Read Excel           │
                         │ • Validate Data        │
                         │ • Group by Party Name  │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │ Firestore Party Lookup │
                         │────────────────────────│
                         │ Fetch Email            │
                         │ Fetch Route            │
                         │ Fetch Contact          │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │    PDF Generator       │
                         │────────────────────────│
                         │ Generate BytesIO PDF   │
                         │ No Disk Storage        │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │ Email Template Engine  │
                         │────────────────────────│
                         │ Replace Placeholders   │
                         │ {{partyName}}          │
                         │ {{totalPending}}       │
                         │ {{route}}              │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │ Gmail SMTP Service     │
                         │────────────────────────│
                         │ Authenticate SMTP      │
                         │ Attach PDF             │
                         │ Send Email             │
                         └───────────┬────────────┘
                                     │
                                     ▼
                           ┌────────────────────┐
                           │ Party Email Inbox  │
                           └────────────────────┘

```

## Firestore Architecture

```text

Firestore
│
├── users
│      │
│      └── UID
│            │
│            ├── profile
│            ├── smtp
│            ├── templates
│            ├── settings
│            └── history
│
├── parties
│      │
│      ├── ABC
│      ├── XYZ
│      ├── DEF
│      └── ...

```

## Backend Service Architecture

```text

                 FastAPI

                    │

     ┌──────────────┼───────────────┐

     ▼              ▼               ▼

Upload API     SMTP API      Template API

     │              │               │

     └──────────────┼───────────────┘

                    ▼

            Excel Processor

                    ▼

          Firestore Service

                    ▼

            PDF Generator

                    ▼

        Email Template Engine

                    ▼

            Email Sender

                    ▼

             Gmail SMTP

```

## Complete Workflow

```text

                USER
                  │
                  ▼
         Login/Register
                  │
                  ▼
       Firebase Authentication
                  │
                  ▼
             Dashboard
                  │
                  ▼
         Upload Excel File
                  │
                  ▼
            FastAPI Backend
                  │
                  ▼
       Group Data by Party Name
                  │
                  ▼
    Retrieve Party Details from Firestore
                  │
                  ▼
        Generate PDF (In Memory)
                  │
                  ▼
      Apply Email Template Variables
                  │
                  ▼
        Authenticate Gmail SMTP
                  │
                  ▼
             Send Email
                  │
                  ▼
       Record Status in Firestore
                  │
                  ▼
            Party Receives Email

```

## Backend Setup

### 1. Create and activate a virtual environment

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `backend/.env` file with your SMTP values.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@example.com
SMTP_PASSWORD=your_app_password
```

### 4. Firebase credentials

The backend expects a Firebase service account JSON at:

```text
backend/credentials/mail-automation-83bba-firebase-adminsdk-fbsvc-859cd5b1c9.json
```

If you use a different file name or location, update the service account path in the backend services accordingly.

### 5. Run the backend

```bash
uvicorn app:app --reload
```

The API runs on `http://localhost:8000` by default.

### Backend API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Health check and service status. |
| `POST` | `/api/upload` | Upload a spreadsheet and process party records. |

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

Create a `frontend/.env` file with the API URL and Firebase config.

```env
VITE_API_URL=http://localhost:8000

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run the frontend

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Useful Tips

The spreadsheet should include a `Party Name` column at minimum. The backend can also recognize common aliases such as `Route`, `Mail`, `Contact`, `Bill No.`, `Due Date`, `Amount`, `Payment`, `Pending`, and `Pending Days` when present.

If you see email delivery failures, verify the SMTP username, password, and app-password settings for your mail provider. If Firestore lookups fail, confirm that the service account JSON is present and that the party records exist in the expected collection.

For local development, keep the backend and frontend running in separate terminals so the frontend can call the API while you test uploads and authentication.

## Conclusion

Mail Automation reduces manual effort by combining spreadsheet ingestion, Firestore lookup, PDF generation, and SMTP email delivery into one workflow. The result is a practical system for sending party-wise account statements or similar bulk communications with less repetitive work.

## Contact / Support

For support, replace this section with your actual project contact details, such as:

| Type | Details |
| --- | --- |
| Project owner | Add the maintainer name here |
| Email | Add a support email here |
| Team channel | Add your Slack, Teams, or GitHub Issues link here |

If you want, I can also tailor this README with your real support contact and add screenshots or usage examples.