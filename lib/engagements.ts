import data from '@/data/engagements.json';

/**
 * A-103's content: what is taken on, how the work runs, and the questions
 * answered plainly. One file feeds the sheet, its FAQPage and Person offers,
 * and the "What he takes on" and "Questions" sections of /llms.txt, so the
 * page a person reads and the text a model reads cannot drift apart.
 *
 * Every line must trace to the record (the case studies, About, the brief).
 * The answers are in the third person on purpose: they are written to be
 * quoted whole by an answer engine.
 */
export interface Proof {
  label: string;
  href: string;
}

export interface Offer {
  code: string;
  name: string;
  text: string;
  proof: Proof[];
}

export interface Step {
  name: string;
  text: string;
}

export interface Question {
  q: string;
  a: string;
}

export const ENGAGEMENTS = data as {
  lead: string;
  offers: Offer[];
  method: Step[];
  questions: Question[];
};
