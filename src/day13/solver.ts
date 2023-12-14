import { compose, map, range, transpose, zip } from 'ramda'

const parse = (input: string) => input
    .split('\n\n')
    .map(pattern => pattern.split('\n'))

const findReflectionIndex = (smudges: number, pattern: string[]) => range(0, pattern.length - 1).find(
    index => zip(
        range(0, index + 1).reverse(),
        range(index + 1, pattern.length)
    ).reduce(
        (smudges, [left, right]) => smudges + pattern[left]
            .split('')
            .filter((c, index) => c !== pattern[right][index])
            .length,
        0
    ) === smudges
)

const solveFor = (smudges: number) => (patterns: string[][]) => {
    const score = (pattern: string[]) => {
        let index = findReflectionIndex(smudges, pattern)
        if (index !== undefined) {
            return 100 * (index + 1)
        }
        pattern = compose(
            map((line: string[]) => line.join('')),
            transpose,
            map((line: string) => line.split(''))
        )(pattern)
        return findReflectionIndex(smudges, pattern)! + 1
    }
    
    return patterns.map(score).reduce((a, b) => a + b)
}

export default {
    part1: compose(solveFor(0), parse),
    part2: compose(solveFor(1), parse),
}