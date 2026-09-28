# Personal Archive

A portfolio concept built around an interactive 3D filing cabinet: open a drawer, pull out a personal folder, and explore projects, photographs, and experience through its pages.

## Status

Blender version 3 is the accepted storyboard baseline. Wave 1A adds a locally verified static fictional reading study and awaits audit before integration; cabinet, camera, and page-turn implementation remain unassigned. See the [Wave 1A report](docs/reviews/wave-1a.md). Final visual polish remains open.

## Run the reading study

Use Node 24.21.0 and bundled npm 11.19.0, then run from the repository root:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321`. For a production preview, stop development, run `npm run build`, then `npm run preview`. Run `python scripts/check_repository.py` and `npm run check` for repository, type, and lint checks.

See [application setup and architecture](docs/application.md) for supported versions, content/public boundaries, and future state ownership. Windows PowerShell users can substitute `npm.cmd` for `npm` when script policy requires it.

See the [Blender study and fresh-checkout instructions](design/blender/README.md). Editable scenes and videos remain local in ignored `artifacts/`; the repository contains rebuilding scripts and review notes.

## Planning documents

- [Concept and scope](docs/concept.md): established direction, visitor goals, content, and open questions.
- [Experience and visual brief](docs/experience.md): proposed scenes, reading layout, navigation, and accessibility behavior.
- [Visual exploration](docs/exploration.md): directions to compare and how to choose the scene composition.
- [Phases and waves](docs/roadmap.md): deliverables, dependencies, and completion criteria.
- [Implementation preparation](docs/implementation-plan.md): the next waves, reading experiment, and validation requirements.
- [Implementation contracts](docs/contracts/README.md): step-by-step assignments, shared responsibilities, review evidence, and the first implementation prompt.
- [Checks and CI](docs/testing.md): what runs now and when application tests will be added.
- [Decision log](docs/decisions.md): confirmed decisions and proposals still being evaluated.
- [Development journal](docs/devlog.md): the process, experiments, and lessons as the project develops.

These documents distinguish the accepted storyboard from open visual and technical choices. Wave 1A selects Astro, TypeScript, and plain CSS for static delivery; no 3D dependency is installed.

Private source documents and their derivatives stay in the ignored local `private/` directory. They are excluded from the public project and must never be served or included in deployment artifacts. See [project guidance](AGENTS.md) for handling rules.

## Direction

- A personal archive with folders, page turns, and Polaroid-style project photographs.
- A coordinated camera sequence from cabinet to open folder, followed by comfortable reading and direct section navigation.
- Accessible content, mobile layouts, and reduced-motion alternatives considered from the beginning.
- Documentation of design decisions, experiments, asset creation, and implementation as the project develops.

## References

Spatial interaction and camera-transition inspiration:

- [Henry Heffernan's portfolio](https://henryheffernan.com/)
- [3D website repository](https://github.com/henryjeff/portfolio-website)
- [OS interface repository](https://github.com/henryjeff/portfolio-inner-site)

The personal archive will have its own art direction and assets.

## Licensing

An open-source license will be selected before reusable implementation is released. Code, reusable assets, and personal portfolio content may have separate licensing terms; public visibility alone does not grant reuse permission.
