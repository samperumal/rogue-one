export { initialise };
import * as T from "./consts.js";

function initialise(actions) {
    actions["equip"] = [equipWeapon, equipArmour];
}

function equipWeapon(source, target, start, end) {
    console.log(source, target);
    if (source.inventory == null || target.tags == null)
        console.log("Field error");
    else if (!source.inventory.includes(target))
        console.log("Can't find item to equip");
    else if (target.tags.includes(T.equipped))
        console.log("Item is already equipped");
    else if (!target.tags.includes(T.weapon))
        ;// Not a weapon
    else {
        // Unequip other weapons
        const equippedItems = source.inventory.filter(item => item.tags.includes(T.weapon) && item.tags.includes(T.equipped));
        for (const item of equippedItems)
            item.tags.splice(item.tags.indexof(T.equipped), 1);

        // Equip target
        target.tags.push(T.equipped);

        return true;
    }

    return false;
}

function equipArmour(source, target, start, end) {

}
