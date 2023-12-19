import { compose } from "ramda"
import { Coordinate } from "../utils"

type Piece = [number, number][]

// given a sequence of movements, return a list of coordinates
const tracePiece = (lines: [string, number][]): Piece => {
    const piece = [] as Piece
    const coordinate = new Coordinate([0, 0])
    lines.forEach(([direction, length]) => {
        piece.push(coordinate.position.slice() as Piece[0])
        coordinate.move(direction, length)
    })
    return piece
}

const parse1 = (input: string): Piece => tracePiece(
    input.split('\n').map(line => {
        const [direction, length] = line.split(' ')
        return [direction, parseInt(length)]
    })
)

const parse2 = (input: string): Piece => tracePiece(
    input.split('\n').map(line => {
        const [,,hex] = line.split(' ')
        const length = parseInt(hex.slice(2, -2), 16)
        const direction = { '0': 'R', '1': 'D', '2': 'L', '3': 'U' }[hex.slice(-2, -1)]!
        return [direction, length]
    })
)

// of all piece coordinates, returns the topmost, leftmost one
const findTopLeftCoordinate = (piece: Piece): Piece[0] => {
    let node = undefined as Piece[0]|undefined
    piece.forEach(corner => {
        if (
            node === undefined
            || (node[0] > corner[0])
            || (node[0] === corner[0] && node[1] > corner[1])
        ) {
            node = corner
        }
    })
    return node!
}

// given a list of coordinates, removes any 1 coordinate that shares an axis with previous/next coordinates
// i.e.. merges/removes unnecessary coordinates, e.g. x--x--x becomes x-----x 
const simplify = (piece: Piece): Piece => {
    if (piece.length <= 3) {
        return piece
    }
    let i = 0
    while (i < piece.length) {
        if (
            piece[i][0] === piece[(i + 1) % piece.length][0] && piece[(i + 1) % piece.length][0] === piece[(i + 2) % piece.length][0] ||
            piece[i][1] === piece[(i + 1) % piece.length][1] && piece[(i + 1) % piece.length][1] === piece[(i + 2) % piece.length][1]
        ) {
            piece.splice((i + 1) % piece.length, 1)
        }
        else {
            i += 1
        }
    }
    return piece
}

// cuts `piece` by using the specified slice of coordinates + the specified linking coordinate
const stitch = (piece: Piece, from: number, to: number, link: Piece[0]) => {
    if (from < 0) {
        from += piece.length
    }
    while (from > to) {
        to += piece.length
    }
    return piece.concat(piece)
        .slice(from, to)
        .concat([link])
}

const solve = (piece: Piece) => {
    // list of pieces to track area of
    let pieces: Piece[] = [piece]
    // helper function to add a piece to the list of tracked pieces
    const add = (piece: Piece) => {
        piece = simplify(piece)
        if (piece.length >= 4) {
            pieces.push(piece)
            return true
        }
        return false
    }

    let area = 0
    while (pieces.length > 0) {
        const piece = pieces.shift()!
        // looped access by index
        const at = (index: number) => piece.at(index % piece.length)!
        const topLeft = findTopLeftCoordinate(piece)!
        const index = piece.indexOf(topLeft)
        const bottomRight = at(index + 2)
        // simple rectangle, sum and keep going
        if (piece.length === 4) {
            area += (bottomRight[0] - topLeft[0] + 1) * (bottomRight[1] - topLeft[1] + 1)
            continue
        }
        
        const topRight = at(index + 1)
        // find next/nested topLeft
        const breaking = findTopLeftCoordinate(
            piece.filter(
                item => item[0] > topLeft[0]
                    && item[1] > topLeft[1]
                    && item[1] <= topRight[1]
            )
        )!

        let breakingIndex = piece.indexOf(breaking)
        if (breakingIndex < index) {
            breakingIndex += piece.length
        }

        const bottomLeft = at(index - 1)
        // simple rectangle sitting on top
        if (bottomLeft[0] < breaking[0]) {
            // that rectangle
            add([bottomLeft, topLeft, topRight, [bottomLeft[0], topRight[1]]])
            // the rest
            add(stitch(piece, index + 2, index - 1, [bottomLeft[0], topRight[1]]))
            // minus the intersection
            area -= topRight[1] - topLeft[1] + 1
        }
        // subrectangle that may cut the piece into 2
        else {
            // that rectangle
            add([[breaking[0], topLeft[1]], topLeft, [topRight[0], breaking[1]], breaking])
            // first piece
            if(add(stitch(piece, index + 1, breakingIndex + 1, [topRight[0], breaking[1]]))) {
                // minus the intersection, if a piece was cut
                area -= breaking[0] - topLeft[0] + 1
            }
            // second piece
            if (add(stitch(piece, breakingIndex, piece.length + index - 1 + 1, [breaking[0], topLeft[1]]))) {
                // minus the intersection, if a piece was cut
                area -= breaking[1] - topLeft[1] + 1
            }
        }
    }

    return area
}

export default {
    part1: compose(solve, parse1),
    part2: compose(solve, parse2),
}