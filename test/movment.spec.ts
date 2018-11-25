import { gameState, initialise, processInput } from "../src/game";
import { parseMap } from "../src/map.ts";

const chamber = parseMap(
`
#####
#...#
#.@.#
#...#
#####`,
`{}`
);

describe("Test chamber 1 - Movement:",()=>{
    beforeEach((done:DoneFn)=>
    {
        initialise(Promise.resolve(chamber))
        .then(done)
    });
    it("player starts at (2,3)",()=>
        expect([gameState.player.x, gameState.player.y])
            .toEqual([2,3])
    )
});