

export class TowerManager {

    public constructor() {
    }

    public update(roomName: string): void {

        let room = Game.rooms[roomName];
        if (room === undefined || room === null) {
            console.log("ERROR: Tower could not find room (" + roomName + ")");
            return;
        }

        let towers = room.find(FIND_MY_STRUCTURES, { filter: (structure: StructureTower) => {
            return (structure.structureType === STRUCTURE_TOWER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
        }}) as Array<StructureTower>;

        if (towers === undefined || towers === null) {
            console.log("ERROR: TowerManager did not find any towers in room " + roomName);
            return;
        }

        // defend!
        let hostiles = room.find(FIND_HOSTILE_CREEPS) as Array<Creep>;
        hostiles.sort((a: Creep, b: Creep) => a.hits - b.hits);
        if (hostiles.length > 0) {

            console.log("Tower attacking a creep!");
            towers.forEach((t) => t.attack(hostiles[0]));

        } else {

            // repair
            let structures: Array<Structure> = room.find(FIND_STRUCTURES, { filter: (structure: Structure) => {
                return (structure.hits < structure.hitsMax);
            }}) as Array<Structure>;

            structures.sort((s1: Structure, s2: Structure) => s1.hits - s2.hits);

            let repaired: boolean = false;

            if (structures.length > 0 && repaired == false) {
                structures.forEach((s) => {
                    if (s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_ROAD) {
                        towers.forEach((tower) => {
                            if (tower.repair(s) == OK) {
                                // console.log("Tower repairing structure with " + s.hits + " hits.");
                                repaired = true;
                            }
                        })
                    }
                })
            }

            // Ramparts and Walls &&&&&& anything else!
            if (structures.length > 0 && repaired == false) {
                towers.forEach((tower) => {

                    let storage: StructureStorage = tower.room.find(FIND_MY_STRUCTURES, { filter: (k) => {
                        return (k.structureType === STRUCTURE_STORAGE);
                    }})[0] as StructureStorage;

                    if (storage != undefined || storage != null) {
                        // Only fix other stuff if storage capacity is > 50k
                        if (storage.store.getUsedCapacity(RESOURCE_ENERGY) > 50000) {
                            if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > tower.store.getCapacity(RESOURCE_ENERGY) / 2) {
                                if (tower.repair(structures[0]) == OK) {
                                    // console.log("Tower repairing structure with " + structures[0].hits + " hits.");
                                    repaired = true;
                                }
                            }
                        }
                    } else {

                        // If storage doesn't exist... then just use the tower
                        if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > tower.store.getCapacity(RESOURCE_ENERGY) / 2) {
                            if (tower.repair(structures[0]) == OK) {
                                // console.log("Tower repairing structure with " + structures[0].hits + " hits.");
                                repaired = true;
                            }
                        }
                    }
                })
            }
        }
    }

}
