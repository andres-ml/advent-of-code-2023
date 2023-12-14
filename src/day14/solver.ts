import { compose, range } from 'ramda'
import { iterateN } from '../utils'

const parse = (input: string) => input.split('\n')

const rotateClockwise = (platform: string[]) => range(0, platform[0].length).map(
    j => range(0, platform.length)
        .map(i => platform[platform.length - 1 - i][j])
        .join('')
)

const rotateCounterclockwise = compose(rotateClockwise, rotateClockwise, rotateClockwise)

const tiltLeft = (platform: string[]): string[] => platform.map(
    line => line
        .split('#')
        .map(chunk => chunk.split('').sort(a => a === 'O' ? -1 : 1).join(''))
        .join('#')
)

const score = (platform: string[]) => range(0, platform[0].length)
    .map(j => platform.map(line => line[j]).filter(c => c === 'O').length * (platform[0].length - j))
    .reduce((a, b) => a + b, 0)

const cycleNTimes = (cycles: number) => (platform: string[]) => {
    const states: string[] = []
    let loopStart = -1;
    while (loopStart === -1) {
        platform = iterateN(4, compose(rotateClockwise, tiltLeft), platform)
        const state = platform.join('\n')
        loopStart = states.indexOf(state)
        if (loopStart === -1) {
            states.push(state)
        }
    }

    return states
        [loopStart + (cycles - loopStart - 1) % (states.length - loopStart)]
        .split('\n')
}

export default {
    part1: compose(score, tiltLeft, rotateCounterclockwise, parse),
    part2: compose(score, cycleNTimes(1e9), rotateCounterclockwise, parse),
}