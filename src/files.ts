import { Board, Button, Sound, Image, BoardSet } from './obf.model'
import { encode } from 'base64-arraybuffer'
import JSZip from 'jszip'

const jszip = require('jszip')

export async function readFiles(files: FileList): Promise<BoardSet[]> {
  const parsedFiles: BoardSet[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileExtension = file.name.split('.')[1]

    if (fileExtension === 'obf') {
      const obfFile = (await readOBFFile(file)) as string
      const obf = parseOBF(obfFile)

      const boardSet: BoardSet = {
        manifest: {
          format: obf.format,
          root: file.name,
          paths: {
            boards: {
              [obf.id]: file.name
            }
          }
        },
        boards: { [file.name]: obf },
        images: {},
        sounds: {}
      }

      parsedFiles.push(boardSet)
    }

    if (fileExtension === 'obz') {
      const obz = await parseOBZ(await readOBZFile(file))
      parsedFiles.push(obz)
    }
  }

  return parsedFiles
}

export function readOBFFile(file: File) {
  return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = event => {
      resolve((event.target as FileReader).result)
    }

    reader.readAsText(file)
  })
}

export function readOBZFile(file: File): Promise<JSZip> {
  return jszip.loadAsync(file)
}

export function parseOBF(obf: string) {
  const parsedBoard: Board = JSON.parse(obf)
  const board = stringifyBoardIds(parsedBoard)

  return board
}

export function parseOBZ(zip: JSZip): Promise<BoardSet> {
  return new Promise((resolve, reject) => {
    const boardSet: BoardSet = {
      manifest: {
        format: '',
        root: '',
        paths: {
          boards: {},
          images: {},
          sounds: {}
        }
      },
      boards: {},
      images: {},
      sounds: {}
    }

    let count = 0

    zip.forEach(async (relativePath: string) => {
      count++

      const fileType = getFileType(relativePath)
      const isBinary = fileType === 'sound' || fileType === 'image'
      const asyncType = (isBinary && 'uint8array') || 'text'

      const data = await zip.file(relativePath).async(asyncType)

      switch (fileType) {
        case 'sound':
          boardSet.sounds[relativePath] = `data:audio/mp3;base64,${encode(data as Uint8Array)}`
          break

        case 'image':
          boardSet.images[relativePath] = `data:image/png;base64,${encode(data as Uint8Array)}`
          break

        case 'board':
          boardSet.boards[relativePath] = parseOBF(data as string)
          break

        case 'manifest':
          boardSet.manifest = JSON.parse(data as string)
          break

        default:
        // no default
      }

      if (!--count) {
        resolve(boardSet)
      }
    })
  })
}

function getFileType(filename: string) {
  const FileExtensions = {
    board: /\.obf$/,
    image: /\.(gif|jpe?g|png|webp)$/,
    manifest: /manifest\.json$/,
    sound: /\.(mp3)$/
  }

  const fileType =
    (FileExtensions.image.test(filename) && 'image') ||
    (FileExtensions.board.test(filename) && 'board') ||
    (FileExtensions.sound.test(filename) && 'sound') ||
    (FileExtensions.manifest.test(filename) && 'manifest')

  return fileType
}

function stringifyBoardIds(board: Board): Board {
  const stringifiedBoard = { ...board }

  stringifiedBoard.id = stringifiedBoard.id.toString()

  stringifiedBoard.grid.order = stringifiedBoard.grid.order.map(row =>
    row.map(id => id?.toString() ?? null)
  )

  stringifiedBoard.buttons = stringifiedBoard.buttons.map((button: Button) => ({
    ...button,
    id: button.id.toString(),
    ...(button.sound_id && { sound_id: button.sound_id?.toString() }),
    ...(button.image_id && { image_id: button.image_id?.toString() })
  }))

  stringifiedBoard.sounds = stringifiedBoard?.sounds.map((sound: Sound) => ({
    ...sound,
    id: sound.id.toString()
  }))

  stringifiedBoard.images = stringifiedBoard?.images.map((image: Image) => ({
    ...image,
    id: image.id.toString()
  }))

  return stringifiedBoard
}
