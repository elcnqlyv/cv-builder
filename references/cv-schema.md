# cv.json schema

Top level:

```json
{
  "meta": { "page": "A4", "font": "Calibri", "fontSize": 10.5, "margin": 0.75, "accent": "000000", "headerAlign": "center" },
  "name": "Full Name",
  "title": "Professional headline (optional)",
  "contact": ["email", "phone", "City, Country", "linkedin.com/in/handle"],
  "sections": [ ... ]
}
```

- `meta` is optional; every field has the default shown. `page` is `"A4"` or `"Letter"`. `margin` is in inches. `accent` is a hex colour for the name and section rules (keep black or a dark navy for print and ATS safety). `headerAlign` is `"center"` or `"left"`.
- `contact` items are joined with ` | `. Write URLs without `https://`. Leave out anything the user didn't provide.
- `sections` render in order. Order guidance is in `content-guidelines.md`.

## Section types

Every section has `heading` (use standard names: Summary, Experience, Education, Skills, Certifications, Projects, Languages) and `type`.

### `text`: a paragraph
```json
{ "heading": "Summary", "type": "text", "text": "Two to four lines." }
```

### `entries`: jobs, degrees, projects
```json
{ "heading": "Experience", "type": "entries", "items": [
  {
    "title": "Senior Engineer",
    "org": "Company Name",
    "location": "City, Country",
    "dates": "Mar 2021 – Present",
    "note": "Optional one-line context under the title",
    "bullets": ["Achievement one", "Achievement two"]
  }
]}
```
Line 1 is the bold `title` with right-aligned `dates`. Line 2 is italic `org, location`. For Education, use degree as `title` and the university as `org`. All fields except `title` are optional.

### `skills`: grouped skill lines
```json
{ "heading": "Skills", "type": "skills", "items": [
  { "label": "Languages", "value": "Python, Bash, SQL" },
  "A plain string also works"
]}
```

### `list`: bulleted lines (certifications, publications)
```json
{ "heading": "Certifications", "type": "list", "items": ["Cert Name, Issuer (2024)"] }
```

### `lines`: plain unbulleted lines (languages, interests)
```json
{ "heading": "Languages", "type": "lines", "items": ["English: fluent", "Azerbaijani: native"] }
```

## Inline emphasis

`**bold**` works in bullets, notes, text and skill values. Use it sparingly (a key tool or a headline number), since heavy bolding makes a CV harder to skim.

## Characters

Use real en dashes (–) in date ranges and keep the JSON in UTF-8 so non-English characters (ə, ş, ğ, ü, é, ñ) survive. Avoid emoji and decorative symbols, because ATS parsers drop or mangle them.
