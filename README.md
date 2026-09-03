# Patch Cursor Pet

<p align="center">
  <img src="images/patch-in-codex.png" width="216" alt="Patch, a plush Muscovy duck">
</p>

Patch is a persistent desktop pet for Cursor Agent. It floats above your desktop, can be dragged and clicked, and automatically reacts when Cursor thinks, uses tools, finishes, or fails.

This repository packages the original Codex v2 Patch atlas from [`lasc/patch-codex-pet`](https://github.com/lasc/patch-codex-pet) for the open-source [`Clawd on Desk`](https://github.com/rullerzhou-afk/clawd-on-desk) runtime. Clawd provides the transparent desktop window and connects to Cursor's official hooks. The optional VSIX adds convenient launch, import, and setup commands inside Cursor.

## Install

### macOS

1. Download and install the Apple Silicon or Intel `.dmg` from [Clawd on Desk releases](https://github.com/rullerzhou-afk/clawd-on-desk/releases/latest), then launch **Clawd on Desk** once.
2. Download `Patch-Cursor-Pet.zip` from this repository's [latest release](https://github.com/lasc/path-cursor-pet/releases/latest).
3. In Clawd, open **Settings → Theme → Import pet zip**, select the ZIP, and choose Patch.
4. Open **Settings → Agents** and click **Install** for **Cursor Agent**.
5. Start a new Cursor Agent conversation. Patch now changes animation automatically.

The Cursor integration is additive: Clawd merges its commands into `~/.cursor/hooks.json` and preserves unrelated hooks.

### Windows and Linux

Use the matching Clawd installer from [Clawd on Desk releases](https://github.com/rullerzhou-afk/clawd-on-desk/releases/latest), then follow steps 2–5 above. Clawd supports Windows, macOS, and Linux.

## Optional Cursor commands

Install `path-cursor-pet.vsix` from the [latest release](https://github.com/lasc/path-cursor-pet/releases/latest), or run:

```bash
cursor --install-extension path-cursor-pet.vsix
```

The Command Palette then provides:

| Command | What it does |
|---|---|
| **Patch Cursor Pet: Start Desktop Patch** | Launches Clawd on Desk on macOS |
| **Patch Cursor Pet: Import or Update Patch** | Opens Patch's release ZIP in Clawd |
| **Patch Cursor Pet: Open Setup Guide** | Opens these installation instructions |

The VSIX is only a convenience launcher. The pet keeps running independently of an editor tab.

## Cursor state mapping

| Cursor event | Patch animation |
|---|---|
| Prompt submitted / agent thinking | Review |
| Tool use | Running |
| Subagent active | Running |
| Completed or stopped | Jump / attention |
| Error | Failed |
| Session ended | Resting |

Cursor documents its hook events at [Cursor Hooks](https://cursor.com/docs/agent/hooks).

## Build and validate

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/lasc/path-cursor-pet.git
cd path-cursor-pet
npm ci
npm test
npm run package
```

`npm run package` creates:

- `Patch-Cursor-Pet.zip` — the Codex-compatible pet package imported by Clawd.
- `path-cursor-pet.vsix` — the optional Cursor command launcher.

The atlas remains lossless at 1536 × 2288 pixels, with 8 columns × 11 rows and 192 × 208 pixel cells.

## Attribution and licence

Companion extension code and documentation are MIT licensed. Patch's artwork retains its original copyright; see [ASSET-NOTICE.md](ASSET-NOTICE.md). Clawd on Desk is a separate AGPL-3.0 project and is not bundled into this repository.

This is an unofficial community project and is not affiliated with or endorsed by Cursor, Anysphere, OpenAI, or Clawd on Desk.
