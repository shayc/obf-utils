export function sortGrid({
  columns,
  rows,
  order,
  items
}: {
  columns: number
  rows: number
  order: string[][]
  items: { id: string; [key: string]: any }[]
}) {
  const grid = createEmptyGrid(rows, columns)
  const itemsToSort = [...items]

  iterateGridItems(order, (id, rowIndex, columnIndex) => {
    const itemIndex = itemsToSort.findIndex(item => item.id === id)
    const itemExists = itemIndex > -1

    const exceedsBoundaries = rowIndex >= rows || columnIndex >= columns

    if (itemExists && !exceedsBoundaries) {
      const item = itemsToSort.splice(itemIndex, 1)[0]
      grid[rowIndex][columnIndex] = item
    }
  })

  return fillEmptyGridCells(grid, itemsToSort)
}

/**
 * Create an empty grid from rows and columns
 *
 * @param rows number of rows
 * @param columns number of columns
 */
function createEmptyGrid(rows: number, columns: number): any[][] {
  const grid = [...Array(Number(rows))].map(() => [...Array(Number(columns))])

  return grid
}

function iterateGridItems(
  grid: any[][],
  callback: (item: any, rowIndex: number, columnIndex: number) => void
) {
  grid.forEach((row, rowIndex) => {
    row.forEach((item, columnIndex) => {
      callback(item, rowIndex, columnIndex)
    })
  })
}

function fillEmptyGridCells(grid: any[][], items: any[]) {
  const itemQueue = [...items]

  return grid.map(row =>
    row.map(item => {
      return item || itemQueue.shift()
    })
  )
}
