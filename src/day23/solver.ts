import { binary, compose, equals, map, range, reduce, xprod } from "ramda"
import { Coordinate } from '../utils'

type Position = [number, number]

const parse = (input: string): string[][] => {
    return input
        .split('\n')
        .map(line => line.split(''))
}

const paths = (grid: string[][]): Position[][] => {
    const start: Position = [0, grid[0].findIndex(equals('.'))]
    const target: Position = [grid.length - 1, grid[grid.length - 1].findIndex(equals('.'))]

    const find = (
        start: Position,
        branchingPoints: Position[] = []
    ): Position[][] => {
        const path = [start]
        let current = start
        while (!equals(current, target)) {
            const coordinate = new Coordinate(current)
            const cell = grid[current[0]][current[1]]
            const movements = cell === '.' ? coordinate.explore() : [coordinate.move(cell)]
            const next = movements.filter(
                coordinate => coordinate.isWithinBounds(grid)
                    // valid movement
                    && grid[coordinate.position[0]][coordinate.position[1]] !== '#'
                    // no going back immediately
                    && (path.length < 2 || !equals(path[path.length - 2], coordinate.position))
                    // not going back to a visited intersection
                    && !branchingPoints.some(position => equals(position, coordinate.position))
            )

            if (next.length === 1) {
                path.push(next[0].position)
                current = next[0].position
            }
            else {
                return next
                    .flatMap(coordinate => find(coordinate.position, [...branchingPoints, current]))
                    .filter(subpath => subpath.length > 0)
                    .map(subpath => [...path, ...subpath])
            }
        }
        return [path]
    }
    
    return find(start)
}

const solve1 = compose(
    reduce(binary(Math.max), 0),
    map(path => path.length - 1),
    paths
)

// input is just long, 1-width paths: we find the intersections and their distances, then brute force that
// solution not too pretty -- feeling the AoC burnout by now
const solve2 = (grid: string[][]) => {
    const start: Position = [0, grid[0].findIndex(equals('.'))]
    const target: Position = [grid.length - 1, grid[grid.length - 1].findIndex(equals('.'))]
    const explore = (coordinate: Coordinate) => coordinate.explore().filter(
        coordinate => coordinate.isWithinBounds(grid) && grid[coordinate.position[0]][coordinate.position[1]] !== '#'
    )

    const intersections: Position[] = [start, target]
    xprod(
        range(0, grid.length),
        range(0, grid[0].length)
    ).forEach(([i, j]) => {
        if (grid[i][j] !== '#') {
            const coordinate = new Coordinate([i, j])
            const movements = explore(coordinate)
            if (movements.length > 2) {
                intersections.push([i, j])
            }
        }
    })

    const graph = {} as Record<string, Record<string, number>>
    intersections.forEach(intersection => graph[intersection.join(',')] = {})

    const bfs = (from: Position) => {
        const open = [[from]]
        const found = [] as typeof open
        while (open.length > 0) {
            const current = open.shift()!
            const coordinate = new Coordinate(current[current.length - 1])
            const next = explore(coordinate).filter(
                // no going back immediately
                coordinate => (current.length < 2 || !equals(current[current.length - 2], coordinate.position))
            )
            next.forEach(item => {
                const path = [...current, item.position]
                if (item.position.join(',') in graph) {
                    found.push(path)
                }
                else {
                    open.push(path)
                }
            })
        }
        return found
    }

    // we're exploring both ways but w/e, it's nowhere close to the bottleneck
    intersections.forEach(intersection => {
        bfs(intersection).forEach(result => {
            const end = result[result.length - 1]
            graph[intersection.join(',')][end.join(',')] = result.length - 1
        })
    })
    
    let max = 0
    const stack = [{length: 0, node: start, visited: {} as Record<string, true>}]
    while (stack.length > 0) {
        const { node, length, visited } = stack.pop()!
        const key = node.join(',')
        if (key === target.join(',')) {
            max = Math.max(max, length)
        }
        else {
            for (let neighbour in graph[key]) {
                if (!visited[neighbour]) {
                    stack.push({ node: neighbour.split(',') as any as Position, length: length + graph[key][neighbour], visited: { ...visited, [neighbour]: true } })
                }
            }
        }
    }
    return max
}

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}