# Personal Archive

A portfolio concept built around an interactive 3D filing cabinet: open a drawer, pull out a personal folder, and explore projects, photographs, and experience through its pages.

## Status

Blender version 3 is the accepted storyboard baseline. Implementation planning is underway; no website implementation yet. Final visual polish and responsive reading behavior remain open.

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

These documents distinguish the accepted storyboard from open visual and technical choices. The implementation stack has not been selected.

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
