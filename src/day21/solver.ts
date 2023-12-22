import { compose } from "ramda"
import { Coordinate, CustomMap } from '../utils'

type Position = [number, number]

type Garden = {
    grid: string[][];
    start: Position;
}

type StepInfo = {
    even: number|undefined
    odd: number|undefined
}

const parse = (input: string): Garden => {
    const grid = input
        .split('\n')
        .map(line => line.split(''))
    const i = grid.findIndex(row => row.includes('S'))!
    const j = grid[i].indexOf('S')
    grid[i][j] = '.'
    return {
        grid,
        start: [i, j]
    }
}

const analyze = (garden: Garden) => {
    const visitable = new CustomMap<Position, StepInfo>(JSON.stringify)
    const open = [{ position: garden.start, step: 0 }]
    while (open.length > 0) {
        const current = open.shift()!
        if (!visitable.has(current.position)) {
            visitable.set(current.position, {
                even: undefined,
                odd: undefined,
            })
        }

        const info = visitable.get(current.position)!
        const infoKey = current.step % 2 === 0 ? 'even' : 'odd'
        if (info[infoKey] === undefined || info[infoKey]! > current.step) {
            info[infoKey] = current.step
            ;['UP', 'DOWN', 'LEFT', 'RIGHT']
                .map(direction => (new Coordinate(current.position.slice() as Position)).move(direction))
                .filter(coordinate => coordinate.isWithinBounds(garden.grid))
                .map(coordinate => {
                    return {
                        position: [coordinate.position[0], coordinate.position[1]] as Position,
                        step: current.step + 1,
                    }
                })
                .filter(node => garden.grid[node.position[0]][node.position[1]] === '.')
                .forEach(node => open.push(node))
        }
    }

    return visitable
}

const count = (steps: number) => (visitable: any) => [...visitable.map.values()]
    .map(info => info[steps % 2 === 0 ? 'even' : 'odd'])
    .filter(min => min !== undefined && min <= steps)
    .length

// this solution relies on the empty cross of user inputs
const solve2 = (steps: number) => (garden: Garden) => {
    const remainder = steps % garden.grid.length
    const expansions = (steps - remainder) / garden.grid.length
    const normal = analyze(garden)
    const NN = analyze({ grid: garden.grid, start: [0, remainder] })
    const EE = analyze({ grid: garden.grid, start: [remainder, remainder * 2] })
    const SS = analyze({ grid: garden.grid, start: [remainder * 2, remainder] })
    const WW = analyze({ grid: garden.grid, start: [remainder, 0] })
    const NW = analyze({ grid: garden.grid, start: [0, 0] })
    const NE = analyze({ grid: garden.grid, start: [0, remainder * 2] })
    const SE = analyze({ grid: garden.grid, start: [remainder * 2, remainder * 2] })
    const SW = analyze({ grid: garden.grid, start: [remainder * 2, 0] })
    const items = [
        // rhombus points
        [1, count(garden.grid.length - 1)(NN)],
        [1, count(garden.grid.length - 1)(EE)],
        [1, count(garden.grid.length - 1)(SS)],
        [1, count(garden.grid.length - 1)(WW)],
        // rhombus edges (small cut)
        [expansions, count(remainder - 1)(NW)],
        [expansions, count(remainder - 1)(NE)],
        [expansions, count(remainder - 1)(SE)],
        [expansions, count(remainder - 1)(SW)],
        // rhombus edges (big cut)
        [expansions - 1, count((garden.grid.length - 1) * 2 - remainder)(NW)],
        [expansions - 1, count((garden.grid.length - 1) * 2 - remainder)(NE)],
        [expansions - 1, count((garden.grid.length - 1) * 2 - remainder)(SE)],
        [expansions - 1, count((garden.grid.length - 1) * 2 - remainder)(SW)],
        // filling, even parity
        [Math.pow(expansions, 2), count(steps - 1)(normal)],
        // filling, odd parity
        [Math.pow(expansions - 1, 2), count(steps)(normal)],
    ]
    return items.reduce((carry, [times, count]) => carry + times * count, 0)
}

export default {
    part1: compose(count(64), analyze, parse),
    part2: compose(solve2(26501365), parse)
}