import { ascend, compose, range, sortWith } from 'ramda'

const HAND_SIZE = 5

type Hand = {
    cards: string[];
    bid: number;
    cardCountMap: Record<string, number>;
}

const parse = (input: string): Hand[] => input
    .split('\n')
    .map(line => line.split(' '))
    .map(([cards, bid]) => ({
        cards: cards.split(''),
        bid: parseInt(bid),
        cardCountMap: cards.split('').reduce(
            (counts, card) => ({ ...counts, [card]: (counts[card] ?? 0) + 1 }),
            {} as Record<string, number>
        ),
    }))

// part 1
const setCounts = (hands: Hand[]) => hands.map(hand => ({
    ...hand,
    counts: Object.values(hand.cardCountMap).sort().reverse()
}))

// part 2
const setCountsWithJokers = (hands: Hand[]) => hands.map(hand => {
    const { J, ...rest } = hand.cardCountMap
    const counts = Object.values(rest).sort().reverse()
    // 'JJJJJ' case
    if (counts.length === 0) {
        counts.push(0)
    }
    // best use of jokers is always to add to your highest count
    counts[0] += J ?? 0
    return { ...hand, counts }
})

const sortByScore = (cardPriority: string) => sortWith([
    // since each combination that is stronger has a higher number of cards, we can be greedy and sort by that
    ...range(0, HAND_SIZE).map(index => ascend(({ counts }: Hand & { counts: number[] }) => counts[index] ?? 0)),
    // then break ties based on first, second, etc. occurrences
    ...range(0, HAND_SIZE).map(index => ascend((hand: Hand) => cardPriority.indexOf(hand.cards[index]))),
])

const getScore = (hands: Hand[]) => hands.reduce((score, hand, index) => score + hand.bid * (index + 1), 0)

export default {
    part1: compose(getScore, sortByScore('23456789TJQKA'), setCounts, parse),
    part2: compose(getScore, sortByScore('J23456789TQKA'), setCountsWithJokers, parse),
}