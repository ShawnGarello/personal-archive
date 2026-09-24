# Claude project instructions

Read and follow `AGENTS.md` at the repository root before doing any work. It is the shared source of project scope, confirmed design direction, privacy requirements, and Git rules.

## Mandatory commit attribution rules

- Commits must use the existing configured human Git identity.
- Claude must NOT be the commit author or committer.
- Do NOT add Claude as a co-author. Do NOT append `Co-authored-by: Claude`, an Anthropic identity, or any other AI attribution trailer.
- Do NOT add a generated-by-Claude signature or attribution footer to commit messages.
- Do not override Git identity settings or author/committer environment variables. If a valid human identity is unavailable, ask the owner rather than inventing one.
- Check the resulting author, committer, and full commit message before reporting completion.

## Scope and privacy reminders

The current stage is camera storyboard and visual exploration. Do not begin website implementation or production modeling without an explicit request. Review-only assignments stay review-only.

The `private/` directory and every derivative of its contents are local-only. Never commit, force-add, publish, upload, serve, or include them in a build. Never send them to an image-generation service. Public content derived from private sources requires owner approval first. Preserve original source files and work from local copies.

Read `docs/experience.md` and `docs/exploration.md` before proposing visuals. The folder-reading view must have a clean white/off-white background; the cabinet must not remain visible behind the folder. The folder moves without a visible hand, and the main sequence begins with a deliberate click.
