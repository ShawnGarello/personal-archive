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
export const fictionalDocument = {
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
} satisfies ArchiveDocument;
