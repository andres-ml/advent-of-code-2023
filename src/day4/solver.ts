import { compose, intersection, unary } from 'ramda'
import { matchAll } from '../utils'

type Card = [number[], number[]]

const parse = (input: string): Card[] => input
    .split('\n')
    .map(
        (line: string) => line
            .match(': (.+)')![1]
            .split('|')
            .map(side => matchAll('\\d+', side).map(unary(parseInt))) as Card
    )

const solve1 = (cards: Card[]) => cards
    .map(([winning, numbers]) => Math.floor(Math.pow(2, intersection(winning, numbers).length - 1)))
    .reduce((a, b) => a + b, 0)

const solve2 = (cards: Card[]) => {
    const cardCountMap: Record<number, number> = {}
    function count(index: number): number {
        if (!(index in cardCountMap)) {
            const [winning, numbers] = cards[index]
            cardCountMap[index] = 1 // original card
            cardCountMap[index] += intersection(winning, numbers)
                .map((_, matchIndex) => count(index + 1 + matchIndex))
                .reduce((a, b) => a + b, 0)
        }
        return cardCountMap[index]
    }
    
    return cards.reduce((carry, _, index) => carry + count(index), 0)
}

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}