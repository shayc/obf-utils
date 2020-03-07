export enum SpecialtyActions {
  Backspace = ':backspace',
  Clear = ':clear',
  Home = ':home',
  Space = ':space',
  Speak = ':speak'
}

export interface Button {
  id: string
  label: string
  image_id: string
  sound_id: string
  load_board: {
    id: string
    name: string
    data_url: string
    url: string
    path: string
  }
  vocalization: string
  action: string
  actions: string[]
  background_color: string
  border_color: string
  left: number
  top: number
  width: number
  height: number
}

export interface Image {
  id: string
  data: string
  path: string
  url: string
  data_url: string
  symbol: {
    set: string
    filename: string
  }
  width: number
  height: number
  content_type: string
  license: License
}

export interface Sound {
  id: string
  data: string
  path: string
  url: string
  data_url: string
  duration: number
  content_type: string
  license: License
}

export interface Grid {
  rows: number
  columns: number
  order: (string | null)[][]
}

export interface License {
  type: string
  copyright_notice_url: string
  source_url: string
  author_name: string
  author_url: string
  author_email: string
}

export interface Board {
  id: string
  name: string
  buttons: Button[]
  grid: Grid
  images: Image[]
  sounds: Sound[]
  locale: string
  strings: { [key: string]: { [key: string]: string } }
  format: string
  url: string
  license: License
}

export interface Manifest {
  format: string
  root: string
  paths: {
    boards: {
      [key: string]: string
    }
    images?: {
      [key: string]: string
    }
    sounds?: {
      [key: string]: string
    }
  }
}

export interface Assets {
  [key: string]: string
}

export interface BoardSet {
  manifest: Manifest
  boards: {
    [key: string]: Board
  }
  images: Assets
  sounds: Assets
}
