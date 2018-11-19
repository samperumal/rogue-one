const dot = ([x1,y1],[x2,y2]) => x1*x2+y1*y2

const intersects = ({x:x1,y:y1}, {x:x2,y:y2}) => ({x,y,radius})  =>
{
    const ac = [x - x1, y - y1]
    const ab = [x2 - x1, y2 - y1]
    const ab2 = dot(ab, ab)
    const acab = dot(ac, ab)
    var t = acab / ab2
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t
    var h = [(ab[0] * t + x1) - x, (ab[1] * t + y1) - y]
    var h2 = dot(h, h)
    return h2 <= radius * radius 
}

const isObsticle = point =>  point.tt=="wall";

const lineOfSightTest = world => pointA => pointB =>
    world
        .filter(isObsticle)
        .filter(v=>v!=pointA && v!=pointB)
        .map(v => ({...v, radius: 0.5}))
        .filter(intersects(pointA,pointB))
        .length == 0;


