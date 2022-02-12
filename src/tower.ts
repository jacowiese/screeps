

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

            // repair
            let structures = room.find(FIND_STRUCTURES) as Array<Structure>;
            structures.forEach((t) => {
                if (t.structureType !== STRUCTURE_WALL && t.structureType !== STRUCTURE_RAMPART && t.structureType !== STRUCTURE_ROAD) {
                    if (t.hits < t.hitsMax) {

                        console.log("Tower repairing a structure");

                        towers.forEach((tower) => tower.repair(t));

                    }
                }
            });
        }
    }
}
