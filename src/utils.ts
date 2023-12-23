import { clamp } from "ramda"

export const matchAllGroups = (regex: string, string: string) => [...string.matchAll(new RegExp(regex, 'g'))]

export const matchAll = (regex: string, string: string) => matchAllGroups(regex, string).map(match => match[0])

export const gcd = (a: number, b: number): number => {
    if (a < b) {
        [a, b] = [b, a]
    }
    return b > 0 ? gcd(b, a % b) : a
}

export const lcm = (a: number, b: number) => (a * b) / gcd(a, b)

export const memoize = <Args extends unknown[], Result>(
    func: (...args: Args) => Result
): (...args: Args) => Result => {
    const cache = new Map<string, Result>()
    return (...args) => {
        const key = JSON.stringify(args)
        if (!cache.has(key)) {
            cache.set(key, func(...args))
        }
        return cache.get(key)!
    }
}

export const iterateN = <T>(times: number, callable: (arg: T) => T, input: T) => {
    for (let i = 0; i < times; ++i) {
        input = callable(input)
    }
    return input
}

export class CustomMap<Key, Value>
{
    private keyFunction: (key: Key) => string
    private reverseKeyFunction: ((key: string) => Key) | undefined
    public map: Map<string, Value>
  
    constructor(
        keyFunction: (key: Key) => string,
        reverseKeyFunction: ((key: string) => Key )| undefined = undefined,
    ) {
        this.keyFunction = keyFunction
        this.reverseKeyFunction = reverseKeyFunction
        this.map = new Map()
    }
  
    set(key: Key, value: Value): void {
        this.map.set(this.keyFunction(key), value)
    }
  
    get(key: Key): Value | undefined {
        return this.map.get(this.keyFunction(key))
    }

    has(key: Key): boolean {
        return this.map.has(this.keyFunction(key))
    }

    keys(): Key[] {
        return [...this.map.keys()].map(this.reverseKeyFunction!)
    }

    entries(): [Key, Value][] {
        return this.keys().map(key => [key, this.get(key)]) as [Key, Value][]
    }

}

type Position = [number, number]

export class Coordinate {
    public position: Position;
    
    constructor(position: Position) {
        this.position = position.slice() as Position
    }

    move(direction: string, length = 1) {
        direction = direction.toUpperCase()
        if (['U', 'N', 'UP', '^'].includes(direction)) {
            this.position[0] += -length
        }
        if (['L', 'W', 'LEFT', '<'].includes(direction)) {
            this.position[1] += -length
        }
        if (['R', 'E', 'RIGHT', '>'].includes(direction)) {
            this.position[1] += length
        }
        if (['S', 'D', 'DOWN', 'V'].includes(direction)) {
            this.position[0] += length
        }
        return this
    }

    explore() {
        return [
            new Coordinate(this.position).move('UP'),
            new Coordinate(this.position).move('DOWN'),
            new Coordinate(this.position).move('LEFT'),
            new Coordinate(this.position).move('RIGHT'),
        ]
    }

    clamp(grid: unknown[][]) {
        this.position[0] = clamp(0, grid.length, this.position[0])
        this.position[1] = clamp(0, grid[0]?.length ?? 0, this.position[0])
        return this
    }

    isWithinBounds(grid: unknown[][]) {
        return this.position[0] >= 0
            && this.position[1] >= 0
            && this.position[0] < grid.length
            && this.position[1] < grid[0].length
    }

}