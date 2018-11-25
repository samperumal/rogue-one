import { Game } from "../src/game.ts";
import { parseMap } from "../src/map.ts";

const chamber = [
`
#####
#...#
#.@.#
#...#
#####`,
`{}`
];

describe("Test chamber 1 - Movement:",()=>{
    let game;
    beforeEach((done:DoneFn)=>
    {
        game=new Game();
        game.initialise(Promise.resolve(
            parseMap(chamber[0],chamber[1])))
        .then(done)
    });

    it("player starts at (2,3)",()=>
        {
            expect([game.gameState.player.x, game.gameState.player.y])
                .toEqual([2,3]);
        }
    )

    it('ArrowLeft will move player to (1,3)', ()=> {
        game.processInput("ArrowLeft");
        expect([game.gameState.player.x, game.gameState.player.y])
            .toEqual([1,3])
    })

    it('ArrowRight will move player to (3,3)', ()=> {
        game.processInput("ArrowRight");
        expect([game.gameState.player.x, game.gameState.player.y])
            .toEqual([3,3])
    })

    it('ArrowUp will move player to (2,2)', ()=> {
        game.processInput("ArrowUp");
        expect([game.gameState.player.x, game.gameState.player.y])
            .toEqual([2,2])

   })

    it('ArrowDown will move player to (2,4)', ()=> {
        game.processInput("ArrowDown");
        expect([game.gameState.player.x, game.gameState.player.y])
            .toEqual([2,4])
    })
});