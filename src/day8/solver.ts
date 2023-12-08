import { compose, until } from 'ramda'
import { lcm, matchAll } from '../utils'

type Instructions = {
    directions: ('R'|'L')[];
    network: {
        [key: string]: {
            L: string;
            R: string;
        }
    }
}

const parse = (input: string): Instructions => {
    const [directions, _, ...networks] = input.split('\n')
    return {
        directions: directions.split(''),
        network: networks.reduce(
            (network, line) => {
                const [from, L, R] = matchAll('[A-Z0-9]{3}', line)
                return { ...network, [from]: { L, R } }
            },
            {}
        ),
    } as Instructions
}

const solve = (input: Instructions, start: string, target: string) => until(
    ({ steps, current }) => current.endsWith(target),
    ({ steps, current }) => ({
        steps: steps + 1,
        current: input.network[current][input.directions[steps % input.directions.length]],
    }),
    ({ steps: 0, current: start })
).steps

const solve1 = (input: Instructions): number => solve(input, 'AAA', 'ZZZ')

// input is conveniently crafted such that all paths loop to the start node and visit
// exactly 1 target node, turning a complex problem into a simple LCM
const solve2 = (input: Instructions) => Object
    .keys(input.network)
    .filter(node => node.endsWith('A'))
    .map(node => solve(input, node, 'Z'))
    .reduce(lcm)

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}