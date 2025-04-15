import { describe, expect, it } from "vitest";
import { createBoard } from "../../board/create";
import { ObzError } from "../../errors";
import { addBoard, createObz, removeBoard, updateRootBoard } from "../create";

describe("OBZ creation and modification edge cases", () => {
  it("throws when creating an OBZ with no boards", () => {
    expect(() => createObz([])).toThrow(ObzError);
  });

  it("throws when adding a board with duplicate ID", () => {
    const board1 = createBoard({ name: "A", id: "b1" });
    const obz = createObz([board1]);
    expect(() => addBoard(obz, board1)).toThrow(ObzError);
  });

  it("throws when removing a board that does not exist", () => {
    const board1 = createBoard({ name: "A", id: "b1" });
    const obz = createObz([board1]);
    expect(() => removeBoard(obz, "notfound")).toThrow(ObzError);
  });

  it("throws when removing the root board", () => {
    const board1 = createBoard({ name: "A", id: "b1" });
    const board2 = createBoard({ name: "B", id: "b2" });
    const obz = createObz([board1, board2]);
    const obz2 = removeBoard(obz, "b2");
    expect(() => removeBoard(obz2, "b1")).toThrow(ObzError);
  });

  it("throws when updating root board to a non-existent board", () => {
    const board1 = createBoard({ name: "A", id: "b1" });
    const obz = createObz([board1]);
    expect(() => updateRootBoard(obz, "notfound")).toThrow(ObzError);
  });
});
