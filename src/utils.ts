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
    private map: Map<string, Value>
  
    constructor(keyFunction: (key: Key) => string) {
        this.keyFunction = keyFunction
        this.map = new Map()
    }
  
    set(key: Key, value: Value): void {
        this.map.set(this.keyFunction(key), value)
    }
  
    get(key: Key): Value | undefined {
        return this.map.get(this.keyFunction(key))
    }

}