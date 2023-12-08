export const matchAllGroups = (regex: string, string: string) => [...string.matchAll(new RegExp(regex, 'g'))]

export const matchAll = (regex: string, string: string) => matchAllGroups(regex, string).map(match => match[0])

export const gcd = (a: number, b: number): number => {
    if (a < b) {
        [a, b] = [b, a]
    }
    return b > 0 ? gcd(b, a % b) : a
}

export const lcm = (a: number, b: number) => (a * b) / gcd(a, b)