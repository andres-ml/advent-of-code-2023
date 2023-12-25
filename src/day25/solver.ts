import { compose, uniq } from 'ramda'
import { matchAll } from '../utils'

type Vertex = number
type Edge = [number, number]
type Graph = {
    vertices: Vertex[];
    edges: Edge[];
}

const parse = (input: string): Graph => {
    const edges: Edge[] = []
    const names = uniq(matchAll('[a-z]+', input))
    const indexesByName = Object.fromEntries(names.map((name, index) => [name, index]))
    input.split('\n').forEach(line => {
        const [label, connections] = line.split(': ')
        connections.split(' ').forEach(other => {
            edges.push([
                indexesByName[label],
                indexesByName[other],
            ])
        })
    })
    return {
        vertices: Object.values(indexesByName),
        edges: edges,
    }
}

const solve1 = (graph: Graph) => {
    let cut: undefined | Edge[] = undefined
    let attempts = 0
    // since correctness not ensured but problem guarantees size=3, run until we find it
    // this process can take an arbitrarily long time; usually ~30s
    while (cut === undefined || cut.length > 3) {
        cut = kragerMinCut(graph)
        attempts += 1
    }

    // bfs for size of disconnected group;
    // start at any vertex of one of the cut's edges,
    // and ignore the cut's edges during exploration
    const connections = Object.fromEntries(graph.vertices.map(index => [index, [] as number[]]))
    graph.edges.forEach(([u, v]) => {
        if (!cut!.some(([a, b]) => a === u && v === b)) {
            connections[u].push(v)
            connections[v].push(u)
        }
    })
    const componentVertices = new Set<number>()
    const open = [cut[0][0]]
    while (open.length > 0) {
        const vertex = open.shift()!
        connections[vertex].forEach(v => {
            if (!componentVertices.has(v)) {
                componentVertices.add(v)
                open.push(v)
            }
        })
    }

    return (graph.vertices.length - componentVertices.size) * componentVertices.size
}

const randomPick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

// find a min-cut of the graph (correctness not ensured)
// note: using an additional structure to track vertex connections instead
// of searching the edge list would improve this function's performance; I'm skipping it
// because of AoC burnout
const kragerMinCut = (graph: Graph): Edge[] => {
    const remainingVertices = graph.vertices.slice()
    // keep track of original edge definitions
    let edges = graph.edges.map(edge => ({ original: edge, edge: edge.slice() }))
    while (remainingVertices.length > 2) {
        const u = randomPick(remainingVertices)
        // we can't random-pick an edge because some vertices are connected by multiple edges,
        // and thus would be more likely to be picked; so we first build a plain list of connections without repeats
        const connected = uniq(
            edges
                .map(item => item.edge)
                .filter(edge => edge[0] === u || edge[1] === u)
                .flat()
        ).filter(v => v !== u)
        const v = randomPick(connected)
        edges = edges
            // reconnect vertices
            .map(({ edge, original }) => ({
                original,
                edge: [
                    edge[0] === v ? u : edge[0],
                    edge[1] === v ? u : edge[1],
                ]
            }))
            // no loops
            .filter(({ edge }) => edge[0] !== edge[1])
        // stop tracking removed vertext
        remainingVertices.splice(remainingVertices.indexOf(v), 1)
    }

    return edges.map(({ original }) => original)
}

export default {
    part1: compose(solve1, parse)
}