import { gameState, initialise, processInput, inventory } from "../scripts/game.js";
import { parseMap } from "../scripts/map.js";

const chamber = [
`
.õ.
.@.
./.`
,
{

    "õ": [
        { "x": 1, "y":1, "colour": "green", "quaffable": true }
    ],
    "/": [
        { "x": 1, "y": 3, "name": "spiked club" },
    ]
}
];

describe("Test chamber 3 - Potions:",()=>{
    beforeEach(done=>
    {
        initialise(Promise.resolve(
            parseMap(chamber[0],chamber[1])))
        .then(done)
    });

    it("walking over a potion will pick it up", ()=>{
        processInput("ArrowUp");
        expect(inventory().map(v=>v.tt()))
            .toEqual(["green potion"])
    });

    it("")

    describe("Quaffing a potion", ()=>{
        beforeEach(()=>{
            processInput("ArrowUp");
            processInput("KeyQ");
            processInput("Digit1");
        })

        it("removes the potion from your inventory", ()=>{
            expect(inventory()).toEqual([]);
        })
    });

    describe("Quaffing a non-quaffable item", ()=>{
        beforeEach(()=>{
            processInput("ArrowDown");
            processInput("KeyQ");
            processInput("Digit1");
        })
        it("Has no effect",()=>{
            expect(inventory().length).toEqual(1);
        });
    })
});