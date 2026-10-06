---
title: "Reinforcement Learning After the Reward Model"
description: "How reasoning models are actually trained now: verifiable rewards instead of learned ones, GRPO and its descendants, RL compute that scales on a curve, and agents trained inside environments. With the engineering lessons for anyone shipping LLM systems."
pubDate: 2026-10-06
---

For a few years the story of post-training was RLHF: collect human preferences, train a reward model on them, optimise the policy against it with PPO. That recipe still exists, but it is no longer where the capability is coming from. The reasoning models of the last eighteen months were made by something simpler and, in a way, more honest. This note is a field survey of that shift, and of what it means for people who build on these models rather than train them.

## The verifier replaces the judge

**Reinforcement learning with verifiable rewards**, RLVR, keeps the RL objective and throws away the reward model. Where a task has a checkable answer, a maths problem, a unit test, a constraint on the output format, a deterministic function decides whether the sampled completion is correct, and the policy is rewarded one or zero. The model explores many reasoning paths and the correct ones are reinforced; nothing is fitted to human taste, and nothing can be gamed except the verifier itself.

The surprising part is how much this unlocks. A 2025 study (Wen et al., *RLVR Implicitly Incentivizes Correct Reasoning in Base LLMs*) argued that RLVR does not merely find answers the base model could already produce by sampling: measured with a metric that credits correct intermediate reasoning, CoT-Pass@K, it extends the reasoning boundary on both maths and code. A 2026 line of evidence (Morris et al.) pushes the other way, suggesting RLVR works less by adding knowledge than by activating and reorganising capability already latent in the base model. Both can be true; what they agree on is that a binary, honest reward on a hard task changes the model's behaviour in ways supervised fine-tuning on gold solutions does not.

Work on extending this beyond checkable domains, such as RLPR, replaces the verifier with the model's own probability of the reference answer, so that the same machinery reaches tasks without a test to run.

## The algorithms got cheaper, then careful

PPO needs a value network the size of the policy. **GRPO** (Shao et al., 2024) removed it: sample a group of completions for the same prompt, use the group's mean reward as the baseline, keep PPO's clipping. Half the memory, and a baseline that matches the structure of the problem.

GRPO's weaknesses showed up at scale, and 2025 was spent fixing them. **DAPO** decoupled the clipping range and raised the upper bound (*clip-higher*) to stop entropy collapsing, and sampled prompts dynamically so that batches are not filled with groups where every completion got the same reward and the gradient is zero. Dr. GRPO corrected a length bias in the original normalisation. GSPO moved the importance ratio from the token to the sequence. The family is now a standard menu, and most labs run a variant of it.

Then came the question of whether any of it scales. *The Art of Scaling Reinforcement Learning Compute for LLMs* (Khatri, Madaan, Agarwal and colleagues, October 2025) spent more than 400,000 GPU-hours answering it. Their findings: RL training follows a sigmoid in compute that can be fitted on small runs and extrapolated to large ones, which they validated on a run of 100,000 GPU-hours; not all recipes reach the same asymptote; and the details people argue about (loss aggregation, normalisation, curriculum, the off-policy scheme) mostly change how fast you get there, not where you end up. They packaged the best combination as **ScaleRL**, an asynchronous recipe built on GRPO. The practical point is that RL post-training can now be budgeted and forecast like pre-training, which is why frontier labs have been raising RL compute by an order of magnitude between model generations.

## From answers to actions

The newest front is **agentic RL**: the policy does not produce an answer, it produces actions, tool calls, code, browser steps, and is optimised over a multi-turn episode against an executable environment. The 2025 survey *The Landscape of Agentic Reinforcement Learning for LLMs* frames it as the move from single-loop tool use to long-horizon decision making with state tracking and policy following.

The bottleneck has turned out to be the environments, not the algorithms. A 2026 survey of *agentic environment engineering* catalogues the problem: environments emulated by another language model hallucinate, drift, and lose state; real environments are slow and expensive to run at the scale RL needs. The response has been a wave of synthesised environments (ToolVerse, "agent world models" that generate task settings on demand), failure-driven training that mines where agents break (SENTINEL), and hybrid rewards that combine step-level and task-level signals so that a long episode is not scored only at its end. The field has, in effect, rediscovered that the training ground is the product.

## What a builder should take from this

I do not train these models. I deploy them, in regulated settings, against databases and documents and people who have to sign off. Four lessons travel.

1. **Verifiers are an asset class.** The labs got further with a binary checker than with a learned judge. The same is true of a production system: a deterministic check on a model's output (the SQL parses, the extracted field matches the schema, the number ties to the source) is worth more than a confidence score, and it is the thing an auditor will accept. Build the verifier before the prompt.
2. **Group-relative thinking applies to evaluation.** GRPO's baseline is the other samples for the same prompt. The cheapest evaluation harness I know follows the same shape: sample several completions, compare within the group, and look hard at the prompts where they disagree. Those are the cases the model has not settled.
3. **Environments beat prompts.** If agentic RL is limited by the fidelity of its environments, then the equivalent in deployment is the fidelity of staging. A staging stack that does not run the same contract as production is the LLM-emulated environment of your own organisation: it hallucinates success. This is why I insist on local parity.
4. **The compute curve is a planning tool.** Once a capability follows a predictable curve, you can price it. That is now true of RL post-training, which means the gap between an open base model and a lab's reasoning model is, increasingly, a budget line rather than a secret.

The reward model was a stand-in for the thing we could not check. The lesson of the last two years is that it pays to find the thing you can.

## Sources

- Lambert et al., [Tülu 3: Pushing Frontiers in Open Language Model Post-Training](https://arxiv.org/abs/2411.15124), the paper that named RLVR.
- Wen et al., [RLVR Implicitly Incentivizes Correct Reasoning in Base LLMs](https://arxiv.org/abs/2506.14245), 2025.
- Yu et al., [RLPR: Extrapolating RLVR to General Domains without Verifiers](https://arxiv.org/abs/2506.18254), 2025.
- Shao et al., *DeepSeekMath* (2024), which introduced GRPO; Yu et al., *DAPO* (2025).
- Khatri et al., [The Art of Scaling Reinforcement Learning Compute for LLMs](https://arxiv.org/abs/2510.13786), October 2025.
- [The Landscape of Agentic Reinforcement Learning for LLMs: A Survey](https://arxiv.org/abs/2509.02547), 2025.
- [Agentic Environment Engineering for Large Language Models: A Survey](https://arxiv.org/abs/2606.12191), 2026; [ToolVerse](https://arxiv.org/abs/2607.15660); [SENTINEL](https://arxiv.org/abs/2606.12908).
- OpenDILab, [awesome-RLVR](https://github.com/opendilab/awesome-RLVR), a maintained reading list.
