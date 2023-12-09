import { compose, map, unary } from 'ramda'

const parse = (input: string) => input
    .split('\n')
    .map(line => line.split(' ').map(unary(parseInt)))

const develop = (history: number[], previous: number[][] = []): number[][] => history.every(n => n === 0)
    ? previous
    : develop(history.slice(1).map((n, index) => n - history[index]), [history, ...previous])

const extrapolateForward = (histories: number[][]): number => histories
    .map(history => history[history.length - 1])
    .reduce((extrapolated, last) => extrapolated + last, 0)

const extrapolateBackward = (histories: number[][]): number => histories
    .map(history => history[0])
    .reduce((extrapolated, first) => first - extrapolated, 0)

const sum = (numbers: number[]) => numbers.reduce((a, b) => a + b)

export default {
    part1: compose(sum, map(extrapolateForward), map(develop), parse),
    part2: compose(sum, map(extrapolateBackward), map(develop), parse),
}