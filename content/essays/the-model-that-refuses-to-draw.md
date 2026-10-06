---
title: "The Model That Refuses to Draw"
description: "Generative models predict pixels; JEPA predicts what the pixels mean. Why the refusal to reconstruct is the most important architectural decision in world models, and what it teaches anyone who builds systems."
pubDate: 2026-10-06
---

There is a model family whose defining feature is a refusal. Asked to predict the future of a video, it will not draw the next frame. It predicts the *representation* of the next frame, a vector in a space it invented, and it is scored on whether that vector was right. The pixels never enter into it. This is the Joint Embedding Predictive Architecture, JEPA, which Yann LeCun set out in a 2022 position paper and which, four years on, is the backbone of the world-model work coming out of Meta, out of his new company, and out of a dozen labs following the same line.

The refusal looks like a limitation. It is the whole idea, and it carries a lesson that reaches well past machine learning.

## What a frame costs

Every frame of video is almost entirely noise, in the sense that matters for prediction. The exact arrangement of leaves in a tree, the grain of a wall, the specular glint on a glass: none of it is predictable from the previous frame, and none of it needs to be. A model asked to reconstruct pixels spends most of its capacity on exactly this unpredictable texture, because that is where most of the loss lives. It learns to be a very good renderer of things that do not matter.

JEPA declines the bargain. An encoder maps the context (the frames you have) into a representation; a second encoder maps the target (the frames you are asked about) into the same space; a predictor is trained to get from one to the other. Whatever the encoders decide is not worth representing, the predictor is never penalised for missing. The model is free to throw the leaves away and keep the branch.

The engineering consequence is that the loss is measured in a space the model controls, which is also the obvious danger. If the encoders map everything to the same point, prediction is trivial and the model has learned nothing. This is representation collapse, and for years the field held it off with heuristics: a teacher network updated by moving average, a stop-gradient here, an asymmetric head there. They worked, and nobody could say exactly why.

## Taking the heuristics out

In late 2025 Randall Balestriero and LeCun published LeJEPA, which replaces the heuristics with an argument. They show that the embeddings that minimise downstream prediction risk should follow an isotropic Gaussian, and they introduce a regulariser, SIGReg, that pushes the embedding distribution toward that shape using random one-dimensional projections, in linear time and memory. The predictive loss plus SIGReg is the whole method: one trade-off hyperparameter, no teacher and student, no stop-gradient, and a training loss that tracks the quality of the representation closely enough to be used for model selection without a labelled probe. They report stable training up to a 1.8-billion-parameter vision transformer, and an implementation in about fifty lines.

I find this the most interesting paper in the family, not for the result but for the shape of it. A working system held together by three unexplained tricks was replaced by a system held together by one explained constraint. That is what maturity looks like in any engineering discipline: the moment the folklore becomes a specification.

## From understanding to doing

A representation is only worth having if something can act on it. V-JEPA 2, released by Meta in June 2025, was trained on more than a million hours of internet video and then, with about 62 hours of robot data, produced an action-conditioned predictor that could plan robot arm manipulation in a lab it had never seen: pick a goal image, imagine the latent consequences of candidate actions, pick the best, repeat. V-JEPA 2.1, in March 2026, made the representation denser (every token is supervised, visible and masked alike) and reported a twenty-point improvement in real-robot grasping success over its predecessor.

Notice what the robot never does. It never renders a frame of what the arm will do. It compares abstract summaries of possible futures and chooses between them. That is the claim of the whole programme in one sentence: planning is cheap in a space where only the relevant things are represented, and expensive in a space where everything is.

## The other road

It would be dishonest to present this as the only live approach, because the most spectacular results of the last year came from models that do draw. DeepMind's Dreamer 4 trains an agent entirely inside a learned, generative simulator of Minecraft and is the first to reach diamonds from offline footage alone, a task of more than twenty thousand low-level actions, with a hundred times less action-labelled data than the previous offline agent. Genie 3 generates whole interactive worlds a person can walk through at twenty-four frames a second. These are generative world models, and they work.

The difference is in what the model is for. A simulator you want to look at, or train an agent inside with pixels as the interface, has to draw. A model whose only job is to let a controller choose between futures does not, and every pixel it draws is capacity taken from the judgement it exists to make. LeCun's bet, now funded at a billion dollars at AMI Labs, is that the second kind is what autonomy actually runs on. The year's evidence says both kinds are needed and that the field has not finished deciding where the boundary sits.

## What it teaches the rest of us

I build systems for a living, most of them with language models in the loop, and I have come to read the JEPA refusal as a design principle rather than a research result.

Every system has a reconstruction loss it did not choose. A dashboard that re-derives rates in the browser is reconstructing what the API already computed. A retrieval pipeline that returns whole documents when the question needed one clause is predicting pixels. An agent that narrates every intermediate step to the user is rendering texture nobody asked for. In each case the capacity, human or machine, goes to reproducing the unpredictable surface of the thing rather than the part that determines what happens next.

The discipline JEPA imposes is to ask, before building anything, which representation the decision will actually be made in, and to refuse to compute anything below it. It is a harder question than it sounds, because the surface is what you can see and the representation is what you have to invent. But the systems I trust most, in production and in the literature, are the ones that answered it early and then declined, politely and permanently, to draw.

## Sources

- Yann LeCun, *A Path Towards Autonomous Machine Intelligence* (2022), the position paper that proposed JEPA.
- Balestriero and LeCun, [LeJEPA: Provable and Scalable Self-Supervised Learning Without the Heuristics](https://arxiv.org/abs/2511.08544), November 2025; code at [github.com/rbalestr-lab/lejepa](https://github.com/rbalestr-lab/lejepa).
- Meta AI, [Introducing the V-JEPA 2 world model](https://ai.meta.com/blog/v-jepa-2-world-model-benchmarks/), June 2025.
- [V-JEPA 2.1: Unlocking Dense Features in Video Self-Supervised Learning](https://arxiv.org/abs/2603.14482), March 2026.
- Hafner, Yan and Lillicrap, [Training Agents Inside of Scalable World Models](https://danijar.com/project/dreamer4/) (Dreamer 4), 2025.
- Google DeepMind, [Genie 3](https://deepmind.google/models/genie/).
- TechCrunch, [Yann LeCun's AMI Labs raises $1.03 billion to build world models](https://techcrunch.com/2026/03/09/yann-lecuns-ami-labs-raises-1-03-billion-to-build-world-models/), March 2026.
