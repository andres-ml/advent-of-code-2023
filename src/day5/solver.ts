import { compose, splitEvery, unary, until } from 'ramda'

type Range = {
    destinationStart: number;
    sourceStart: number;
    length: number;
}

type Almanac = {
    seeds: number[];
    maps: {
        [source: string]: {
            destination: string;
            ranges: Range[];
        }
    }
}

const parse = (input: string): Almanac => {
    const lines = input.split('\n')
    return {
        seeds: lines[0].substring('seeds: '.length).split(' ').map(unary(parseInt)),
        maps: lines
            .slice(2)
            .filter(line => line !== '')
            .reduce((carry, line) => {
                const match = line.match(`(\\w+)-to-(\\w+) map:`)
                if (match) {
                    carry.maps[match[1]] = { destination: match[2], ranges: [] as Range[] }
                    carry.currentSource = match[1]
                }
                else {
                    const [destinationStart, sourceStart, length] = line.split(' ').map(unary(parseInt))
                    carry.maps[carry.currentSource!].ranges.push({ destinationStart, sourceStart, length })
                    carry.maps[carry.currentSource!].ranges.sort((a, b) => a.sourceStart < b.sourceStart ? -1 : 1)
                }
                return carry
            }, {
                currentSource: undefined as undefined | keyof Almanac['maps'],
                maps: {} as Almanac['maps']
            })
            ['maps']
    }
}

const solveFor = (almanac: Almanac, ranges: [number, number][]) => compose(
    ({ ranges }) => Math.min(...ranges.map(([start,]) => start)),
    until<{ stage: string; ranges: typeof ranges }, { stage: string; ranges: typeof ranges }>(
        ({ stage }) => stage === 'location',
        ({ stage, ranges }) => ({
            stage: almanac.maps[stage].destination,
            ranges: ranges.flatMap(
                ([start, end]) => {
                    let next: { start: number; end: number; offset: number; }[] = []
                    let current = start
                    almanac.maps[stage].ranges.forEach(({ sourceStart, destinationStart, length }) => {
                        next.push({ start: current, end: sourceStart, offset: 0 })
                        next.push({
                            start: sourceStart,
                            end: sourceStart + length,
                            offset: (destinationStart - sourceStart),
                        })
                        current = sourceStart + length
                    })
                    next.push({ start: current, end: end, offset: 0 })
                    // clamp and apply transformation offsets
                    return next
                        .map(item => ({
                            start: Math.max(item.start, start),
                            end: Math.min(item.end, end),
                            offset: item.offset,
                        }))
                        .filter(item => item.start < item.end)
                        .map(({ offset, start, end }) => [
                            offset + start,
                            offset + end,
                        ]) as typeof ranges
                }
            )
        })
    )
)({ stage: 'seed', ranges })

const solve1 = (almanac: Almanac) => solveFor(almanac, almanac.seeds.map(seed => [seed, seed + 1]))
const solve2 = (almanac: Almanac) => solveFor(almanac, splitEvery(2, almanac.seeds).map(([seed, length]) => [seed, seed + length]))

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}