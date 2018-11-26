// Events describe the various things that happen during the turn 
// These provide an entry point for equipment, status effetcs etc.
// to apply their changes to the game logic

export const turnStart = () => ({
        type: "turnStart"
    });

export const playerDamagesMonster = (monster, damage) => ({
    type:"playerDamagesMonster",
    monster: monster,
    damage: damage
});

export const turnEnd = () => ({
    type:"turnEnd"
});

export const playerHealed = value => ({
    type:"playerHealed",
    valeu: value
});