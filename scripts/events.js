// Events describe the various things that happen during the turn 
// These provide an entry point for equipment, status effetcs etc.
// to apply their changes to the game logic

// returning veto from any event handler will prevent the event from happening
export const veto = new Object();

export const turnStart = () => ({
        type: "turnStart"
    });

export const playerDamagesMonster = (monster, damage, weapon) => ({
    type:"playerDamagesMonster",
    monster: monster,
    damage: damage,
    weapon: weapon
});

export const turnEnd = () => ({
    type:"turnEnd"
});

export const playerHealed = value => ({
    type:"playerHealed",
    value: value
});

export const unequip = item => ({
    type:"unequip",
    item: item
});