# OBF Utils

[![npm version](https://img.shields.io/npm/v/obf-utils.svg)](https://www.npmjs.com/package/obf-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Type-safe TypeScript utilities for working with the [Open Board Format](https://www.openboardformat.org/) (OBF)—the open standard for AAC (Augmentative and Alternative Communication) boards.

---

## Installation

```bash
npm install obf-utils
```

> Requires **Node.js >=20.0.0**

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

## API Overview

- Immutable, type-safe API for OBF board manipulation (buttons, images, sounds)
- OBZ (zip) pack/unpack for sharing
- Works in browser (IndexedDB) and Node.js (fs)
- Async storage support
- Schema validation with Zod

---

## Further Resources

- [Examples](examples/)
- [OBF Specification](docs/open-board-format.md)

---

## Contributing, Support & License

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).  
MIT License. Maintained by [Shay Cojocaru](https://github.com/shayc).
