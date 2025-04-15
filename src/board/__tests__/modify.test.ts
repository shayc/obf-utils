import { describe, expect, it } from "vitest";
import { BoardError } from "../../errors";
import { createBoard } from "../create";
import {
  addButton,
  addImage,
  addSound,
  removeButton,
  removeImage,
  removeSound,
  updateButton,
  updateGrid,
} from "../modify";

describe("Board modification edge cases", () => {
  it("throws when adding a button with duplicate ID", () => {
    const board = createBoard({ name: "Test" });
    const boardWithButton = addButton(board, { id: "b1", label: "A" });
    expect(() => addButton(boardWithButton, { id: "b1", label: "B" })).toThrow(
      BoardError,
    );
  });

  it("throws when updating a non-existent button", () => {
    const board = createBoard({ name: "Test" });
    expect(() => updateButton(board, "notfound", { label: "X" })).toThrow(
      BoardError,
    );
  });

  it("throws when removing a non-existent button", () => {
    const board = createBoard({ name: "Test" });
    expect(() => removeButton(board, "notfound")).toThrow(BoardError);
  });

  it("throws when adding an image with duplicate ID", () => {
    const board = createBoard({ name: "Test" });
    const boardWithImage = addImage(board, {
      id: "img1",
      url: "https://example.com/x.png",
      width: 1,
      height: 1,
    });
    expect(() =>
      addImage(boardWithImage, {
        id: "img1",
        url: "https://example.com/y.png",
        width: 1,
        height: 1,
      }),
    ).toThrow(BoardError);
  });

  it("throws when removing an image that is referenced by a button", () => {
    const board = createBoard({ name: "Test" });
    const boardWithImage = addImage(board, {
      id: "img1",
      url: "https://example.com/x.png",
      width: 1,
      height: 1,
    });
    const boardWithButton = addButton(boardWithImage, {
      label: "A",
      image_id: "img1",
    });
    expect(() => removeImage(boardWithButton, "img1")).toThrow(BoardError);
  });

  it("throws when adding a sound with duplicate ID", () => {
    const board = createBoard({ name: "Test" });
    const boardWithSound = addSound(board, {
      id: "s1",
      url: "https://example.com/x.mp3",
    });
    expect(() =>
      addSound(boardWithSound, { id: "s1", url: "https://example.com/y.mp3" }),
    ).toThrow(BoardError);
  });

  it("throws when removing a sound that is referenced by a button", () => {
    const board = createBoard({ name: "Test" });
    const boardWithSound = addSound(board, {
      id: "s1",
      url: "https://example.com/x.mp3",
    });
    const boardWithButton = addButton(boardWithSound, {
      label: "A",
      sound_id: "s1",
    });
    expect(() => removeSound(boardWithButton, "s1")).toThrow(BoardError);
  });

  it("updates grid size and preserves existing button order", () => {
    const board = createBoard({ name: "Test", rows: 2, columns: 2 });
    const boardWithButton = addButton(board, { id: "b1", label: "A" });
    const updatedBoard = updateGrid(boardWithButton, { rows: 3, columns: 3 });
    expect(updatedBoard.grid.rows).toBe(3);
    expect(updatedBoard.grid.columns).toBe(3);
    expect(updatedBoard.grid.order[0][0]).toBe("b1");
  });
});
