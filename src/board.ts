import { BoardSet, Board, Button, Sound, Image, Assets } from './obf.model'

export function denormalizeBoard(board: Board, boardSet: BoardSet) {
  const buttons = board.buttons.map(({ image_id, label, sound_id, vocalization, ...other }) => {
    const image = getImageById(image_id, board.images)
    const sound = getSoundById(sound_id, board.sounds)

    return {
      ...other,
      image: image ? getImageURL(image, boardSet.images) : '',
      label: getLocaleMessage(label, board),
      sound: sound ? getSoundURL(sound, boardSet.sounds) : '',
      vocalization: getLocaleMessage(vocalization, board),
    }
  })

  return {
    ...board,
    buttons,
  }
}

export function getTextToSpeak(button: Button) {
  return button.vocalization || button.label
}

export function getImageById(id: string, images: Image[]) {
  const image = findObjectById(id, images)

  return image
}

export function getSoundById(id: string, sounds: Sound[]) {
  const sound = findObjectById(id, sounds)

  return sound
}

export function getLocaleMessage(message: string, board: Board) {
  const { locale, strings } = board
  const localeMessage = strings?.[locale]?.[message]

  return localeMessage || message
}

export function getSoundURL(sound: Sound, assets: Assets): string {
  return getItemURL(sound, assets)
}

export function getImageURL(image: Image, assets: Assets): string {
  return getItemURL(image, assets)
}

function getItemURL<T extends Sound | Image>(item: T, assets: Assets): string {
  const data = item.data || assets[item.path] || item.url

  return data || ''
}

function findObjectById<T extends { id: string }>(id: string, arr: T[]) {
  const object = arr.find((obj) => obj.id === id)

  return object || null
}
