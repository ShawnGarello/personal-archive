# Concept and scope

Status: working draft. This records the conversation so far; proposals are not final design decisions.

## Established direction

Personal Archive is a portfolio website presented as a physical archive. A visitor opens a cabinet, moves closer to a drawer, selects a personal folder, and explores its pages. The folder contains information about the owner, a resume, projects, and images presented in Polaroid-style frames.

The owner has chosen a precise, curated personal archive with the feeling of a case file. Henry Heffernan's portfolio is a reference for 3D presentation and camera transitions, while this project will develop its own setting, visual identity, and interactions.

The project is intended to become open source. Documentation should explain both the implementation and the process: experiments, visual decisions, asset production, problems, and solutions.

## Audience and purpose

The site introduces its owner and presents their work to software engineering recruiters, fellow developers, and people interested in design and UI/UX. It should remain inviting to a broad public audience. The owner explicitly wants everyone to be able to see and enjoy the portfolio.

Recruiters need to understand the engineering work and find relevant background quickly. Developers and design-minded visitors may spend longer exploring the interaction and how it was built. This suggests two complementary paths: direct content access and optional exploration of the archive. The owner's exact role statement, technical specialty, and featured projects still need to be specified.

Proposed visitor outcomes:

- Understand who the owner is and what kind of work they do.
- Inspect a project and understand the owner's contribution.
- Find a resume and a way to make contact.
- Explore the archive for its personality and craft.
- Find the public repository and learn how the experience was made.

## Proposed first release

One cabinet and one featured personal folder provide a complete path through the portfolio. The folder contains an introduction, selected projects, experience/resume, and contact information. The page metaphor supports the content without forcing visitors to browse everything in order.

The number and order of projects depend on the real content inventory. Empty decorative folders should not imply that unavailable content can be opened.

Proposed exclusions for the first release: a full navigable room, an OS simulation, user accounts, a content management system, and a public contact-form backend. These can be reconsidered if a concrete need emerges.

## Content inventory to prepare

| Content | Needed material | Current state |
| --- | --- | --- |
| Introduction | Display name, role, short bio, optional portrait | Not supplied |
| Projects | Title, summary, contribution, process, outcome, links | Not selected |
| Project media | Screenshots, photographs or demos, captions and alt text | Not supplied |
| Experience | Relevant work, education, or other background | Not supplied |
| Resume | A document suitable for public download | Not supplied |
| Contact | Public contact channel and selected profile links | Not supplied |
| Making-of | Repository link, milestone notes, selected experiments | Repository available |

Do not invent results, testimonials, employment details, or project metrics. Keep unpublished personal material out of the public repository.

## Proposed success criteria

- A first-time visitor can identify the owner and reach a featured project without guessing how to operate the scene.
- A visitor can access resume and contact information without completing the entrance animation.
- The folder remains readable on a phone and usable with a keyboard.
- Portfolio content is available when motion is reduced or 3D rendering is unavailable.
- A developer can follow the documented setup and understand the major implementation decisions.

## Open questions

1. What role statement and kinds of engineering work should the portfolio communicate?
2. Which projects and personal artifacts belong in the first release?
3. What is the cabinet made of, where is it situated, and where does the folder rest when opened?
4. Which lighting, palette, and typography best express the precise, curated case-file direction?

## References

- [Henry Heffernan's portfolio](https://henryheffernan.com/): spatial presentation and camera-transition inspiration.
- [Outer 3D repository](https://github.com/henryjeff/portfolio-website).
- [Inner OS repository](https://github.com/henryjeff/portfolio-inner-site).

Source inspection found camera transitions in the outer repository and a separate webpage embedded in the monitor. The live animated scene was not interactively verified during initial research. Reference research should distinguish source-code findings from observed browser behavior.
