# Project guidance

## Private reference material

- The `private/` directory is local-only and ignored by Git. It may contain personal source documents.
- Keep all extracted text, rendered pages, summaries, and other derivatives of private documents inside `private/`.
- Never stage, force-add, commit, push, publish, upload, or serve private reference material. Do not pass it to image-generation services or other external tools.
- Git ignore rules do not prevent a build tool from copying files. Do not import private files into application code or place them in public assets, build outputs, deployment bundles, or CI artifacts.
- Preserve original source files. Make a local copy when a reference is needed; never move the original.
- Private reference material is not publication permission. Public portfolio copy derived from it must be separately reviewed and approved by the owner before entering tracked files.
- Do not add a resume download or public resume PDF unless the owner explicitly supplies and authorizes a separate public version. The private source document must remain private.

## Planning

Read `docs/concept.md`, `docs/experience.md`, and `docs/roadmap.md` before implementing. Keep confirmed decisions distinct from proposals and record consequential changes in `docs/decisions.md`.
