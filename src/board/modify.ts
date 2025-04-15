import { BoardError } from "../errors";
import type { Board } from "../schema/board";
import type { Button } from "../schema/button";
import type { Image } from "../schema/image";
import type { Sound } from "../schema/sound";
import { generateUniqueId, isIdUsed } from "../utils/id";
import { validateBoardOrThrow } from "./validate";

/**
 * Adds a button to a board.
 *
 * @param board - The board to modify
 * @param button - The button data
 * @returns A new board with the added button
 */
export function addButton(board: Board, button: Partial<Button>): Board {
  const buttonId = button.id || generateUniqueId(board.buttons);

  if (button.id && isIdUsed(button.id, board.buttons)) {
    throw new BoardError(`Button ID "${button.id}" is already used`);
  }

  const newButton: Button = {
    id: buttonId,
    ...button,
  };

  const position = findFirstEmptyCell(board.grid);
  let updatedGrid = { ...board.grid };

  if (position) {
    const { row, column } = position;
    const newOrder = [...board.grid.order];
    newOrder[row] = [...newOrder[row]];
    newOrder[row][column] = buttonId;
    updatedGrid = { ...board.grid, order: newOrder };
  }

  const updatedBoard: Board = {
    ...board,
    buttons: [...board.buttons, newButton],
    grid: updatedGrid,
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Updates a button on a board.
 *
 * @param board - The board to modify
 * @param buttonId - The ID of the button to update
 * @param button - The new button data
 * @returns A new board with the updated button
 */
export function updateButton(
  board: Board,
  buttonId: string,
  button: Partial<Button>,
): Board {
  const buttonIndex = board.buttons.findIndex((b) => b.id === buttonId);
  if (buttonIndex === -1) {
    throw new BoardError(`Button with ID "${buttonId}" not found`);
  }

  const updatedButton: Button = {
    ...board.buttons[buttonIndex],
    ...button,
    id: buttonId, // Ensure ID doesn't change
  };

  const updatedButtons = [...board.buttons];
  updatedButtons[buttonIndex] = updatedButton;

  const updatedBoard: Board = {
    ...board,
    buttons: updatedButtons,
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Removes a button from a board.
 *
 * @param board - The board to modify
 * @param buttonId - The ID of the button to remove
 * @returns A new board with the button removed
 */
export function removeButton(board: Board, buttonId: string): Board {
  const buttonIndex = board.buttons.findIndex(
    (button) => button.id === buttonId,
  );
  if (buttonIndex === -1) {
    throw new BoardError(`Button with ID "${buttonId}" not found`);
  }

  const newOrder = board.grid.order.map((row) =>
    row.map((cell) => (cell === buttonId ? null : cell)),
  );

  const updatedBoard: Board = {
    ...board,
    buttons: board.buttons.filter((button) => button.id !== buttonId),
    grid: {
      ...board.grid,
      order: newOrder,
    },
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Adds an image to a board.
 *
 * @param board - The board to modify
 * @param image - The image data
 * @returns A new board with the added image
 */
export function addImage(board: Board, image: Partial<Image>): Board {
  const imageId = image.id || generateUniqueId(board.images);

  if (image.id && isIdUsed(image.id, board.images)) {
    throw new BoardError(`Image ID "${image.id}" is already used`);
  }

  const newImage: Image = {
    id: imageId,
    ...image,
  };

  const updatedBoard: Board = {
    ...board,
    images: [...board.images, newImage],
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Updates an image on a board.
 *
 * @param board - The board to modify
 * @param imageId - The ID of the image to update
 * @param image - The new image data
 * @returns A new board with the updated image
 */
export function updateImage(
  board: Board,
  imageId: string,
  image: Partial<Image>,
): Board {
  const imageIndex = board.images.findIndex((img) => img.id === imageId);
  if (imageIndex === -1) {
    throw new BoardError(`Image with ID "${imageId}" not found`);
  }

  const updatedImage: Image = {
    ...board.images[imageIndex],
    ...image,
    id: imageId, // Ensure ID doesn't change
  };

  const updatedImages = [...board.images];
  updatedImages[imageIndex] = updatedImage;

  const updatedBoard: Board = {
    ...board,
    images: updatedImages,
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Removes an image from a board.
 *
 * @param board - The board to modify
 * @param imageId - The ID of the image to remove
 * @returns A new board with the image removed
 */
export function removeImage(board: Board, imageId: string): Board {
  const imageIndex = board.images.findIndex((image) => image.id === imageId);
  if (imageIndex === -1) {
    throw new BoardError(`Image with ID "${imageId}" not found`);
  }

  const referencingButtons = board.buttons.filter(
    (button) => button.image_id === imageId,
  );
  if (referencingButtons.length > 0) {
    throw new BoardError(
      `Cannot remove image "${imageId}" because it is referenced by ${referencingButtons.length} button(s)`,
    );
  }

  const updatedBoard: Board = {
    ...board,
    images: board.images.filter((image) => image.id !== imageId),
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Adds a sound to a board.
 *
 * @param board - The board to modify
 * @param sound - The sound data
 * @returns A new board with the added sound
 */
export function addSound(board: Board, sound: Partial<Sound>): Board {
  const soundId = sound.id || generateUniqueId(board.sounds);

  if (sound.id && isIdUsed(sound.id, board.sounds)) {
    throw new BoardError(`Sound ID "${sound.id}" is already used`);
  }

  const newSound: Sound = {
    id: soundId,
    ...sound,
  };

  const updatedBoard: Board = {
    ...board,
    sounds: [...board.sounds, newSound],
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Updates a sound on a board.
 *
 * @param board - The board to modify
 * @param soundId - The ID of the sound to update
 * @param sound - The new sound data
 * @returns A new board with the updated sound
 */
export function updateSound(
  board: Board,
  soundId: string,
  sound: Partial<Sound>,
): Board {
  const soundIndex = board.sounds.findIndex((s) => s.id === soundId);
  if (soundIndex === -1) {
    throw new BoardError(`Sound with ID "${soundId}" not found`);
  }

  const updatedSound: Sound = {
    ...board.sounds[soundIndex],
    ...sound,
    id: soundId, // Ensure ID doesn't change
  };

  const updatedSounds = [...board.sounds];
  updatedSounds[soundIndex] = updatedSound;

  const updatedBoard: Board = {
    ...board,
    sounds: updatedSounds,
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Removes a sound from a board.
 *
 * @param board - The board to modify
 * @param soundId - The ID of the sound to remove
 * @returns A new board with the sound removed
 */
export function removeSound(board: Board, soundId: string): Board {
  const soundIndex = board.sounds.findIndex((sound) => sound.id === soundId);
  if (soundIndex === -1) {
    throw new BoardError(`Sound with ID "${soundId}" not found`);
  }

  const referencingButtons = board.buttons.filter(
    (button) => button.sound_id === soundId,
  );
  if (referencingButtons.length > 0) {
    throw new BoardError(
      `Cannot remove sound "${soundId}" because it is referenced by ${referencingButtons.length} button(s)`,
    );
  }

  const updatedBoard: Board = {
    ...board,
    sounds: board.sounds.filter((sound) => sound.id !== soundId),
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Updates the grid of a board.
 *
 * @param board - The board to modify
 * @param gridData - The new grid data
 * @returns A new board with the updated grid
 */
export function updateGrid(
  board: Board,
  gridData: { rows?: number; columns?: number },
): Board {
  const { rows = board.grid.rows, columns = board.grid.columns } = gridData;

  const newOrder: (string | null)[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: (string | null)[] = [];
    for (let j = 0; j < columns; j++) {
      if (i < board.grid.rows && j < board.grid.columns) {
        row.push(board.grid.order[i][j]);
      } else {
        row.push(null);
      }
    }
    newOrder.push(row);
  }

  const updatedBoard: Board = {
    ...board,
    grid: {
      rows,
      columns,
      order: newOrder,
    },
  };

  validateBoardOrThrow(updatedBoard);

  return updatedBoard;
}

/**
 * Finds the first empty cell in a grid.
 *
 * @param grid - The grid to search
 * @returns The position of the first empty cell, or null if none found
 */
function findFirstEmptyCell(grid: {
  rows: number;
  columns: number;
  order: (string | null)[][];
}): { row: number; column: number } | null {
  for (let i = 0; i < grid.rows; i++) {
    for (let j = 0; j < grid.columns; j++) {
      if (grid.order[i][j] === null) {
        return { row: i, column: j };
      }
    }
  }
  return null;
}
