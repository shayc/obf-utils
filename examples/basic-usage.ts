import {
  createBoard,
  addButton,
  addImage,
  updateGrid,
  validateBoard,
  packObz,
  unpackObz,
  saveBoard,
  loadBoard,
} from "../src";

// Create a new board
const board = createBoard({
  name: "My Communication Board",
  locale: "en",
  rows: 2,
  columns: 2,
});

// Add an image
const boardWithImage = addImage(board, {
  id: "img1",
  url: "https://example.com/images/happy.png",
  width: 100,
  height: 100,
});

// Add a button with the image
const boardWithButton = addButton(boardWithImage, {
  id: "btn1",
  label: "Happy",
  image_id: "img1",
  background_color: "rgb(255, 255, 255)",
  border_color: "rgb(0, 0, 0)",
});

// Add another button
const boardWithTwoButtons = addButton(boardWithButton, {
  id: "btn2",
  label: "Sad",
  background_color: "rgb(200, 200, 255)",
  border_color: "rgb(0, 0, 100)",
});

// Resize the grid
const boardWithLargerGrid = updateGrid(boardWithTwoButtons, {
  rows: 3,
  columns: 3,
});

// Validate the board
const validationResult = validateBoard(boardWithLargerGrid);
console.log(
  "Board validation:",
  validationResult.success ? "Success" : `Failed: ${validationResult.error}`,
);

// Pack the board into an OBZ file
const obzData = packObz([boardWithLargerGrid]);
console.log(`OBZ file created: ${obzData.byteLength} bytes`);

// Unpack the OBZ file
const { boards, manifest } = unpackObz(obzData);
console.log("Unpacked OBZ:", {
  rootBoard: manifest.root,
  boardCount: Object.keys(boards).length,
});

// Save and load the board (in a real application)
async function saveAndLoadExample() {
  // Save the board
  await saveBoard(boardWithLargerGrid);
  console.log(`Board saved with ID: ${boardWithLargerGrid.id}`);

  // Load the board
  const loadedBoard = await loadBoard(boardWithLargerGrid.id);
  console.log("Board loaded:", loadedBoard ? "Success" : "Not found");
}

// This would be called in a real application
// saveAndLoadExample();
