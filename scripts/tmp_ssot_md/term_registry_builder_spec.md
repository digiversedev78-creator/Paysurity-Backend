# Term Registry Builder Spec

Goal: create `term_registry.json` from `99_GLOSSARY.md`.

Rules:
- Each glossary bullet `- **TERM:** definition` becomes a canonical term record.
- Extract synonyms from parentheticals and cross-references if present.
- Output schema:
  - term (string)
  - definition (string)
  - synonyms (array of strings)
  - category (role/entity/abbrev/module/concept)
  - source_file = "99_GLOSSARY.md"
