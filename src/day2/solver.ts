import { compose, mergeWith } from 'ramda'
import { matchAllGroups } from '../utils'

type Configuration = {
    red: number;
    green: number;
    blue: number;
}

type Game = {
    id: number;
    rounds: Partial<Configuration>[];
}

const parse = (input: string): Game[] => input
    .split('\n')
    .map((line, index) => ({
        id: index + 1,
        rounds: line
            .split(';')
            .map(game => Object.fromEntries(
                matchAllGroups('([0-9]+) (red|green|blue)', game).map(([_, n, color]) => [color, parseInt(n)])
            ))
    }))

const solve1 = (games: Game[]) => games
    .filter(
        game => game.rounds.every(
            round => Object
                .entries({ red: 12, green: 13, blue: 14 })
                .every(([color, max]) => max >= (round[color as keyof Partial<Configuration>] ?? 0))
        )
    )
    .reduce((carry, game) => carry + game.id, 0)

const solve2 = (games: Game[]) => games
    .map(game => game.rounds.reduce<Configuration>(mergeWith(Math.max), { red: 0, green: 0, blue: 0 }))
    .reduce((carry, { red, green, blue }) => carry + red * green * blue, 0)

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}