import { compose, equals, unary } from "ramda"
import { MinPriorityQueue } from '@datastructures-js/priority-queue'
import { CustomMap } from "../utils"

type City = number[][];
type Position = [number, number]
type MoveState = {
    position: Position;
    direction: Position;
    consecutiveMovements: number;
}

const parse = (input: string): City => input
    .split('\n')
    .map(line => line.split('').map(unary(parseInt)))

const serializeMoveState = (key: MoveState) => [
    key.position[0],
    key.position[1],
    key.direction[0],
    key.direction[1],
    key.consecutiveMovements,
].join(',')

const manhattan = (a: Position, b: Position): number => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
const directions = [
    [-1, 0],
    [+1, 0],
    [0, -1],
    [0, +1],
]

const shortestPath = (
    consecutiveMin: number, 
    consecutiveMax: number, 
    city: City, 
    start: Position, 
    target: Position
): MoveState[] => {
    const sourceMap = new CustomMap<MoveState, MoveState>(serializeMoveState)
    const costMap = new CustomMap<MoveState, number>(serializeMoveState)
    const heuristicScoreMap = new CustomMap<MoveState, number>(serializeMoveState)
    const queue = new MinPriorityQueue<MoveState>(move => heuristicScoreMap.get(move)!)

    const initialMove: MoveState = { position: start, direction: [0, 0], consecutiveMovements: 0 }
    costMap.set(initialMove, 0)
    heuristicScoreMap.set(initialMove, manhattan(initialMove.position, target))
    queue.push(initialMove)

    let i = 0;
    while (!queue.isEmpty()) {
        const current = queue.pop()
        if (equals(current.position, target) && current.consecutiveMovements >= consecutiveMin) {
            const path = [current]
            while (!equals(path[0].position, start)) {
                path.unshift(sourceMap.get(path[0])!)
            }
            return path
        }

        const moves = directions
            .filter(
                direction =>
                    // no going backwards
                    (direction[0] !== -current.direction[0] || direction[1] !== -current.direction[1])
                    && (
                        // no over or underturning
                        current.consecutiveMovements === 0
                        || current.consecutiveMovements >= consecutiveMin
                        || (direction[0] === current.direction[0] && direction[1] === current.direction[1])
                    )
            )
            .map(direction => ({
                position: [
                    current.position[0] + direction[0],
                    current.position[1] + direction[1],
                ],
                direction: direction,
                consecutiveMovements: equals(direction, current.direction) ? 1 + current.consecutiveMovements : 1,
            }) as MoveState)
            // reject invalids
            .filter(
                next => next.position[0] >= 0
                    && next.position[0] < city.length
                    && next.position[1] >= 0
                    && next.position[1] < city[0].length
                    && next.consecutiveMovements <= consecutiveMax
            )

        moves.forEach(next => {
            const score = costMap.get(current)! + city[next.position[0]][next.position[1]]
            if (score < (costMap.get(next) ?? Infinity)) {
                sourceMap.set(next, current)
                costMap.set(next, score)
                heuristicScoreMap.set(next, score + manhattan(next.position, target))
                queue.push(next)
            }
        })
    }

    return []
}

const solveFor = (min: number, max: number) => (city: City) => {
    const path = shortestPath(min, max, city, [0, 0], [city.length - 1, city[0].length - 1])
    return path.slice(1).reduce((heat, move) => heat + city[move.position[0]][move.position[1]], 0)
}

export default {
    part1: compose(solveFor(0, 3), parse),
    part2: compose(solveFor(4, 10), parse),
}