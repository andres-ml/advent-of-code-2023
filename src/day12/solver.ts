import { always, aperture, compose, range, unary } from 'ramda'
import { memoize } from '../utils'

type Row = {
    springs: string;
    groups: number[];
}

const parse = (input: string): Row[] => input
    .split('\n')
    .map(line => {
        const [springs, groups] = line.split(' ')
        return {
            springs,
            groups: groups
                .split(',')
                .map(unary(parseInt))
        }
    })

const solve = (rows: Row[]) => {
    const countPermutations = memoize((string: string[], groups: number[]): number => {
        const firstBrokenIndex = string.indexOf('#')
        // if no groups left to match, check if all broken pieces are accounted for
        if (groups.length === 0) {
            return firstBrokenIndex !== -1 ? 0 : 1
        }
        // check if not enough pieces to match all remaining groups
        if (string.length < groups.reduce((a, b) => a + b)) {
            return 0
        }
        // subsets of size == current group
        return aperture(groups[0], string)
            // track their starting index
            .map((subset, index) => ({ subset, index }))
            // no need to look after the first broken piece (if any)
            .slice(0, firstBrokenIndex === -1 ? string.length : (firstBrokenIndex + 1))
            // only continuous subsets
            .filter(({ subset }) => subset.every(piece => piece !== '.'))
            // not adjacent to a fixed broken piece
            .filter(({ subset, index }) => string[index + subset.length] !== '#')
            // consume current subset and group, then recur
            .map(({ subset, index }) => countPermutations(string.slice(index + subset.length + 1), groups.slice(1)))
            .reduce((a, b) => a + b, 0)
    })

    return rows
        .map((row) => countPermutations(row.springs.split(''), row.groups))
        .reduce((carry, combinations) => carry + combinations, 0)
}

const unfold = (rows: Row[]): Row[] => rows.map(row => ({
    springs: range(0, 5).map(always(row.springs)).join('?'),
    groups: range(0, 5).flatMap(always(row.groups)),
}))

export default {
    part1: compose(solve, parse),
    part2: compose(solve, unfold, parse),
}