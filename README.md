# Patch Cursor Pet

<p align="center">
  <img src="images/patch-in-codex.png" width="216" alt="Patch, a plush Muscovy duck">
</p>

Patch is a curious plush Muscovy duck who lives in a Cursor editor tab. Patch walks around, waves, jumps, waits, reviews, rests, and uses the original Codex v2 animation atlas from [`lasc/patch-codex-pet`](https://github.com/lasc/patch-codex-pet).

This is an unofficial Cursor/VS Code extension. It does not modify Cursor or connect to an AI service.

## Install in Cursor

### From the packaged VSIX

1. Download `path-cursor-pet.vsix` from the latest GitHub release.
2. Open Cursor's Command Palette with `Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux.
3. Run **Extensions: Install from VSIX...**.
4. Select the downloaded file and reload Cursor when prompted.
5. Open the Command Palette and run **Patch Cursor Pet: Start Patch**.

Each release also includes `path-cursor-pet.vsix.sha256`. To verify the download on macOS or Linux:

```bash
shasum -a 256 -c path-cursor-pet.vsix.sha256
```

If the `cursor` command-line launcher is installed, you can instead run:

```bash
cursor --install-extension path-cursor-pet.vsix
```

## Build and install from source

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/lasc/path-cursor-pet.git
cd path-cursor-pet
npm ci
npm test
npm run package
cursor --install-extension path-cursor-pet.vsix
```

Restart Cursor, then run **Patch Cursor Pet: Start Patch**.

## Commands

Open the Command Palette and search for `Patch Cursor Pet`:

| Command | What it does |
|---|---|
| **Start Patch** | Opens Patch in a Cursor editor tab and enables automatic roaming |
| **Wave** | Opens Patch and plays the wave animation |
| **Jump** | Opens Patch and plays the jump animation |
| **Review** | Opens Patch in the review animation |
| **Stop Patch** | Closes the pet tab |

The pet tab also contains buttons for all common animations and an **Auto** toggle.

## Current limitation

Patch runs inside a Cursor editor tab. It does not automatically react to Cursor Agent's internal thinking/running state because Cursor does not expose a stable public status event for extensions. The animations are automatic or manually selectable.

## Claude Code

Claude Code does not have native pet support. The original Codex package in [`lasc/patch-codex-pet`](https://github.com/lasc/patch-codex-pet) can be used unchanged with third-party Codex-compatible companions such as [`clawdex`](https://github.com/danielkempe/clawdex) on macOS or [`CC Pet`](https://github.com/ChenDX404/CC-Pet) on Windows.

## Development

```bash
npm test          # tests the extension manifest
npm run validate # validates the manifest and 1536×2288 atlas
npm run package  # creates path-cursor-pet.vsix
```

The renderer uses the source atlas directly: 8 columns × 11 rows, with 192 × 208 pixel cells. No image regeneration or lossy conversion is performed.

## Attribution and licence

Extension code is MIT licensed. Patch's artwork is copied from [`lasc/patch-codex-pet`](https://github.com/lasc/patch-codex-pet) and retains its original copyright; see [ASSET-NOTICE.md](ASSET-NOTICE.md). The extension is implemented independently and does not include `vscode-pets` source code.
