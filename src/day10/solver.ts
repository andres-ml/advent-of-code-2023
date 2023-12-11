import { compose, range, xprod } from 'ramda'

type Coord = [number, number]
type Pipe = 
    | "F"
    | "J"
    | "L"
    | "7"
    | "|"
    | "-"
    | "."

const connectionMap: Record<Pipe, Coord[]> = {
    "F": [[+1, 0], [0, +1]],
    "J": [[-1, 0], [0, -1]],
    "L": [[-1, 0], [0, +1]],
    "7": [[0, -1], [+1, 0]],
    "|": [[-1, 0], [+1, 0]],
    "-": [[0, -1], [0, +1]],
    ".": [],
}

const parse = (input: string) => input
    .split('\n')
    .map(line => line.split('') as Pipe[])

const findPath = (grid: string[][]): {
    replacement: Pipe;
    path: Coord[];
} => {
    const i = grid.findIndex(row => row.includes('S'))
    const j = grid[i].indexOf('S')

    const travel = (start: Coord): Coord[]|null => {
        let current = start
        const visited: Coord[] = []
        while (!(
            visited.length > 0
            && current[0] === visited[0][0]
            && current[1] === visited[0][1]
        )) {
            const pipe = grid[current[0]][current[1]] as Pipe
            let found = null as any
            for (const movement of connectionMap[pipe]) {
                const next: Coord = [current[0] + movement[0], current[1] + movement[1]]
                if (
                    // within bounds
                    next[0] >= 0
                    && next[0] < grid.length
                    && next[1] >= 0
                    && next[1] < grid[0].length
                    // no going backward
                    && (
                        visited.length === 0
                        || next[0] !== visited[visited.length - 1][0]
                        || next[1] !== visited[visited.length - 1][1]
                    )
                ) {
                    const nextPipe = grid[next[0]][next[1]] as Pipe
                    // movement is valid / traveling the other way around works
                    if (connectionMap[nextPipe].some(inverse => inverse[0] === movement[0] * -1 && inverse[1] === movement[1] * -1)) {
                        found = next
                        break
                    }
                }
            }
            if (found === null) {
                return null
            }
            visited.push(current)
            current = found
        }
        return visited
    }

    let path = null as null | Coord[]
    for (const replacement in connectionMap) {
        grid[i][j] = replacement
        path = travel([i, j])
        if (path) {
            return {
                replacement: replacement as Pipe,
                path
            }
        }
    }

    return { replacement: '.', path: [] }
}

const solve1 = (grid: Pipe[][]) => {
    const path = findPath(grid).path
    return Math.ceil(path.length / 2)
}

const solve2 = (grid: Pipe[][]) => {
    const { path, replacement } = findPath(grid)
    grid[path[0][0]][path[0][1]] = replacement

    // path indexed by coordinates for easy lookup
    const pathMap: Record<number, Record<number, true>> = {}
    path.forEach(([i, j]) => {
        pathMap[i] = pathMap[i] ?? {}
        pathMap[i][j] = true
    })
    const isInPath = ([i, j]: Coord) => pathMap[i]?.[j] ?? false

    // scan/sweep a line of coordinates for open/closed regions
    const scan = (coords: Coord[], axis: 0|1) => coords.reduce(
        ({ scanned, openings }, [i, j]) => {
            // pipes not in path also count as openings
            if (grid[i][j] === '.' || !isInPath([i, j])) {
                scanned.push(openings[-1] || openings[1])
            }
            else {
                scanned.push(false)
                // toggle openings based on pipe connections
                connectionMap[grid[i][j]]
                    .map(movement => movement[axis])
                    .filter(offset => offset !== 0)
                    .forEach(direction => openings[direction as -1|1] = !openings[direction as -1|1])
            }
            return { scanned, openings }
        },
        {
            scanned: [] as boolean[],
            openings: {
                [-1]: false,
                [+1]: false,
            },
        }
    ).scanned

    const scans = grid.map((_, i) => scan(range(0, grid[0].length).map(j => [i, j]), 0))
    
    return xprod(range(0, grid.length), range(0, grid[0].length))
        .filter(([i, j]) => scans[i][j])
        .length
}

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}