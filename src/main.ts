import {
  createBoard,
  addButton,
  addImage,
  updateGrid,
  validateBoard,
  packObz,
  unpackObz,
} from "./index";

// Show examples in the console
console.log("=== OBF-UTILS LIBRARY EXAMPLES ===");

// 1. Create a new board
const board = createBoard({
  name: "My Communication Board",
  locale: "en",
  rows: 2,
  columns: 2,
});
console.log("Created board:", board);

// 2. Add an image
const boardWithImage = addImage(board, {
  id: "img1",
  url: "https://example.com/images/happy.png",
  width: 100,
  height: 100,
});
console.log("Added image:", boardWithImage.images);

// 3. Add a button with the image
const boardWithButton = addButton(boardWithImage, {
  id: "btn1",
  label: "Happy",
  image_id: "img1",
  background_color: "rgb(255, 255, 255)",
  border_color: "rgb(0, 0, 0)",
});
console.log("Added button:", boardWithButton.buttons);

// 4. Add another button
const boardWithTwoButtons = addButton(boardWithButton, {
  id: "btn2",
  label: "Sad",
  background_color: "rgb(200, 200, 255)",
  border_color: "rgb(0, 0, 100)",
});
console.log("Added second button:", boardWithTwoButtons.buttons);

// 5. Resize the grid
const boardWithLargerGrid = updateGrid(boardWithTwoButtons, {
  rows: 3,
  columns: 3,
});
console.log("Resized grid:", boardWithLargerGrid.grid);

// 6. Validate the board
const validationResult = validateBoard(boardWithLargerGrid);
console.log(
  "Board validation:",
  validationResult.success ? "Success" : `Failed: ${validationResult.error}`,
);

// 7. Pack the board into an OBZ file
const obzData = packObz([boardWithLargerGrid]);
console.log(`OBZ file created: ${obzData.byteLength} bytes`);

// 8. Unpack the OBZ file
const { boards, manifest } = unpackObz(obzData);
console.log("Unpacked OBZ:", {
  rootBoard: manifest.root,
  boardCount: Object.keys(boards).length,
});

// 9. File input for loading OBZ/OBF files
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h2>OBF/OBZ File Loader Example</h2>
    <input type="file" id="obz-input" />
    <p>Open the browser console to see library example output.</p>
  </div>
`;

const fileInput = document.getElementById(
  "obz-input",
) as HTMLInputElement | null;
if (fileInput) {
  fileInput.addEventListener("change", async (event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      try {
        const { boards, manifest } = unpackObz(uint8Array);
        console.log("Loaded OBZ/OBF file:", {
          manifest,
          boardCount: Object.keys(boards).length,
          boards,
        });
        alert("File loaded! See console for details.");
      } catch (e) {
        console.error("Failed to load OBZ/OBF file:", e);
        alert("Failed to load file. See console for details.");
      }
    }
  });
}
