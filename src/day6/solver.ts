import { compose, unary, zip } from 'ramda'
import { matchAll } from '../utils'

// we want to find `t` such that `(time - t)*t >= distance`,
// a.k.a. `t^2 - t*time - distance <= 0`
function solve(time: number, distance: number): number[] {
    // `b^2 − 4ac`
    const discriminant = time * time - 4 * distance
    const sqrt = Math.sqrt(discriminant)
    return [
        Math.ceil((time - sqrt) / 2),
        Math.floor((time + sqrt) / 2),
    ]
}

const solve1 = (input: string) => {
    const numbers = matchAll('\\d+', input).map(unary(parseInt))
    const times = zip(numbers, numbers.slice(numbers.length / 2))
    return times.map(([time, distance]) => solve(time, distance + 1))
        .map(([tMin, tMax]) => tMax - tMin + 1)
        .reduce((score, margin) => score * margin)
}

const solve2 = (input: string) => {
    const numbers = matchAll('\\d+', input)
    const time = parseInt(numbers.slice(0, numbers.length / 2).join(''))
    const distance = parseInt(numbers.slice(numbers.length / 2).join(''))
    const [tMin, tMax] = solve(time, distance + 1)
    return tMax - tMin + 1
}

export default {
    part1: compose(solve1),
    part2: compose(solve2),
}