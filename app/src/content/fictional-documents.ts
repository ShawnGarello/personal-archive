export interface ArchiveDocument {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly introduction: readonly string[];
  readonly project: {
    readonly title: string;
    readonly summary: string;
    readonly approach: string;
    readonly reflection: string;
    readonly link: { readonly label: string; readonly href: string };
  };
}

// Invented independently for layout review. This is not the owner's biography.
// Reading order is array order; the first document is on top of the stack.
export const fictionalDocuments = [
  {
    id: 'fictional-field-notes',
    label: 'Fictional sample · Document 1',
    title: 'Small tools for shared places',
    introduction: [
      'This is an invented archive entry about Rowan Vale, an imaginary designer who makes simple tools for community spaces. The person, project, and observations on this page are fictional.',
      'Rowan is interested in the ordinary moments between a plan and its use: finding a borrowed object, leaving a clear note, or understanding what happens next. Their imagined practice begins with listening, then turns a complicated process into a few understandable steps.',
    ],
    project: {
      title: 'The Lantern Library',
      summary: 'A fictional lending desk for a neighborhood collection of lamps, lanterns, and repair tools. The proposed catalogue helps visitors find an item, understand its condition, and leave useful notes for the next borrower.',
      approach: 'The study follows one object from the shelf to a reservation and back again. A short description sits beside availability and care instructions. When a lantern needs repair, the catalogue explains the next step in plain language instead of leaving an unexplained status code. Longer notes stay in the reading flow so they remain useful on a small screen.',
      reflection: 'The open question is how much detail belongs in the first view. A future study could compare a brief summary with a longer maintenance history, asking readers to find the same information in each. No research, launch, or measured outcome is claimed for this fictional project.',
      link: {
        label: 'Read about lending libraries on Wikipedia',
        href: 'https://en.wikipedia.org/wiki/Library_of_things',
      },
    },
  },
  {
    id: 'fictional-sunroom-studies',
    label: 'Fictional sample · Document 2',
    title: 'A daylight notebook for small rooms',
    introduction: [
      'This second invented entry continues the imaginary practice of Rowan Vale. Nothing on this page describes a real person, client, room, or result.',
      'Here Rowan keeps a notebook about daylight in compact homes: where morning light falls, which surfaces soften it, and how a small change in a curtain or shelf alters the way a room is used through the day.',
    ],
    project: {
      title: 'Sunroom Studies',
      summary: 'A fictional set of paper models and hand-drawn plans comparing light, shade, and materials in three small rooms. Each study pairs one sketch with a short note about what a resident might notice.',
      approach: 'Every model is photographed at the same three imagined times of day. The notes describe the change in plain words rather than measurements, so a reader can compare rooms without technical background. A later page would place the sketches beside each other and let the reader move between them in order.',
      reflection: 'The unresolved question is whether the notebook should favour a few careful comparisons or many quick observations. No building, survey, or measured outcome is claimed for this fictional study.',
      link: {
        label: 'Read about daylighting on Wikipedia',
        href: 'https://en.wikipedia.org/wiki/Daylighting',
      },
    },
  },
] as const satisfies readonly ArchiveDocument[];
