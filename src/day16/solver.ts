import { compose, range, uniq } from "ramda"

type Beam = {
    direction: string;
    position: [number, number];
}

const parse = (input: string) => input
    .split('\n')
    .map(line => line.split(''))

const solveFor = (grid: string[][], initialBeam: Beam) => {
    const visitedByDirection = Object.fromEntries(
        ['up', 'down', 'left', 'right'].map(direction => [direction, {} as Record<string, boolean>])
    )
    const beams: Beam[] = [initialBeam]
    const travel: Record<
        string,
        Record<
            Beam['direction'],
            (position: Beam['position']) => Beam[]
        >
    > = {
        ".": {
            down: ([i, j]) => [{ direction: 'down', position: [i + 1, j] }],
            left: ([i, j]) => [{ direction: 'left', position: [i, j - 1] }],
            right: ([i, j]) => [{ direction: 'right', position: [i, j + 1] }],
            up: ([i, j]) => [{ direction: 'up', position: [i - 1, j] }],
        },
        "\\": {
            down: (p) => travel['.']['right'](p),
            left: (p) => travel['.']['up'](p),
            right: (p) => travel['.']['down'](p),
            up: (p) => travel['.']['left'](p),
        },
        "/": {
            down: (p) => travel['.']['left'](p),
            left: (p) => travel['.']['down'](p),
            right: (p) => travel['.']['up'](p),
            up: (p) => travel['.']['right'](p),
        },
        "-": {
            left: (p) => travel['.']['left'](p),
            right: (p) => travel['.']['right'](p),
            down: (p) => [
                ...travel['.']['left'](p),
                ...travel['.']['right'](p),
            ],
            up: (p) => [
                ...travel['.']['left'](p),
                ...travel['.']['right'](p),
            ],
        },
        "|": {
            up: (p) => travel['.']['up'](p),
            down: (p) => travel['.']['down'](p),
            left: (p) => [
                ...travel['.']['up'](p),
                ...travel['.']['down'](p),
            ],
            right: (p) => [
                ...travel['.']['up'](p),
                ...travel['.']['down'](p),
            ],
        },
    }
    
    while (beams.length > 0) {
        const beam = beams.pop()!
        visitedByDirection[beam.direction][beam.position.join(',')] = true
        const [i, j] = beam.position
        const cell = grid[i][j]
        travel[cell][beam.direction](beam.position)
            .filter(
                beam => beam.position[0] >= 0
                    && beam.position[0] < grid.length
                    && beam.position[1] >= 0
                    && beam.position[1] < grid[0].length
                    && !(visitedByDirection[beam.direction][beam.position.join(',')] ?? false)
            )
            .forEach(beam => beams.push(beam))
    }

    return uniq(
        Object
            .values(visitedByDirection)
            .flatMap(visited => Object.keys(visited))
    ).length
}

const solve1 = (grid: string[][]) => {
    return solveFor(grid, { direction: 'right', position: [0, 0] })
}

const solve2 = (grid: string[][]) => {
    return [
        ...range(0, grid.length).flatMap(i => [
            { direction: 'right', position: [i, 0] },
            { direction: 'left', position: [i, grid[0].length - 1] },
        ] as Beam[]),
        ...range(0, grid[0].length).flatMap(j => [
            { direction: 'down', position: [0, j] },
            { direction: 'up', position: [j, grid.length - 1] },
        ] as Beam[]),
    ].map(beam => solveFor(grid, beam)).reduce((a, b) => Math.max(a, b))
}

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}