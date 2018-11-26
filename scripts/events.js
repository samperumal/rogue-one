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