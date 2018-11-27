import { info, addArmour, addDamage, setVisualRange } from "./game.js";
import {veto} from "./events.js";

export const modifierFactory = (type, config, parent) => {
    switch (type) {
        case "armour": return armour(config);
        case "damage": return damage(config);
        case "blind": return blind();
        case "cursed": return cursed(parent);
        case "chanceToMiss": return chanceToMiss(config,parent);
        default: throw new Error("Unknown modifier "+type);
    }
}

export const armour = value => ({
    name: `+${value} Armour`,
    apply: event=> {
        switch (event.type) {
        case "turnStart": addArmour(value);
        default: return;
        }
    }
});

export const damage = value => ({
    name: `+${value} Damage`,
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

export const cursed = (item)=> ({
    name:`Cursed (${item.name})`,
    apply: event => {
        switch (event.type) {
        case "unequip": 
            if (event.item===item)
            {
                info(`You try to pull the ${item.name} off, but it is stuck fast`);
                return veto;
            }
        break;
        default: return;
    }}
});

export const chanceToMiss = (percentage, weapon) => ({
    name: `${percentage}% chance to miss`,
    apply: event => {
        switch (event.type) {
        case "playerDamagesMonster": 
            if (event.weapon===weapon)
            {
                if (Math.random()*100 < percentage)
                {
                    console.log("missing");
                    info(`You miss!`);
                    return veto;
                }
            }
        break;
        default: return;
    }}
});