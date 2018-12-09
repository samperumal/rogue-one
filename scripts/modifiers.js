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
    apply: {
        turnStart: _=>addArmour(value)
    }
});

export const damage = value => ({
    name: `+${value} Damage`,
    apply: {
        turnStart: _=>addDamage(value)
       }
});

export const blind = ()=> ({
    name:"Blind",
    apply: {
        turnStart: _=>setVisualRange(0)
    }
});

export const cursed = (item)=> ({
    name:`Cursed (${item.name})`,
    apply: {
        unequip: event => {
            if (event.item===item)
            {
                info(`You try to pull the ${item.name} off, but it is stuck fast`);
                return veto;
            }
        }
    }
});

export const chanceToMiss = (percentage, weapon) => ({
    name: `${percentage}% chance to miss`,
    apply: {
        playerDamagesMonster: event =>  {
            if (event.weapon===weapon)
            {
                if (Math.random()*100 < percentage)
                {
                    console.log("missing");
                    info(`You miss!`);
                    return veto;
                }
            }
        }
    }
});