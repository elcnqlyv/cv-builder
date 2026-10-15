---
name: cv-builder
description: Create, edit, tailor, and proofread CVs and resumes, delivered as clean ATS-friendly Word (.docx) and PDF files. Use this skill whenever the user mentions a CV, resume, résumé, curriculum vitae, job application documents, updating or refreshing their CV, adding a job/certification/project to it, tailoring it to a vacancy or job posting, rewriting bullet points or a summary, or fixing the wording of a CV, or when they upload a CV/resume file. Trigger even if they don't say "ATS" or name a file format.
---

# CV Builder

Build and maintain CVs/resumes as two files: a `.docx` (editable) and a `.pdf` (send-ready). The default design is plain, single-column and ATS-friendly, because most applications pass through applicant-tracking software first, and fancy layouts (columns, tables, text boxes, icons) often scramble or drop content when parsed.

The approach: keep the **content** in a small JSON file, and let a bundled script **render** it. This keeps formatting consistent across create/edit/tailor runs, so you spend effort on wording rather than fighting Word formatting.

## Step 1: Identify the mode

Users often combine these. Identify which apply:

| Mode | Trigger | Go to |
|---|---|---|
| **Create** | No CV yet, or "make me a CV" | Step 2, then Step 3 |
| **Edit** | Uploaded CV or "add/change/remove X" | Step 2 (Edit), then Step 3 |
| **Tailor** | A job posting/vacancy is provided | `references/content-guidelines.md` § Tailoring |
| **Proofread** | "Fix/improve the wording" | `references/content-guidelines.md` § Proofreading |

## Step 2: Gather inputs, and ask before building

Ask a few targeted questions before producing files. A CV built on guesses wastes the user's time, and a wrong fact in a CV can cost them an interview. Skip anything already answered in the conversation or the uploaded file, and ask in one batch rather than one at a time.

Typically worth confirming (only what's missing):
- **Target**: the role/industry, or the job posting itself (paste or file).
- **Region and conventions**: sets page size and what personal details to include (see below).
- **Language** of the CV.
- **Length preference**: default 1 page under ~10 years of experience, otherwise 2.
- **Missing facts that matter**: dates, employers, measurable results. Ask for numbers instead of inventing them.

**Regional defaults** (use when the user doesn't say otherwise):
- US/Canada: Letter size, no photo, no date of birth, no marital status.
- Everywhere else: A4. Photo/date of birth are optional and region-dependent, so ask rather than assume. Leave them out by default, since they trip ATS parsing and add bias risk.

### Honesty rule

Never invent employers, titles, dates, degrees, certifications, tools, or metrics. Tailoring means selecting, reordering and rephrasing what is true, and mirroring the vacancy's vocabulary where it genuinely applies. If the posting requires something the CV doesn't show, say so in your summary instead of papering over it.

### Edit mode: choose the approach

Read the uploaded file first: `pandoc -t markdown cv.docx` for Word, or the `pdf-reading` skill for PDFs.

- **Small change, user likes their current design** (fix a date, add one bullet): edit in place following the `docx` skill's unpack → edit `word/document.xml` → zip → validate flow. This preserves their formatting exactly. Tell the user you edited in place.
- **Heavily designed source** (tables, columns, text boxes, images) **or the user wants a refresh/restyle, or the source is a PDF**: transcribe into the JSON schema and rebuild. Say so briefly, and mention the new version is single-column for ATS reasons. A PDF can't be edited cleanly in place, so rebuild.

When rebuilding, carry over every fact from the original unless told to drop it, and diff your JSON against the source text before rendering so nothing silently disappears.

## Step 3: Build

1. Write the content to `cv.json`. The schema and a full example are in `references/cv-schema.md` and `assets/example-cv.json`.
2. Render the Word file:
   ```bash
   node scripts/build_cv.js cv.json /mnt/user-data/outputs/Firstname_Lastname_CV.docx
   ```
3. Convert to PDF and make page previews:
   ```bash
   bash scripts/render.sh /mnt/user-data/outputs/Firstname_Lastname_CV.docx /tmp/cv-preview
   ```
   Copy the resulting PDF into `/mnt/user-data/outputs/`.
4. **Look at the previews** (use `view` on the `.jpg` files) and check:
   - Page count matches the target length, and no section heading is stranded at the bottom of a page.
   - Special characters and diacritics render correctly (e.g. ə, ş, ğ, ü, é).
   - Right-aligned dates line up; nothing wraps awkwardly.
   - Text extracts in a sane order: `pdftotext -layout file.pdf - | head -60`.
   If something is off, fix the JSON (shorten a bullet, tighten the summary) and rebuild. Avoid shrinking fonts below 10pt to force a fit; cut content instead, since recruiters skim.
5. Deliver with `present_files`: `.docx` first, then `.pdf`.

When tailoring, keep the master CV untouched and save the tailored one under a different name (e.g. `Firstname_Lastname_CV_CompanyName.docx`).

## Step 4: Reply briefly

After delivering, give a short summary: what you created or changed, assumptions you made (region, page size, anything dropped), and any gaps against the job posting. No long explanation of the file itself; they can open it.

## Layout rules (why the default design looks plain)

- Single column, standard fonts (Calibri by default), real bullets, real headings.
- Contact details in the body, not in a header/footer, because many parsers skip headers and footers.
- Standard section names (Summary, Experience, Education, Skills, Certifications, Projects) so parsers classify them.
- Reverse-chronological order, consistent date format (`Mar 2022 – Present`).
- No tables, text boxes, images, icons, or skill-level bars or star ratings.

If the user explicitly asks for a designed/creative layout, offer it as a separate variant alongside the ATS version rather than replacing it, and build it with the `docx` skill directly.

## Files in this skill

- `scripts/build_cv.js`: JSON → `.docx` renderer (uses the preinstalled `docx` npm package).
- `scripts/render.sh`: `.docx` → PDF + page preview images.
- `references/cv-schema.md`: JSON fields and section types.
- `references/content-guidelines.md`: writing bullets and summaries, tailoring to a posting, proofreading checklist, sections for technical profiles.
- `assets/example-cv.json`: a complete working example (placeholder person).
