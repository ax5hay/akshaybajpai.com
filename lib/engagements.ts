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

/** The correspondence subjects an offer opens the transmittal under. */
export type Subject = 'Technology leadership' | 'AI platform or agent' | 'Architecture review' | 'Speaking';

export interface Offer {
  code: string;
  name: string;
  text: string;
  proof: Proof[];
  subject: Subject;
}

export interface Step {
  name: string;
  text: string;
  /** The course of the construction sequence, in the set's own terms. */
  course: string;
  /** What the stage leaves on the table. */
  leaves: string;
}

/** What a system has to survive, offered as chips in the brief composer. */
export interface Constraint {
  id: string;
  name: string;
  /** The record behind it, in one line, with its numbers. */
  note: string;
  /** Case studies that show it, by href. */
  proof: string[];
}

/** A sheet a link resolves to, for the leaders and the composer. */
export interface SheetRef {
  sheet: string;
  title: string;
}

export interface Question {
  q: string;
  a: string;
}

export const ENGAGEMENTS = data as {
  lead: string;
  offers: Offer[];
  method: Step[];
  constraints: Constraint[];
  questions: Question[];
};

/** Question anchors, numbered as the sheet prints them. */
export const questionId = (i: number) => `q-${String(i + 1).padStart(2, '0')}`;
