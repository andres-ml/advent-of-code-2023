import { compose } from "ramda"
import { lcm } from "../utils"

type Module = {
    name: string;
    targets: string[];
    type: 'broadcaster' | '%' | '&';
    state: any;
}

type System = Record<string, Module>

type Signal = {
    type: 'low' | 'high'
    target: Module['name']
    source?: Module['name']
}

const parse = (input: string): System => input
    .split('\n')
    .reduce((system, line) => {
        const [label, targets] = line.split(' -> ')
        const type = label === 'broadcaster' ? 'broadcaster' : label[0] as Module['type']
        const name = label === 'broadcaster' ? label : label.slice(1)
        return {
            ...system,
            [name]: {
                name,
                type,
                targets: targets.split(', '),
            }
        }
    }, {})

const initialize = (system: System): System => {
    for (let name in system) {
        // flip flops
        if (system[name].type === '%') {
            system[name].state = false
        }
        // indirectly initialize conjunctions
        system[name]
            .targets
            .map(target => system[target])
            .filter(module => module?.type === '&')
            .forEach(module => {
                module.state = module.state || {}
                module.state[name] = 'low'
            })
    }
    return system
}

const process = (system: System, signal: Signal): Signal[] => {
    const module = system[signal.target]
    const propagate = (type: Signal['type']) => module.targets.map(
        target => ({ target, type, source: module.name })
    )

    if (module.type === 'broadcaster') {
        return propagate(signal.type)
    }

    if (module.type === '%') {
        if (signal.type === 'low') {
            module.state = !module.state
            return propagate(module.state ? 'high' : 'low')
        }
    }

    if (module.type === '&') {
        module.state[signal.source!] = signal.type
        return propagate(
            Object.values(module.state).every(last => last === 'high')
                ? 'low'
                : 'high'
        )
    }

    return []
}

const pressTheButton = (system: System, onSignal: (signal: Signal) => void) => {
    const signalQueue: Signal[] = [{ type: 'low', target: 'broadcaster' }]
    while (signalQueue.length > 0) {
        const signal = signalQueue.shift()!
        if (signal.target in system) {
            process(system, signal).forEach(signal => signalQueue.push(signal))
        }
        onSignal(signal)
    }
}

const solve1 = (system: System) => {
    const processed = { high: 0, low: 0 }
    const presses = 1e3
    for (let i = 0; i < presses; ++i) {
        pressTheButton(system, signal => processed[signal.type] += 1)
    }
    return processed.high * processed.low
}

/**
 * One must immediately be suspicious of any complex AoC problem involving loops and large numbers;
 * the solution is likely to involve LCM and magically convenient inputs (see day 8 part 2).
 * Indeed, looking at the input, 'rx' is connected to a single conjunction, and conjunction modules
 * fire a low pulse when all of its connections last fired a high pulse. We assume those connections
 * fire a high pulse at regular intervals, we find the LCM, and the gold star confirms our suspicions.
 */
const solve2 = (system: System) => {
    const findSources = (target: string) => Object
        .keys(system)
        .filter(name => system[name].targets.includes(target))
    const xrSource = findSources('rx')[0]
    const conjunctionSources = findSources(xrSource)
    const processed = Object.fromEntries(conjunctionSources.map(source => [source, null as null | number]))
    let presses = 0
    while (Object.values(processed).some(value => value === null)) {
        presses += 1
        pressTheButton(system, signal => {
            if (signal.source && processed[signal.source] === null && signal.type === 'high') {
                processed[signal.source] = presses
            }
        })
    }
    return (Object.values(processed) as number[]).reduce(lcm)
}

export default {
    part1: compose(solve1, initialize, parse),
    part2: compose(solve2, initialize, parse),
}