import { compose, range, transpose } from 'ramda'

type Cell = '.'|'#'
type Map = Cell[][]

const rangeUnordered = (from: number, to: number) => from < to
    ? range(from, to)
    : range(to, from)

const parse = (input: string) => input
    .split('\n')
    .map(line => line.split('')) as Map

const solveFor = (ageFactor: number) => (grid: Map) => {
    const getEmptyRowIndexes = (grid: Map) => grid
        .map((row, index) => row.every(cell => cell === '.') ? index : undefined)
        .filter(index => index !== undefined) as number[]

    const emptyRows = getEmptyRowIndexes(grid)
    const emptyColumns = getEmptyRowIndexes(transpose(grid))

    const galaxies = grid.flatMap((row, i) => row.flatMap((col, j) => col === '#' ? [[i, j]] : []))

    const measure = (from: number, to: number, empty: number[]) => rangeUnordered(from, to)
        .map(n => empty.includes(n) ? ageFactor : 1)
        .reduce((a, step) => a + step, 0)

    return galaxies
        .flatMap(
            (galaxy, index) => galaxies
                .slice(index + 1)
                .map(other => measure(galaxy[0], other[0], emptyRows) + measure(galaxy[1], other[1], emptyColumns))
        )
        .reduce((a, b) => a + b, 0)
}

export default {
    part1: compose(solveFor(2), parse),
    part2: compose(solveFor(1e6), parse),
}