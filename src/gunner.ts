import { BaseCreep } from "basecreep";
import { random } from "lodash";

export class Gunner extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "GUNNER", state: "MINING", room: spawn.room.name };

        let body: Array<BodyPartConstant> = new Array<BodyPartConstant>();

        let numParts = Math.floor(spawn.room.energyAvailable / 150);
        if (numParts == 0) {
            return;
        }

        if (numParts > 2) {
            numParts = 2;
        }

        for (let i: number = 0; i < numParts; i++) {
            body.push(MOVE);
            body.push(CARRY);
            body.push(CARRY);
        }

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_gunner", { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn gunner: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {
        super.update(creep);

        console.log(creep.body.length);

        if ((creep.ticksToLive || 1500) < 150 && creep.body.length > 10) {
            console.log(creep.name + " going to recharge.");
            creep.memory.state = "RECHARGE";
        }


        if (creep.memory.state == "RECHARGE") {

            this.doRefreshCreep(creep);

        } else if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() > 0) {

                if (!this.getResourceFromStorage(creep, RESOURCE_ENERGY)) {
                    if (!this.getResourceFromLink(creep)) {
                        if (!this.getResourceFromFloor(creep, RESOURCE_ENERGY)) {
                            this.getResourceFromContainer(creep, RESOURCE_ENERGY);
                        }
                    }
                }

            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                let turrets: Array<StructureTower> = creep.room.find(FIND_MY_STRUCTURES, {filter: (k) => {
                    return (k.structureType === STRUCTURE_TOWER);
                }}) as Array<StructureTower>;

                // turrets.forEach((turret) => {

                if (turrets.length > 0) {

                    turrets.sort((a: StructureTower, b: StructureTower) => (a.store.getUsedCapacity(RESOURCE_ENERGY) - b.store.getUsedCapacity(RESOURCE_ENERGY)));

                    if (turrets[0].structureType === STRUCTURE_TOWER) {
                        if (turrets[0].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {

                            if (creep.transfer(turrets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(turrets[0].pos.x, turrets[0].pos.y, { reusePath: 1 });
                            }
                        }
                    }
                }
                // });

            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }
}
