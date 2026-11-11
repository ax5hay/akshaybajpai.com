/**
 * Who the set is about, in one place. Small and free of imports so client
 * components (the key plan, the preloader) can read it without pulling in
 * the metadata builders.
 */

export const NAME = 'Akshay Bajpai';
export const HANDLE = 'ax5hay';
/** The headline. Deliberately not a job title: the sheets prove it. */
export const ROLE = 'Boardroom to bare metal';
export const ROLE_LINE = 'Clients · teams · architecture · AI · code';
/** Where a field needs a plain role: schema jobTitle, page titles, the vCard. */
export const JOB_TITLE = 'Technology leader and systems architect';
/** The line under the name on the cover, About and the key plan's title strip. */
export const STANDFIRST =
  'I lead technology from the first client conversation to the release: the architecture, the team, the code, and the runbook after. Built to hold under load and fail loud.';
/**
 * The entity sentence. The Person node, the About sheet's first paragraph and
 * llms.txt all state these facts in this order; change them together.
 */
export const ONE_LINE =
  'Akshay Bajpai is a technology leader and systems architect in New Delhi. He leads technology end to end, from client and executive strategy to production code: multi-tenant LLM platforms, governed natural-language-to-SQL agents, agentic video intelligence for government defence deployments, document AI on AWS, and native desktop software in Rust. He has co-founded three companies and run engineering as CTO at two others. He researches world models and reinforcement learning, and writes essays on systems, cost and trust. Springer author; MSc in Artificial Intelligence with distinction.';
