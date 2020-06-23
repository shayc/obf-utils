import { BoardSet, Button, Board } from './obf.model'
import { denormalizeBoard } from './board'

export function denormalizeBoardSet(boardSet: BoardSet) {
  const { boards } = boardSet
  const denormalizedBoards: { [key: string]: object } = {}

  Object.keys(boards).forEach((key) => {
    denormalizedBoards[key] = denormalizeBoard(boards[key], boardSet)
  })

  return { ...boardSet, boards: denormalizedBoards }
}

export function getBoardById(id: string, boardSet: BoardSet) {
  const path = boardSet.manifest.paths.boards[id]
  const board = getBoardByPath(path, boardSet)

  return board
}

export function getBoardByPath(path: string, boardSet: BoardSet) {
  const board = boardSet.boards[path]

  return board || null
}

export function getBoards(boardSet: BoardSet) {
  const boards = Object.values(boardSet.boards) || []

  return boards
}

export function getRootBoard(boardSet: BoardSet) {
  return getBoardByPath(boardSet.manifest.root, boardSet)
}

export function shouldButtonsPositionedAbsolute(buttons: Button[]) {
  return buttons.every((button) => {
    const { top, left, width, height } = button

    return top && left && width && height
  })
}
