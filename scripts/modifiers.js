import { addArmour, addDamage, setVisualRange } from "./game.js";

export const armour = value => ({
    name: "+Armour",
    apply: event=> {
        switch (event.type) {
        case "turnStart": addArmour(value);
        default: return;
        }
    }
});

export const damage = value => ({
    name: "+ Damage",
    apply: event => {
        switch (event.type) {
        case "turnStart": addDamage(value);
        default: return;
        }
    }
});

export const blind = ()=> ({
    name:"Blind",
    apply: event => {
        switch (event.type) {
        case "turnStart": 
            setVisualRange(0);
        break;
        default: return;
    }}
});