# Forensic Core
### Integrated Secure Data Erasure & Advanced File Recovery Tool for Digital Forensics and Data Sanitization

**Smart India Hackathon 2026**
**Problem Statement ID:** 26149
**Theme:** Blockchain & Cybersecurity
**PS Category:** Software
**Team Name:** Gigabyte

---

## 1. Problem We Are Solving

Organizations, government agencies, law enforcement units, and individuals face two disconnected challenges:

1. **Securely destroying sensitive data** so it cannot be recovered after disposal or reuse of storage media.
2. **Recovering deleted digital evidence** during forensic investigations, often from formatted, damaged, or corrupted media.

Existing tools solve only one side of this problem at a time, forcing investigators to juggle multiple disconnected tools, increasing cost, complexity, and the chance of procedural error. There is no widely available platform that treats sanitization and recovery as **two halves of the same evidentiary process.**

## 2. Our Core Idea

> **Don't just erase data. Prove what was recoverable before sanitization — and prove what remains afterward.**

Forensic Core is a unified platform that closes the loop between destruction and recovery:

```
RECOVER → MEASURE → BASELINE → SANITIZE → RECOVER AGAIN → COMPARE → VERIFY → REPORT
```

Instead of treating "erase" and "recover" as separate tools with separate outputs, our platform uses recovery *as the verification mechanism* for sanitization — producing a certificate that proves, with forensic evidence, that a wipe actually worked.

## 3. Alignment with the Problem Statement

| PS Requirement | Our Solution |
|---|---|
| Secure Drive Eraser (HDD/SSD/USB/memory cards) | Media classification engine identifies drive type and recommends a sanitization method per class (see §7, MVP Scope) |
| Secure File & Folder Eraser with metadata cleansing | File/Folder Sanitization module — target identification, SHA-256 capture, sanitization, status + timestamp logging |
| Advanced File Carving & Recovery (signature-based, structure-based, intelligent) | Sleuth Kit filesystem recovery + raw signature-based carving + structural/parser validation, fused into an explainable confidence score |
| Recovery without filesystem metadata | Raw file carving pipeline operates directly on disk-image bytes independent of filesystem metadata |
| Fragmented file reconstruction | Reconstruction module using structural markers and block/cluster evidence |
| Automatic classification & confidence scoring | Explainable Recovery Confidence: signature validity + structural validity + parser validation + filesystem evidence + integrity, combined into a weighted score |
| Comprehensive audit logs & tamper-resistant reporting | Hash-chained tamper-evident audit trail, with periodic on-chain anchoring (see §5) |
| Compliance with data destruction standards | Sanitization method recommendations are modeled on **NIST SP 800-88 (Clear / Purge / Destroy)** categorization |
| User-friendly GUI | Unified dashboard covering Evidence, Recovery, Sanitization, Verification, Audit, and Reports in one interface |

## 4. What Makes This Different (USP)

1. **Sanitization proven by evidence, not just claimed.** We run recovery before and after sanitization and compare results — the certificate we generate states plainly whether previously identified artifacts are still recoverable.
2. **Explainable confidence, not a black-box score.** Every recovered file's confidence score is broken down into the individual checks that produced it (signature, structure, parser, filesystem evidence, integrity) — auditable by a human reviewer, not just a number.
3. **One platform instead of three tools.** Sanitization, recovery, and verification share one evidence model, one audit trail, and one reporting pipeline.
4. **Tamper-evident audit trail anchored to blockchain.** Our hash-chained audit log periodically anchors its latest hash to a public/testnet blockchain, so audit integrity can be independently verified even outside our own system — directly addressing the hackathon's Blockchain & Cybersecurity theme.
5. **Verification is a testable, falsifiable claim, not a UI badge.** Before/after comparison is implemented as its own module with a strict PASS/FAIL contract based on artifact overlap — not a cosmetic "success" message. We treat "prove it's wiped" as fundamentally different from "say it's wiped."
6. **Chain-of-custody, not just audit logging.** Our tamper-evident trail is framed and structured around chain-of-custody principles consistent with forensic standards such as ISO/IEC 27037 — positioning the platform as producing evidence suitable for investigative and legal use, not just an internal activity log.
7. **Honest negative-result reporting.** The system reports what it could *not* recover, and why — e.g., an artifact with a valid signature but failed parser validation is explicitly classified INVALID rather than silently dropped. Forensic tools that surface their own failure cases are inherently more trustworthy than ones that only report successes.
8. **Independently reproducible verification.** Because every recovery artifact, sanitization result, and audit event is captured as structured JSON, the entire verification procedure can be re-run and independently confirmed by a third party from the exported evidence — not just trusted from a generated PDF certificate.

## 5. Blockchain Usage

Our audit trail is a hash-chained log (each event's hash depends on the previous event's hash, so any retroactive edit breaks the chain). To make this tamper-evidence independently verifiable — not just self-reported — we anchor the latest chain hash and/or final sanitization certificate hash to a blockchain testnet (e.g., Polygon Amoy) via a lightweight smart contract. This means the authenticity of a sanitization certificate can be checked by a third party on a public block explorer, independent of trusting our own servers.

## 6. System Architecture

```
                     USER / INVESTIGATOR
                            │
                            ▼
                      UNIFIED GUI
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   SANITIZATION       FILE RECOVERY      INTELLIGENCE &
   & FILE ERASE       & FILE CARVING      VERIFICATION
        │                   │                   │
        ▼                   ▼                   ▼
  File / Folder /     Sleuth Kit +        Confidence Scoring
  Disk-Image Wipe     Raw Carving +       Baseline / Compare
  Media Classifier    Reconstruction      Audit Trail (chain +
                       + Validation        blockchain anchor)
        │                   │                   │
        └───────────────────┴───────────────────┘
                            ▼
                 CONSOLIDATED REPORT +
                 SANITIZATION CERTIFICATE
```

## 7. Current MVP Scope (Hackathon Build)

Built within a focused development window on **controlled test disk images**, to demonstrate the full evidentiary loop safely:

**Sanitization**
- File, folder, and controlled disk-image sanitization
- Storage-media classification (HDD / SSD / USB / Disk Image / Unknown)
- NIST 800-88–aligned method recommendation
- Safety layer: explicit confirmation, target path + SHA-256 display before any destructive action

**Recovery**
- Sleuth Kit integration (`mmls`, `fsstat`, `fls`, `istat`) for filesystem-based recovery
- Raw signature-based file carving for JPEG, PNG, PDF, DOCX, ZIP
- Fragmented file reconstruction (best-effort, structure-evidence based)
- File validation: signature check, structural check, parser validation, integrity check

**Intelligence & Verification**
- Explainable recovery confidence score
- Aggregate recoverability score
- Pre/post-sanitization baseline comparison
- PASS/FAIL sanitization verification
- Hash-chained, blockchain-anchored audit trail
- Automated forensic report and sanitization certificate generation

### Honest Scope Boundaries (stated upfront, not discovered)

We deliberately scope the hackathon MVP for safety, reliability, and time:

- **Physical drive wiping is not performed automatically in this MVP.** For HDD/SSD/USB targets, the system demonstrates media classification and method recommendation rather than executing destructive wipes on real physical devices — SSD/NVMe wear-leveling in particular makes "permanent deletion" claims unreliable without specialized ATA Secure Erase support, which is flagged as a planned enhancement.
- **Current backend drive-detection is Windows-first** (PowerShell `Get-Disk`/`Get-Volume`). Cross-platform support (Linux `lsblk`, macOS `diskutil`) is a near-term roadmap item; file/folder/disk-image sanitization and recovery themselves are OS-independent.
- **AI/ML-based classification is intentionally excluded from the MVP** in favor of deterministic, explainable checks (signature/structure/parser/filesystem evidence). This is a stronger fit for forensic admissibility than an unexplained model score, and AI-assisted prioritization is listed as a future enhancement, not a gap we're hiding.

## 8. Recovery Confidence Model

Each recovered artifact is scored using a transparent, evidence-weighted formula:

| Check | Weight |
|---|---|
| Valid file signature | 30% |
| Valid internal structure | 25% |
| Parser validation passed | 25% |
| Filesystem evidence present | 20% |

**Recoverability Score** = average confidence score across all currently-recoverable artifacts in a given scan.

**Verification Logic:** Sanitization is marked **PASS** only if the set of artifacts recoverable after sanitization has zero overlap (by SHA-256 / filename+offset) with the pre-sanitization baseline. Any overlap results in **FAIL**.

## 9. Sample Output — Sanitization Certificate

```
==================================================
          SANITIZATION CERTIFICATE
==================================================
Target              : carving.img
SHA-256              : <hash>

PRE-SANITIZATION
Artifacts Recovered : 5
Recovery Confidence : <score>
Recoverability      : <score>

SANITIZATION
Method              : <NIST 800-88 aligned method>
Status              : COMPLETED

POST-SANITIZATION
Artifacts Recovered : 0

VERIFICATION         : PASS
AUDIT INTEGRITY       : VALID (chain-verified + blockchain-anchored)

Statement:
No previously identified artifacts were recovered
under the defined verification procedure.
==================================================
```

---

# SECURITY & SAFETY BOUNDARY

The MVP should operate on **controlled test disk images by default**.

## Mandatory Safety Rules

- Never automatically target system disks.
- Never automatically target `/dev/sda`.
- Never automatically target `/dev/nvme*`.
- Destructive operations require explicit confirmation.
- Display the target path before sanitization.
- Display the SHA-256 hash before sanitization.
- Use controlled test images for destructive demonstrations.
- Do not perform destructive operations on real user data.

---

# ️ SSD / NVMe Limitation

The prototype should not claim universal or permanent deletion, particularly for:

- SSD
- NVMe
- Flash-based storage

For physical storage types, the MVP should primarily demonstrate:

```text
MEDIA CLASSIFICATION
        +
METHOD RECOMMENDATION
```

rather than automatically wiping real physical devices.

---

# AI/ML Scope

AI/ML is intentionally **not included in the working MVP** due to the short development window.

It can be presented as a future enhancement.

Potential future applications include:

- Intelligent artifact classification
- Advanced recovery prioritization
- Fragmented-file prediction
- Automated evidence classification
- Anomaly detection
- Recovery success prediction

---

# ⭐ PROJECT UNIQUE SELLING POINTS

## 1. Primary USP

> **Don't just erase data. Prove what was recoverable before sanitization — and prove what remains afterward.**

---

## 2. Explainable Recovery Confidence

Recovery confidence is supported by understandable forensic evidence such as:

- Valid file signatures
- Structural checks
- Parser validation
- Filesystem evidence

---

## 3. Recoverability Score

A project-defined metric that describes how recoverable an artifact is rather than simply reporting that a file was found.

---

## 4. Before/After Verification

The system establishes a recovery baseline before sanitization and compares it with post-sanitization recovery results.

---

## 5. Tamper-Evident Audit Trail

Hash-chained audit events make changes to recorded workflow information detectable.

This is an audit-integrity mechanism and **not blockchain**.

---

## 6. Automated Reporting & Certificate

The system generates a consolidated result containing:

- Target information
- Sanitization details
- Recovery findings
- Verification outcome
- Audit integrity
- Certificate/report

---

# MVP Scope

The working MVP focuses on:

### Team 1

- File sanitization
- Folder sanitization
- Controlled disk-image sanitization
- Storage-media classification
- Sanitization method recommendation
- Safety controls
- SHA-256 capture
- Sanitization reporting

### Team 2

- Sleuth Kit integration
- Filesystem analysis
- Deleted-file identification
- Deleted-file recovery
- Raw file carving
- JPEG recovery
- PNG recovery
- PDF recovery
- DOCX recovery
- ZIP recovery
- Fragmented-file reconstruction
- Recovery validation
- Recovery metadata

### Team 3

- Explainable recovery confidence
- Recoverability Score
- Pre-sanitization baseline
- Post-sanitization comparison
- Sanitization verification
- PASS/FAIL determination
- Hash-chained audit trail
- Audit integrity verification
- Automated forensic report
- Sanitization certificate

---

# MVP Limitations

The prototype does not claim:

- Universal file recovery
- Guaranteed fragmented-file recovery
- Universal filesystem support
- Permanent deletion on all storage technologies
- Automatic wiping of real physical system drives
- Commercial forensic-suite capabilities
- AI/ML-based recovery during the MVP

---

# Future Enhancements

Possible future improvements include:

- More filesystem support
- More file formats
- Advanced fragmented-file reconstruction
- Advanced file parsers
- Parallel carving
- Large-image optimization
- Duplicate artifact detection
- Advanced evidence visualization
- Advanced recovery scoring
- AI/ML-assisted artifact classification
- Additional storage sanitization standards
- Enterprise-scale reporting
- Cloud-based forensic investigation
- Case management
- Multi-user investigator workflows

---

# ️ Technology Stack

The prototype may use the following technologies:

## Operating System

- Linux
- Ubuntu
- WSL2

## Digital Forensics

- The Sleuth Kit
- `mmls`
- `fsstat`
- `fls`
- `istat`

## File Recovery

- Raw byte scanning
- File signatures
- Magic bytes
- File structure analysis
- File carving
- File reconstruction
- File validation

## Security

- SHA-256
- Hash-chained audit logs
- Integrity verification

## Application

- Unified GUI
- Backend/API
- JSON-based metadata
- Automated reporting

---

# Evidence & Audit Model

The system maintains evidence throughout the entire workflow.

```text
TARGET
  │
  ├── Target Path
  ├── Target Type
  └── SHA-256
        │
        ▼
RECOVERY EVIDENCE
  │
  ├── File Type
  ├── Offset
  ├── Size
  ├── Recovery Method
  ├── Validation
  └── Hash
        │
        ▼
SANITIZATION RESULT
  │
  ├── Method
  ├── Status
  └── Timestamp
        │
        ▼
POST-RECOVERY EVIDENCE
        │
        ▼
COMPARISON
        │
        ▼
VERIFICATION
        │
        ▼
AUDIT TRAIL
        │
        ▼
FINAL REPORT
```

---

# Final System Concept

The entire platform can be summarized as:

```text
┌─────────────────────────────────────────────────────────────┐
│                  INTEGRATED FORENSIC TOOL                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    CONTROLLED TEST IMAGE                   │
│                              │                              │
│                              ▼                              │
│                       FILE RECOVERY                         │
│                              │                              │
│                    ┌─────────┴─────────┐                    │
│                    │                   │                    │
│                    ▼                   ▼                    │
│               SLEUTH KIT          RAW CARVING               │
│                    │                   │                    │
│                    └─────────┬─────────┘                    │
│                              ▼                              │
│                         VALIDATION                           │
│                              │                              │
│                              ▼                              │
│                    RECOVERY CONFIDENCE                      │
│                              │                              │
│                              ▼                              │
│                         BASELINE                            │
│                              │                              │
│                              ▼                              │
│                       SANITIZATION                          │
│                              │                              │
│                              ▼                              │
│                    RECOVERY AGAIN                           │
│                              │                              │
│                              ▼                              │
│                    BEFORE / AFTER                           │
│                       COMPARISON                             │
│                              │                              │
│                              ▼                              │
│                         VERIFY                              │
│                              │                              │
│                              ▼                              │
│                    AUDIT + REPORT                           │
│                              │                              │
│                              ▼                              │
│                  SANITIZATION CERTIFICATE                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# ‍ Team Responsibilities Summary

```text
┌─────────────────────────────────────────────────────────────┐
│                         TEAM 1                              │
│                DATA SANITIZATION                            │
│                                                             │
│  FILE ERASE → FOLDER ERASE → IMAGE SANITIZATION            │
│              → MEDIA CLASSIFICATION                        │
│              → METHOD RECOMMENDATION                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         TEAM 2                              │
│                     FILE RECOVERY                            │
│                                                             │
│  ANALYZE → FIND → RECOVER → CARVE → RECONSTRUCT             │
│                     → VALIDATE                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         TEAM 3                              │
│             FORENSIC INTELLIGENCE & VERIFICATION             │
│                                                             │
│  SCORE → BASELINE → COMPARE → VERIFY → AUDIT → REPORT       │
└─────────────────────────────────────────────────────────────┘
```

---

# Final Outcome

The final prototype brings all three teams together into one closed-loop forensic platform.

```text
             RECOVER WHAT EXISTS
                     │
                     ▼
             MEASURE RECOVERY
                     │
                     ▼
             RECORD BASELINE
                     │
                     ▼
              SANITIZE DATA
                     │
                     ▼
            ATTEMPT RECOVERY
                     │
                     ▼
             COMPARE RESULTS
                     │
                     ▼
              VERIFY RESULT
                     │
                     ▼
            PROVE THE OUTCOME
                     │
                     ▼
          GENERATE REPORT/CERTIFICATE
```

The goal is not merely to erase data or recover files independently.

The goal is to provide an **evidence-driven, measurable, and verifiable workflow for data sanitization and forensic file recovery**.

---

# License

This project is developed for educational, research, and **Smart India Hackathon (SIH) 2026** prototype purposes.


# Developer Guide

Welcome to the Secure Data Sanitization and File Recovery System developer guide! This document provides instructions on how to set up the local development environment, start the backend API, and run the frontend React application.

---

## ️ Project Structure Overview

This repository is split into two primary components:

1. **Backend Application (`app/`)**
   A Python-based FastAPI server handling API requests, file parsing, and system-level interactions (such as physical and logical drive detection via PowerShell).
2. **Frontend Application (`SIH-GUI/secureerase-sih/`)**
   A modern React web interface built with Vite, which interacts with the Python backend.

---

## ️ Prerequisites

Before you start, make sure you have the following installed on your machine:
- **Node.js** (v16+ recommended) and **npm** for the frontend.
- **Python 3.8+** for the backend server.
- **Windows OS** with **PowerShell** (the backend script leverages PowerShell for scanning connected drives).
- **Admin privileges** (running the backend with Administrator privileges is required if you plan on running raw drive recovery endpoints).

---

## Setting Up the Backend

The backend is a FastAPI server located in the `app/` folder. Since the `requirements.txt` might be missing some modules or empty, you will need to install the dependencies based on imports.

### 1. Create and Activate a Virtual Environment
It is highly recommended to use a virtual environment to manage dependencies.
Open your terminal in the root directory (where this guide is located):

```bash
# Create a virtual environment
python -m venv venv
venv\Scripts\activate

pip install fastapi uvicorn pydantic python-multipart

# Run the backend (from repo root, since app/ is a module)
uvicorn app.main:app --reload
```

- API: `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`

## Frontend Setup

```bash
cd SIH-GUI/secureerase-sih
npm install
npm run dev
```

- App: `http://localhost:5173`

## How It Works

- The React frontend (`5173`) calls the FastAPI backend (`8000`); CORS is currently open (`*`) for development.
- `/api/drives` uses `subprocess.run` to call PowerShell (`Get-Disk`, `Get-Volume`) for drive detection.
- `/api/upload` saves uploaded disk images to a local `data/` folder (created automatically).
- `/api/recover` delegates to `RecoveryEngine` in `app.recovery`.
- **Raw File Carving:** The carving pipeline (`carver.py`) operates completely independently of filesystem metadata. It streams raw disk bytes using a memory-efficient sliding window (40MB chunks, 5MB overlap). By identifying file signatures (headers/footers) for JPEGs, PNGs, PDFs, and ZIPs, it extracts the raw binary. For complex formats like DOCX (which share ZIP signatures), it dynamically parses the internal archive structure (`word/document.xml`) to confidently classify and recover the artifact.

## Troubleshooting

- **PowerShell commands failing:** Run the backend as Administrator and ensure PowerShell script execution is permitted.
- **Port already in use:**
  - Backend: `uvicorn app.main:app --reload --port 8080`
  - Frontend: `npm run dev -- --port 3000`

---

*Developed for Smart India Hackathon 2026 — Problem Statement 26149 — Team Gigabyte.*