# Project guidance

## Current scope

- Blender V3 is the accepted storyboard baseline. Wave 1A has implemented and locally verified the Astro/TypeScript reading foundation and awaits audit before integration. Wave 1B is the next unassigned wave. Do not begin further website implementation, install additional application stacks, or create production 3D assets unless the owner explicitly assigns that work.
- Follow the task assigned to the current session. A review/audit session reviews artifacts and reports findings; it does not silently become an implementation session.
- Resolve camera choreography and framing before detailed asset production. Concept images are design studies, not proof that a transition works.

## Confirmed experience direction

- A precise, curated personal archive: cabinet, drawer, folder, pages, and Polaroid-style project previews.
- The main entrance sequence is click-triggered. The folder moves without a visible hand; the camera approaches the drawer and follows the folder outward.
- As the folder becomes the reading view, the cabinet leaves the composition. Frame the folder and pages against a clean white/off-white background, with no cabinet visible behind them.
- Keep the folder visually continuous through the transition, then let the camera settle for reading. The outer cover opens left; portrait documents turn upward around a separate top attachment. Preserve V3's accepted sequence. Exact reading distance, timing refinements, and final materials remain open.

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

For visual exploration, also read `docs/exploration.md`. Use fictional placeholder content in public or externally generated studies. Preserve the private-reference rules above.

| Task | Required additional reading |
| --- | --- |
| Implementation planning or a scoped wave | `docs/implementation-plan.md`, `docs/testing.md`, `docs/contracts/README.md`, and the assigned contract in `docs/contracts/` |
| Blender or asset changes | `design/blender/README.md`, `design/blender/README-v3.md`, and the relevant builder/checker |
| Camera, paper, or reading behavior | `docs/experience.md` and the V3 review notes; preserve the accepted sequence |
| Review/audit | Assigned wave's criteria, changed files, validation evidence, and applicable decisions |

Run `python scripts/check_repository.py` for repository checks. See [application setup](docs/application.md) for setup and application verification commands. A successful repository check does not establish Blender geometry or browser behavior.

## Git and commit attribution

- Use the repository's configured human Git identity. Never set an AI assistant, Claude, Anthropic, Codex, or OpenAI as author or committer.
- Do not add AI `Co-authored-by`, `Signed-off-by`, or other attribution trailers, or generated-by signatures to commit messages. In particular, Claude must never be listed as an author or co-author.
- Do not change Git identity or override author/committer environment variables to manufacture attribution. If the configured identity is missing or belongs to an assistant, ask the owner to supply the correct identity.
- Use a brief, factual commit subject. Inspect the staged diff and stage explicit paths; never include private reference material or unrelated work.
- Verify author, committer, and message after committing. Do not rewrite existing history unless explicitly requested.
