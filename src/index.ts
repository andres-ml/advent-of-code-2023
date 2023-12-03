import { readFileSync } from 'fs'

const args = process.argv.slice(2)

if (args.length < 1) {
    console.error('Usage: run <day> [<part> [<inputFile>]]')
    process.exit(1)
}

const day = parseInt(args[0])
const part = args.length > 1 ? parseInt(args[1]) : undefined
const inputFile = args.length > 2 ? args[2] : `src/day${day}/input.txt`

type Solver = (input: string) => string | object
const solution: { part1?: Solver; part2?: Solver } = require(`./day${day}/solver`).default
const input = readFileSync(inputFile, 'utf-8').trim()

const solve = (part: 1 | 2) => {
    const solver = solution[`part${part}`]
    if (solver) {
        const start = Date.now()
        const output = solver(input)
        const ms = Date.now() - start
        const outputString = output instanceof String ? output : JSON.stringify(output, null, 4)
        console.log(`Part ${part} [${ms} ms]: ${outputString}`)
    }
    else {
        console.log(`Part ${part} not ready yet`)
    }
}

console.log(`Day ${day}:`);
if (part !== 2) {
    solve(1)
}
if (part !== 1) {
    solve(2)
}
