import { compose, range, unary } from 'ramda'
import { matchAllGroups } from '../utils'

const parse = (input: string) => input.split('\n')

const buildMap = (lines: string[]) => {
    const numbers: Record<number, Record<number, number>> = {}
    const symbols: Record<number, Record<number, string>> = {}
    lines.forEach((line, index) => {
        matchAllGroups('([0-9]+)', line).forEach(match => {
            numbers[index] ??= {}
            numbers[index][match.index!] = parseInt(match[0])
        })
        matchAllGroups('[^0-9.]', line).forEach(match => {
            symbols[index] ??= {}
            symbols[index][match.index!] = match[0]
        })
    })
    return { numbers, symbols }
}

const unfold: <T>(items: Record<number, Record<number, T>>) => ({ rowIndex: number; columnIndex: number; value: T })[] =
    items => Object.entries(items).flatMap(
        ([rowIndex, rowItems]) => Object.entries(rowItems).flatMap(([columnIndex, item]) => ({
            rowIndex: parseInt(rowIndex),
            columnIndex: parseInt(columnIndex),
            value: item,
        }))
    )

const solve1 = (lines: string[]) => {
    const { numbers, symbols } = buildMap(lines)
    return unfold(numbers)
        .filter(({ rowIndex, columnIndex, value }) => {
            const [yMin, yMax] = [Math.max(0, rowIndex - 1), Math.min(rowIndex + 1)]
            const [xMin, xMax] = [Math.max(0, columnIndex - 1), Math.min(columnIndex + value.toString().length + 1)]
            return range(yMin, yMax + 1).some(
                y => Object
                    .keys(symbols[y] ?? {})
                    .map(unary(parseInt))
                    .some(x => xMin <= x && x < xMax)
            )
        })
        .reduce((carry, { value }) => carry + value, 0)
}

const solve2 = (lines: string[]) => {
    const { numbers, symbols } = buildMap(lines)
    return unfold(symbols)
        .filter(({ value }) => value === '*')
        .map(({ rowIndex, columnIndex }) => {
            const [yMin, yMax] = [Math.max(0, rowIndex - 1), Math.min(rowIndex + 1)]
            const [xMin, xMax] = [Math.max(0, columnIndex - 1), Math.min(columnIndex + 1)]
            return range(yMin, yMax + 1).flatMap(
                y => Object
                    .entries(numbers[y] ?? {})
                    .map(([x, number]) => [parseInt(x), number])
                    .filter(([x, number]) => x <= xMax && xMin <= (x + number.toString().length - 1))
                    .map(([_, number]) => number)
            )
        })
        .filter(parts => parts.length === 2)
        .reduce((carry, [part1, part2]) => carry + part1 * part2, 0)
}

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}