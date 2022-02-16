

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

            // // Only structures
            // structures.forEach((t) => {
            //     if (t.structureType !== STRUCTURE_WALL && t.structureType !== STRUCTURE_RAMPART && t.structureType !== STRUCTURE_ROAD) {
            //         towers.forEach((tower) => tower.repair(t));
            //     }
            // });

            // // Roads
            // structures.forEach((t) => {
            //     if (t.structureType !== STRUCTURE_WALL && t.structureType !== STRUCTURE_RAMPART) {
            //         towers.forEach((tower) => {
            //             if (tower.store.energy > tower.store.getCapacity(RESOURCE_ENERGY) / 2) {
            //                 tower.repair(t)
            //             }
            //         });
            //     }
            // });

            // Ramparts and Walls &&&&&& anything else!
            if (structures.length > 0) {
                towers.forEach((tower) => {
                    if (tower.repair(structures[0]) == OK) {
                        console.log("Tower repairing structure with " + structures[0].hits + " hits.");
                    }
                })
            }
        }
    }

}
