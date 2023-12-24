import { compose, unary, zip } from "ramda"

type Vector = {x: number, y: number, z: number}

type Hailstone = {
    p: Vector;
    v: Vector;
}

const parse = (input: string): Hailstone[] => input
    .split('\n')
    .map(line => {
        const [p, v] = line
            .split(' @ ')
            .map(vector => Object.fromEntries(zip(['x', 'y', 'z'], vector.split(', ').map(unary(parseInt)))) as Vector)
        return { p, v }
    })

const findIntersectionPoint = (ha: Hailstone, hb: Hailstone): Vector|null => {
    const normalize = (h: Hailstone): [number, number] => {
        const a = h.v.y / h.v.x
        const c = h.p.y - h.p.x * a
        return [a, c]
    }
    const [a, c] = normalize(ha)
    const [b, d] = normalize(hb)

    // check if they never cross (there are no overlaps)
    if (a === c) {
        return null
    }

    const x = (d - c) / (a - b)
    // no going back in time
    if (
        Math.sign(x - ha.p.x) !== Math.sign(ha.v.x) ||
        Math.sign(x - hb.p.x) !== Math.sign(hb.v.x)
    ) {
        return null
    }

    return { x, y: a * x + c, z: -1 }
}

const solve1 = (min: number, max: number) => (hailstones: Hailstone[]) => hailstones
    .flatMap((hailstone, index) => hailstones.slice(index + 1).map(other => findIntersectionPoint(hailstone, other)))
    .filter(
        intersection => intersection !== null
            && intersection.x >= min && intersection.x <= max
            && intersection.y >= min && intersection.y <= max
    )
    .length

export default {
    part1: compose(solve1(2e14, 4e14), parse),
}