import { compose, range } from 'ramda'

type Lens = {
    label: string;
    focalLength: number;
}

const parse = (input: string) => input.split(',')

const hash = (string: string): number => string
    .split('')
    .reduce((hash, character) => (17 * (hash + character.charCodeAt(0))) % 256, 0)

const solve1 = (instructions: string[]) => instructions
    .map(hash)
    .reduce((a, b) => a + b, 0)

const solve2 = (instructions: string[]) => {
    const boxes: Lens[][] = range(0, 256).map(() => [])
    
    instructions.forEach(instruction => {
        if (instruction.endsWith('-')) {
            const label = instruction.slice(0, -1)
            const boxId = hash(label)
            const lensIndex = boxes[boxId].findIndex(lens => lens.label === label)
            if (lensIndex !== -1) {
                boxes[boxId].splice(lensIndex, 1)
            }
        }
        else {
            const [label, focalLength] = instruction.split('=')
            const boxId = hash(label)
            const lensIndex = boxes[boxId].findIndex(lens => lens.label === label)
            const lens = { label, focalLength: parseInt(focalLength) }
            if (lensIndex === -1) {
                boxes[boxId].push(lens)
            }
            else {
                boxes[boxId].splice(lensIndex, 1, lens)
            }
        }
    })

    return boxes
        .flatMap(
            (box, boxIndex) => box.map(
                (lens, lensIndex) => lens.focalLength
                    * (lensIndex + 1)
                    * (boxIndex + 1)
            )
        )
        .reduce((a, b) => a + b, 0)
}

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}