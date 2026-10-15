# cv-builder

A Claude skill for creating, editing, tailoring, and proofreading CVs/resumes. It produces clean, ATS-friendly Word (.docx) and PDF files.

## What it does
- **Create** a CV from scratch
- **Edit** an uploaded CV (in place, or rebuilt into a clean single-column layout)
- **Tailor** a CV to a job posting without inventing experience
- **Proofread** and improve wording

Content lives in a small JSON file and `scripts/build_cv.js` renders it, so formatting stays consistent across runs.

## Install
Download `cv-builder.skill` from the Releases page (or zip the `cv-builder` folder), open it in Claude, and click **Save skill**.

## Layout
- `SKILL.md`: skill instructions
- `scripts/`: `build_cv.js` (JSON to .docx), `render.sh` (.docx to PDF and previews)
- `references/`: JSON schema and content-writing guidelines
- `assets/example-cv.json`: working example with placeholder data

## Requirements
Node.js with the `docx` package, LibreOffice, and Poppler (`pdftoppm`, `pdfinfo`).
