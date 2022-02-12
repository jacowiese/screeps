

export class TowerManager {

    public constructor() {
    }

    public update(roomName: string): void {

        let room = Game.rooms[roomName];
        if (room === undefined || room === null) {
            console.log("ERROR: Tower could not find room (" + roomName + ")");
            return;
        }

        let towers = room.find(FIND_MY_STRUCTURES, { filter: {structureType: STRUCTURE_TOWER }}) as Array<StructureTower>;
        if (towers === undefined || towers === null) {
            console.log("ERROR: TowerManager did not find any towers in room " + roomName);
            return;
        }

        // defend!
        let hostiles = room.find(FIND_HOSTILE_CREEPS) as Array<Creep>;
        if (hostiles.length > 0) {

            console.log("Tower attacking a creep!");
            towers.forEach((t) => t.attack(hostiles[0]));

        } else {

            let whatToRepair: number = 0;

            // repair
            let structures = room.find(FIND_STRUCTURES) as Array<Structure>;
            structures.forEach((t) => {
                if (t.structureType !== STRUCTURE_WALL && t.structureType !== STRUCTURE_RAMPART && t.structureType !== STRUCTURE_ROAD) {
                    if (t.hits < t.hitsMax) {
                        towers.forEach((tower) => tower.repair(t));
                        whatToRepair = 1;
                    }
                }
            });

            if (whatToRepair == 0) {
                structures.forEach((t) => {
                    if (t.structureType !== STRUCTURE_WALL && t.structureType !== STRUCTURE_RAMPART) {
                        if (t.hits < t.hitsMax) {
                            towers.forEach((tower) => {
                                if (tower.store.energy > tower.store.getCapacity(RESOURCE_ENERGY) / 2)
                                    tower.repair(t)
                            });
                            whatToRepair = 1;
                        }
                    }
                });
            }

            if (whatToRepair == 0) {
                structures.forEach((t) => {
                    if (t.hits < t.hitsMax) {
                        towers.forEach((tower) => {
                            if (tower.store.energy > tower.store.getCapacity(RESOURCE_ENERGY) / 2)
                                tower.repair(t)
                        });
                        whatToRepair = 1;
                    }
                });
            }
        }
    }
}
