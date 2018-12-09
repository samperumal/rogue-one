import { gameState, initialise, processInput } from "../scripts/game.js";
import { parseMap } from "../scripts/map.js";

const chamber = [
`
#####
#...#
#.@.
#...#
#####`,
`{}`
];

describe("Test chamber 1 - Movement:",()=>{
    beforeEach(done=>
    {
        initialise(Promise.resolve(
            parseMap(chamber[0],chamber[1])))
        .then(done)
    });

    it("player starts at (2,3)",()=>
        {
            expect([gameState.player.x, gameState.player.y])
                .toEqual([2,3]);
        }
    )

    it('ArrowLeft will move player to (1,3)', ()=> {
        processInput("ArrowLeft");
        expect([gameState.player.x, gameState.player.y])
            .toEqual([1,3])
    })

    it('ArrowRight will move player to (3,3)', ()=> {
        processInput("ArrowRight");
        expect([gameState.player.x, gameState.player.y])
            .toEqual([3,3])
    })

    it('ArrowUp will move player to (2,2)', ()=> {
        processInput("ArrowUp");
        expect([gameState.player.x, gameState.player.y])
            .toEqual([2,2])

   })

    it('ArrowDown will move player to (2,4)', ()=> {
        processInput("ArrowDown");
        expect([gameState.player.x, gameState.player.y])
            .toEqual([2,4])
    })

    it('Cannot move into a wall', ()=> {
        processInput("ArrowDown");
        processInput("ArrowDown");
        expect([gameState.player.x, gameState.player.y])
            .toEqual([2,4])
    })

    it('Cannot move onto an empty tile', ()=> {
        processInput("ArrowRight");
        processInput("ArrowRight");
        expect([gameState.player.x, gameState.player.y])
            .toEqual([3,3])
    })
});