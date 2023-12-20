import { compose, indexBy, omit } from "ramda"

type Part = {
    x: number;
    m: number;
    a: number;
    s: number;
    location: string;
}

type Workflow = {
    name: string;
    rules: {
        condition?: {
            xmas: keyof Omit<Part, 'location'>
            value: number
            operator: '<'|'>'
        };
        location: Workflow['name']|'A'|'R'
    }[]
}

const parse = (input: string) => {
    const parseWorkflow = (workflow: string): Workflow => {
        const bracketIndex = workflow.indexOf('{')
        return {
            name: workflow.slice(0, bracketIndex),
            rules: workflow
                .slice(bracketIndex + 1, -1)
                .split(',')
                .map(rule => {
                    const [left, right] = rule.split(':')
                    if (right === undefined) {
                        return { location: left }
                    }
                    const xmas = left[0] as keyof Omit<Part, 'location'>
                    const operator = left[1] as '<'|'>'
                    const value = parseInt(left.slice(2))
                    return {
                        location: right,
                        condition: { xmas, operator, value }
                    }
                })
        }
    }
    const parsePart = (part: string) => part
        .slice(1, -1)
        .split(',')
        .map(prop => prop.split('='))
        .reduce(
            (part, [xmas, value]) => ({...part, [xmas]: parseInt(value) }),
            { location: 'in' }
        ) as Part
    
    const [workflows, parts] = input.split('\n\n')
    return {
        workflows: workflows.split('\n').map(parseWorkflow),
        parts: parts.split('\n').map(parsePart),
    }
}

const solve1 = ({ workflows, parts }: { workflows: Workflow[]; parts: Part[] }) => {
    const workflowMap = indexBy(workflow => workflow.name, workflows)
    const notDistributed = parts.slice()
    const accepted = []
    while (notDistributed.length > 0) {
        const part = notDistributed.pop()!
        if (part.location === 'A') {
            accepted.push(part)
        }
        else if (part.location !== 'R') {
            part.location = workflowMap[part.location]
                .rules
                .find(rule => rule.condition === undefined || ({
                    '<': part[rule.condition.xmas] < rule.condition.value,
                    '>': part[rule.condition.xmas] > rule.condition.value,
                })[rule.condition.operator])!
                .location
            notDistributed.push(part)
        }
    }
    return accepted
        .map(omit(['location']))
        .flatMap(Object.values)
        .reduce((a, b) => a + b, 0)
}

const solve2 = ({ workflows }: { workflows: Workflow[] }) => {
    const workflowMap = indexBy(workflow => workflow.name, workflows)
    const scans = [
        {
            x: [1, 4000],
            m: [1, 4000],
            a: [1, 4000],
            s: [1, 4000],
            location: 'in'
        }
    ]
    const accepted = []
    while (scans.length > 0) {
        const scan = scans.pop()!
        if (scan.location === 'A') {
            accepted.push(scan)
        }
        else if (scan.location !== 'R') {
            let fallback = undefined
            workflowMap[scan.location].rules.forEach(rule => {
                if (rule.condition === undefined) {
                    fallback = rule.location
                    return
                }
                const [from, to] = scan[rule.condition.xmas]
                if (rule.condition.operator === '<') {
                    scans.push({ ...scan, [rule.condition.xmas]: [from, Math.min(to, rule.condition.value - 1)], location: rule.location })
                    scan[rule.condition.xmas] = [Math.max(from, rule.condition.value), to]
                }
                else {
                    scans.push({ ...scan, [rule.condition.xmas]: [Math.max(from, rule.condition.value + 1), to], location: rule.location })
                    scan[rule.condition.xmas] = [from, Math.min(to, rule.condition.value)]
                }
            })
            scans.push({ ...scan, location: fallback! })
        }
    }
    const xmasKeys = ['x', 'm', 'a', 's'] as const
    return accepted
        .filter(scan => xmasKeys.every(xmas => scan[xmas][0] <= scan[xmas][1]))
        .map(
            scan => xmasKeys
                .map(xmas => scan[xmas][1] - scan[xmas][0] + 1)
                .reduce((a, b) => a * b),
        )
        .reduce((a, b) => a + b, 0)
}

export default {
    part1: compose(solve1, parse),
    part2: compose(solve2, parse),
}