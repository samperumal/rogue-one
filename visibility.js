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

const lineOfSightTest = world => fromPoint => toPoint =>
{
    const line = [fromPoint,toPoint]
    return world
        .filter(isObstacle)
        .filter(v=>v!=fromPoint && v!=toPoint)
        .map(v => ({...v, radius: 0.5}))
        .filter(circleIntersectsLine(line))
        .length == 0;
}