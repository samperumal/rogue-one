const dotProduct = ([x1,y1],[x2,y2]) => x1*x2+y1*y2

const circleIntersectsLine = line => circle =>
{
    const [{x:x1,y:y1}, {x:x2,y:y2}] = line
    const {x,y,radius} = circle

    const ac = [x - x1, y - y1]
    const ab = [x2 - x1, y2 - y1]
    const ab2 = dotProduct(ab, ab)
    const acab = dotProduct(ac, ab)
    var t = acab / ab2
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t
    var h = [(ab[0] * t + x1) - x, (ab[1] * t + y1) - y]
    var h2 = dotProduct(h, h)
    return h2 <= radius * radius 
}

const isObstacle = point =>  point.tt=="wall";

const isBig = isObstacle

// Small objects: test visibility of center point 
// Large objects: test visibility of closest corner 
const adjustForSize = line => {
    if (!isBig(line[1])) return line;
    const vector = {
                        x: line[1].x-line[0].x, 
                        y: line[1].y-line[0].y
                   }
    return [line[0], { 
                        x: line[1].x - Math.sign(vector.x), 
                        y: line[1].y - Math.sign(vector.y)
            }]
}

const lineOfSightTest = world => fromPoint => toPoint =>
{
    const line = adjustForSize([fromPoint,toPoint])
    return world
        .filter(isObstacle)
        .filter(v=>v!=fromPoint && v!=toPoint)
        .map(v => ({...v, radius: 0.5}))
        .filter(circleIntersectsLine(line))
        .length == 0;
}