import { compose, until } from 'ramda'
import { matchAll } from '../utils'

const parse = (input: string) => input.split('\n')

const solve1 = (lines: string[]) => lines
    .map((line: string) => matchAll('[0-9]', line))
    .flatMap(numbers => numbers[0] + numbers[numbers.length - 1])
    .reduce((carry, n) => carry + parseInt(n), 0)

const digitNameMap: { [key: string]: string } = {
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
}

const writtenDigitRegex = new RegExp(Object.keys(digitNameMap).join('|'))
const replacewrittenDigit = (line: string) => line.replace(writtenDigitRegex, match => digitNameMap[match] + match.substring(1)) // append rest of the match to account for overlaps
const replacewrittenDigits = (lines: string[]) => lines.map(
    line => until(
        ([last, line]) => line === last,
        ([_, line]) => [line, replacewrittenDigit(line)],
        [line, replacewrittenDigit(line)]
    )[0]
)

export default {
    part1: compose(solve1, parse),
    part2: compose(solve1, replacewrittenDigits, parse),
}