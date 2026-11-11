---
title: "KeepMeAwake: A Tray App That Asks the Operating System Nicely"
description: "A Windows and macOS app in Rust and Tauri that holds a real power request instead of faking keystrokes. About 5 MB in the tray, unsafe code in two files."
pubDate: 2026-11-11T11:00:00Z
client: "Open source · ax5hay/KeepMeAwake"
stack: ["Rust", "Tauri 2", "Svelte 5", "Win32 power API", "IOKit", "GitHub Actions"]
metrics: ["About 5 MB in the tray", "Four releases in its first week", "No fake keypresses"]
---

## What it is

KeepMeAwake keeps a laptop awake by asking the operating system nicely. On Windows it holds a power request; on macOS, an IOKit power assertion. That is the mechanism a video player uses. It does not fake a keypress or nudge the mouse.

Because it asks properly, it shows up by name in `powercfg /requests` or `pmset -g assertions`, and the request is released the instant it is switched off.

[The repository](https://github.com/ax5hay/KeepMeAwake) · [Releases](https://github.com/ax5hay/KeepMeAwake/releases)

## What it does

One sun to click. A global hotkey, timers or "until a time", a weekly schedule with a skip, battery rules and keep-the-screen-on. An overnight guard asks before it holds an untouched machine all night. An almanac keeps the hours at the machine, leave and overtime, and exports them as CSV.

AI is optional (Claude, OpenAI or any endpoint) and sits behind three locks: it is off by default, each feature has its own switch, and the key lives in the operating system's credential store. It never reaches the webview.

## How it is built

Tauri 2 around a Rust core in strict layers: app, engine, core, platform. `core` is pure and does no I/O. The operating system sits behind five traits, and each has a fake for tests.

One engine thread waits on a condvar, so nothing polls while it rests. The Svelte 5 window exists only while it is open. In the tray, the whole app is about 5 MB.

## What holds it upright

`unsafe` lives in two files, one per operating system, and Clippy refuses any block without a `SAFETY:` note. Updates are verified against a public key built into the app. The content security policy is `default-src 'self'`. It installs per user and never asks for administrator rights.

## How it shipped

170 commits and four tagged releases in its first week. Windows and macOS come out of one matrix build. Along the way: five decision records, a dozen specs, a field guide and a resource budget.

## What it proves

The same care at the bottom of the stack as at the top: native APIs, threads, signing, installers, and a budget the app is held to.
