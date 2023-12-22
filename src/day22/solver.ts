import { binary, compose, difference, range, repeat, unary, uniq, xprod } from "ramda"

type Position = {
    x: number;
    y: number;
    z: number;
}

type Block = {
    id: number;
    corners: [Position, Position];
}

type Result = {
    world: (Block['id']|undefined)[][][]
    blocks: Block[]
}

const parse = (input: string): Block[] => input
    .split('\n')
    .map((line, index) => {
        return {
            id: index,
            corners: line.split('~').map(xyz => {
                const [x, y, z] = xyz.split(',').map(unary(parseInt))
                return { x, y, z }
            }) as Block['corners'],
         }
    })

const settle = (blocks: Block[]): Result => {
    const N = blocks.flatMap(block => block.corners).map(corner => corner.x).reduce(binary(Math.max))
    const M = blocks.flatMap(block => block.corners).map(corner => corner.y).reduce(binary(Math.max))
    const world = range(0, N + 1).map(() => range(0, M + 1).map(() => [])) as Result['world']
    const settled = [] as Result['blocks']
    // ensure blocks fall in order -- from bottom to top
    blocks.sort((a, b) => a.corners[0].z < b.corners[0].z ? -1 : 1)
    while (blocks.length > 0) {
        const block = blocks.shift()!
        const area = xprod(
            range(block.corners[0].x, block.corners[1].x + 1),
            range(block.corners[0].y, block.corners[1].y + 1)
        )
        // get highest Z within blocks' XY area
        const supportZ = area.reduce((height, [x, y]) => Math.max(height, world[x][y].length), 0)
        // fill the world's info
        area.forEach(([x, y]) => {
            // empty spaces
            world[x][y] = world[x][y].concat(repeat(undefined, supportZ - world[x][y].length))
            // block itself
            range(block.corners[0].z, block.corners[1].z + 1).forEach(() => {
                world[x][y].push(block.id)
            })
        })
        // update block's z
        const fallingDistance = block.corners[0].z - supportZ - 1
        block.corners[0].z -= fallingDistance
        block.corners[1].z -= fallingDistance
        settled.push(block)
    }
    return { world, blocks: settled }
}

// blocks that `block` supports
const supporting = (result: Result, block: Block): Block['id'][] => uniq(
    xprod(
        range(block.corners[0].x, block.corners[1].x + 1),
        range(block.corners[0].y, block.corners[1].y + 1)
    ).map(([x, y]) => result.world[x][y][block.corners[1].z])
    .filter(id => id !== undefined) as Block['id'][]
)

// blocks that support `block`
const supporters = (result: Result, block: Block): Block['id'][] => uniq(
    xprod(
        range(block.corners[0].x, block.corners[1].x + 1),
        range(block.corners[0].y, block.corners[1].y + 1)
    ).map(([x, y]) => result.world[x][y][block.corners[0].z - 2])
    .filter(id => id !== undefined) as Block['id'][]
)

const solve1 = (result: Result) => {
    const blocksById = Object.fromEntries(result.blocks.map(block => [block.id, block]))
    return result
        .blocks
        .filter(
            // blocks that support blocks with only 1 supporting block
            block => supporting(result, block)
                .map(id => blocksById[id])
                .every(supported => supporters(result, supported).length > 1)
        )
        .length
}

const solve2 = (result: Result) => {
    // complete list of dependencies, e.g. if A supports B and B supports C, map[C] will be [A, B]
    const indirectDependencyMap = {} as Record<Block['id'], Block['id'][]>
    
    // fill dependency map
    result
        .blocks
        // dependencies must be visited in order
        .sort((a, b) => a.corners[1].z > b.corners[1].z ? -1 : 1)
        .forEach(block => {
            const directDependencies = supporters(result, block)
            indirectDependencyMap[block.id] = uniq([
                ...directDependencies,
                ...directDependencies.flatMap(id => directDependencies[id] ?? [])
            ])
        })

    // count full dependencies by removing pieces until nothing changes
    const countFallen = (id: Block['id']) => {
        let dependencies = result.blocks
            .map<[Block['id'], Block['id'][]]>(block => [block.id, indirectDependencyMap[block.id]])
            .filter(([, value]) => value.length > 0)
        let removedCount = 0
        let lastRemoved = [id] as Block['id'][]
        while (lastRemoved.length > 0) {
            removedCount += lastRemoved.length
            // delete removed blocks from dependencies
            dependencies = dependencies.map(([id, list]) => [id, difference(list, lastRemoved)])
            // note ids of blocks that are no longer supported
            lastRemoved = dependencies.filter(([, list]) => list.length === 0).map(([id]) => id)
            dependencies = dependencies.filter(([, list]) => list.length !== 0)
        }
        return removedCount - 1 // don't count self as dependency
    }

    return result.blocks.map(block => countFallen(block.id)).reduce((a, b) => a + b, 0)
}

export default {
    part1: compose(solve1, settle, parse),
    part2: compose(solve2, settle, parse),
}