# OBF Utils

[![npm version](https://img.shields.io/npm/v/obf-utils.svg)](https://www.npmjs.com/package/obf-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A type-safe TypeScript utility library for working with the [Open Board Format](https://www.openboardformat.org/) (OBF)—the open standard for AAC (Augmentative and Alternative Communication) boards.

---

## Table of Contents

- [Features & Benefits](#features--benefits)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage & API](#usage--api)
- [Architecture](#architecture)
- [Documentation & Resources](#documentation--resources)
- [Environment Support](#environment-support)
- [Community & Support](#community--support)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

---

## Features & Benefits

- **Universal**: Read, create, and modify OBF/OBZ files for AAC board sharing.
- **Type-Safe**: Immutable API with full TypeScript support.
- **Cross-Platform**: Works in browsers and Node.js.
- **Open Source**: MIT licensed, easy to contribute to.
- **Validate**, create, and modify boards, buttons, images, and layouts.
- **Pack/Unpack** OBZ (zip) files.
- **Persist** boards in browser or Node.js storage.
- **Schemas and validation** with Zod.

---

## Installation

```bash
npm install obf-utils
```
- Requires **Node.js >=20.0.0**

---

## Quick Start

```typescript
import { createBoard, addButton, addImage, validateBoard } from "obf-utils";

const board = createBoard({
  name: "My Board",
  locale: "en",
  rows: 2,
  columns: 2,
});

const boardWithImage = addImage(board, {
  id: "img1",
  url: "https://example.com/happy.png",
  width: 100,
  height: 100,
});

const boardWithButton = addButton(boardWithImage, {
  id: "btn1",
  label: "Happy",
  image_id: "img1",
});

const result = validateBoard(boardWithButton);
console.log(result.success ? "Valid!" : `Error: ${result.error}`);
```

---

## Usage & API

### Core Concepts

- **Board**: Grid layout with buttons and resources.
- **Button**: Interactive board element.
- **Image/Sound**: Media resources linked to buttons.
- **OBZ**: Zipped OBF package.
- **Manifest**: OBZ metadata file.

### API Overview

#### Board Manipulation

| Function                                | Description                            |
| --------------------------------------- | -------------------------------------- |
| `createBoard(options)`                  | Create a new board.                    |
| `addButton(board, button)`              | Add a button to a board.               |
| `updateButton(board, buttonId, button)` | Update a button on a board.            |
| `removeButton(board, buttonId)`         | Remove a button from a board.          |
| `addImage(board, image)`                | Add an image to a board.               |
| `updateImage(board, imageId, image)`    | Update an image on a board.            |
| `removeImage(board, imageId)`           | Remove an image from a board.          |
| `addSound(board, sound)`                | Add a sound to a board.                |
| `updateSound(board, soundId, sound)`    | Update a sound on a board.             |
| `removeSound(board, soundId)`           | Remove a sound from a board.           |
| `updateGrid(board, { rows, columns })`  | Change the board's grid size.          |
| `validateBoard(board)`                  | Validate a board against the OBF spec. |

#### OBZ & Manifest Manipulation

| Function                                     | Description                                |
| -------------------------------------------- | ------------------------------------------ |
| `createObz(options)`                         | Create a new OBZ package.                  |
| `addBoard(obz, board)`                       | Add a board to an OBZ.                     |
| `removeBoard(obz, boardId)`                  | Remove a board from an OBZ.                |
| `updateRootBoard(obz, boardId)`              | Set the root board in an OBZ.              |
| `createManifest(options)`                    | Create a new manifest.                     |
| `updateManifestRoot(manifest, boardId)`      | Set the root board in a manifest.          |
| `addBoardToManifest(manifest, board)`        | Add a board to a manifest.                 |
| `removeBoardFromManifest(manifest, boardId)` | Remove a board from a manifest.            |
| `validateManifest(manifest)`                 | Validate a manifest.                       |
| `validateObz(obz)`                           | Validate an OBZ package.                   |

#### Storage (Browser & Node.js)

| Function                 | Description                      |
| ------------------------ | -------------------------------- |
| `createStorage(options)` | Create a custom storage adapter. |
| `saveBoard(board)`       | Persist a board (async).         |
| `loadBoard(id)`          | Load a board by ID (async).      |
| `deleteBoard(id)`        | Delete a board by ID (async).    |
| `listBoards()`           | List all saved boards (async).   |
| `saveObz(obz)`           | Persist an OBZ package (async).  |
| `loadObz(id)`            | Load an OBZ by ID (async).       |
| `deleteObz(id)`          | Delete an OBZ by ID (async).     |
| `listObzs()`             | List all saved OBZs (async).     |

#### Archive (Packing/Unpacking)

| Function                  | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `packObz(boards)`         | Pack boards/resources into an OBZ file (Uint8Array). |
| `unpackObz(data)`         | Unpack an OBZ file into boards/resources.            |

#### Utilities

| Function                       | Description                              |
| ------------------------------ | ---------------------------------------- |
| `detectEnvironment()`          | Detect if running in browser or Node.js. |
| `isBrowser()`, `isNode()`      | Environment checks.                      |
| `generateId()`                 | Generate a random ID.                    |
| `generateUniqueId(collection)` | Generate a unique ID for a collection.   |

#### Errors

| Class             | Description                          |
| ----------------- | ------------------------------------ |
| `ObfError`        | Base error class.                    |
| `ValidationError` | Thrown on validation errors.         |
| `StorageError`    | Thrown on storage errors.            |
| `ArchiveError`    | Thrown on archive/packing errors.    |
| `BoardError`      | Thrown on board manipulation errors. |
| `ObzError`        | Thrown on OBZ/manifest errors.       |

See [examples/](examples/) for more usage patterns and details.

---

### Advanced Usage

<details>
<summary>Packing & Unpacking OBZ Files</summary>

```typescript
import { packObz, unpackObz } from "obf-utils";

const obzData = packObz([boardWithButton]);
const { boards, manifest } = unpackObz(obzData);
console.log(`Root board: ${manifest.root}`);
console.log(`Number of boards: ${Object.keys(boards).length}`);
```
</details>

<details>
<summary>Async Persistence</summary>

```typescript
import { saveBoard, loadBoard } from "obf-utils";

await saveBoard(boardWithButton);
const loadedBoard = await loadBoard(boardWithButton.id);
```
</details>

<details>
<summary>Modifying Boards</summary>

```typescript
import { updateGrid } from "obf-utils";

const largerBoard = updateGrid(boardWithButton, { rows: 3, columns: 3 });
```
</details>

---

## Architecture

```text
src/
├── board/     # Board creation, modification, validation
├── obz/       # OBZ packaging, manifest, validation
├── schema/    # TypeScript types and schemas
├── storage/   # Pluggable storage (browser/Node.js)
├── utils/     # Utility functions (ID, env)
└── errors/    # Custom error classes
```
All APIs are **immutable** and **type-safe**. Validation uses [Zod](https://zod.dev/).

---

## Documentation & Resources

- [Examples](examples/) — More usage patterns
- [OBF Specification](docs/open-board-format.md) — Format details

---

## Environment Support

- **Browser:** Uses IndexedDB for storage
- **Node.js:** Uses filesystem for storage
- **Auto-detects** environment

---

## Community & Support

- Open an [issue](https://github.com/shayc/obf-utils/issues) for help or questions.
- Maintained by [Shay Cojocaru](https://github.com/shayc).

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, code of conduct, and the release/commit workflow.

---

## Changelog

See [Releases](https://github.com/shayc/obf-utils/releases) for version history.

---

## License

MIT
