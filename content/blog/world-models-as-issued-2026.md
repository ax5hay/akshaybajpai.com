---
title: "World Models, As Issued: The State of the Set in October 2026"
description: "A field survey of where world models actually stand: V-JEPA 2.1, LeJEPA, Dreamer 4, Genie 3, Marble and Atlas, Cosmos, and a billion-dollar bet in Paris. What shipped, what it cost, and what it is for."
pubDate: 2026-10-06
---

"World model" has become the phrase every lab reaches for, and it now covers at least three different things. This note is a survey of what has actually been issued, with dates and figures, sorted by what each system is for. I have kept to what the papers and announcements say and marked where I am inferring.

## Three kinds of world model

It helps to separate them first.

1. **Latent predictors.** The model learns a representation of the world and predicts how that representation evolves. It never draws anything. Its purpose is planning and control. This is the JEPA line.
2. **Generative simulators.** The model renders what the world will look like, frame by frame, often conditioned on actions. Its purpose is to be a training ground for agents, or to be looked at. Dreamer, Genie and Cosmos live here.
3. **Spatial generators.** The model produces an explorable 3D scene from a prompt or a few images. Its purpose is content, simulation and, increasingly, robot training data. World Labs lives here.

The three overlap at the edges, and the most interesting 2026 systems sit on an edge.

## Latent predictors

**V-JEPA 2** (Meta, June 2025) was the first video-trained world model to show zero-shot robot planning. It is a 1.2-billion-parameter model pretrained on more than a million hours of internet video and about a million images; an action-conditioned variant, V-JEPA 2-AC, was then trained on roughly 62 hours of robot data and used for model-predictive control on a real arm, in a new lab, with no task-specific training.

**V-JEPA 2.1** (March 2026) is the same family with a denser objective. Every token is supervised, visible and masked alike; self-supervision is applied at intermediate encoder layers, not only the last; images and video get separate tokenizers feeding one shared encoder. The paper reports a 20-point improvement in real-robot grasping success over V-JEPA 2-AC, and state-of-the-art figures on short-term object interaction, action anticipation, depth estimation and a robotic navigation benchmark.

**LeJEPA** (Balestriero and LeCun, November 2025) is a training method, not a model. It identifies the isotropic Gaussian as the embedding distribution that minimises downstream risk, and enforces it with a regulariser, SIGReg, that works through random one-dimensional projections in linear time. The result is JEPA training with no teacher-student pair, no stop-gradient, one hyperparameter, and a loss that correlates with linear-probe accuracy closely enough to select models without labels. They report stable runs up to a 1.8-billion-parameter ViT. Follow-on work in 2026 has already proposed variants of the regulariser and applied the recipe to EEG.

**AMI Labs** (Paris, launched March 2026) is where this line is now being pursued commercially. Yann LeCun, who left Meta, is chairman; Alexandre LeBrun is CEO. The seed round was $1.03 billion at a $3.5 billion pre-money valuation, led by Cathay Innovation, Greycroft, Hiro Capital, HV Capital and Bezos Expeditions, with Nvidia and Samsung among the other backers. The stated plan is JEPA-based world models that learn from sensory data rather than text, and a commitment to open-sourcing much of the code. LeBrun has said commercial applications are some way off.

## Generative simulators

**Dreamer 4** (Hafner, Yan and Lillicrap, 2025) is the clearest result of the year. The agent is trained entirely inside a learned world model of Minecraft, with no interaction with the real game, and is the first to reach diamonds from offline data alone, a task that needs more than twenty thousand mouse and keyboard actions from raw pixels. It outperforms OpenAI's VPT offline agent with a hundred times less action-labelled data, and the world model runs in real time on a single GPU. The world model is trained on a large corpus of unlabelled gameplay video with actions supplied for only a small subset; the project page frames the insight as most of the world knowledge coming from the unlabelled footage.

**DreamerV3**, its predecessor, was published in Nature in April 2025: one configuration across more than 150 tasks, and the first agent to collect Minecraft diamonds from scratch with online interaction.

**Genie 3** (Google DeepMind, August 2025) generates interactive worlds from a text prompt at 720p and 24 frames per second, with roughly a minute of memory, and responds to the user's movement in real time. In January 2026 DeepMind opened it to AI Ultra subscribers as Project Genie. It is a simulator built to be inhabited; the obvious next use is as an environment for training agents, and the research line is heading there.

**NVIDIA Cosmos** is a platform of world foundation models and data tools aimed at physical AI: synthetic, physics-aware video for training robots and autonomous vehicles. NVIDIA has reported two million downloads. Its purpose is upstream of the others: it exists to manufacture training data.

## Spatial generators

**World Labs** shipped **Marble** in late 2025, a model that builds explorable 3D scenes from text, images or video, and followed it with Marble 1.1 and 1.1 Plus, which improved lighting and artefacts and allowed larger scenes. On 1 September 2026 it announced **Atlas**, described as a multimodal world model that generates image and video frames with exact camera control and reconstructs them in 3D, released to selected partners by application.

Then, on 28 September 2026, **AMD agreed to acquire World Labs** in an all-stock transaction valued at about $8.2 billion, expected to close by the end of the year subject to approvals. Fei-Fei Li joins AMD as executive vice president and chief scientist, reporting to Lisa Su; the stated rationale is to tie model research to hardware and systems design. It is the largest transaction in the field so far, and it says something about where chip companies think the next workload is.

## What it adds up to

A few readings, mine rather than the papers'.

- **The split is purpose, not technique.** Latent predictors are for choosing actions; generative simulators are for training and for looking at; spatial generators are for content and data. Arguments about which is "the" world model miss that they are different tools.
- **Unlabelled footage is the asset.** Dreamer 4 and V-JEPA 2 both draw most of their knowledge from video with no actions attached, and bolt on a small labelled set at the end. The economics of robot learning follow from this.
- **The money has moved.** A billion-dollar seed in Paris and an $8.2 billion acquisition in Santa Clara in the same year, for two companies that have shipped research models and an early product. The bet is on the category.
- **Nothing here is a product you can buy for your own problem yet**, with the partial exception of Cosmos as a data tool. If you are building a system today, world models are a reason to keep your pipelines modular, not a component to order.

## Sources

- Meta AI, [Introducing the V-JEPA 2 world model and new benchmarks for physical reasoning](https://ai.meta.com/blog/v-jepa-2-world-model-benchmarks/); TechCrunch, [Meta's V-JEPA 2 model](https://techcrunch.com/2025/06/11/metas-v-jepa-2-model-teaches-ai-to-understand-its-surroundings/).
- [V-JEPA 2.1: Unlocking Dense Features in Video Self-Supervised Learning](https://arxiv.org/abs/2603.14482); code at [facebookresearch/vjepa2](https://github.com/facebookresearch/vjepa2).
- Balestriero and LeCun, [LeJEPA](https://arxiv.org/abs/2511.08544).
- TechCrunch, [AMI Labs raises $1.03 billion](https://techcrunch.com/2026/03/09/yann-lecuns-ami-labs-raises-1-03-billion-to-build-world-models/).
- Hafner, Yan and Lillicrap, [Dreamer 4](https://danijar.com/project/dreamer4/), [arXiv 2509.24527](https://arxiv.org/abs/2509.24527).
- Google DeepMind, [Genie 3](https://deepmind.google/models/genie/).
- NVIDIA, [Cosmos world foundation models](https://investor.nvidia.com/news/press-release-details/2025/NVIDIA-Announces-Major-Release-of-Cosmos-World-Foundation-Models-and-Physical-AI-Data-Tools/default.aspx).
- Bloomberg, [AMD to buy Fei-Fei Li's World Labs for $8.2 billion](https://www.bloomberg.com/news/articles/2026-09-28/amd-to-buy-fei-fei-li-s-world-labs-ai-startup-for-8-2-billion); AMD [Form 8-K](https://www.sec.gov/Archives/edgar/data/0000002488/000000248826000182/amd-20260926.htm); Radical Ventures, [AMD acquires World Labs](https://radical.vc/articles/amd-acquires-world-labs).
