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

        if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() > 0) {

                if (!this.getResourceFromFloor(creep)) {
                    if (!this.getResourceFromStorage(creep)) {
                        this.getResourceFromContainer(creep);
                    }
                }

            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                let turrets: Array<StructureTower> = creep.room.find(FIND_MY_STRUCTURES) as Array<StructureTower>;
                turrets.forEach((turret) => {

                    if (turret.structureType === STRUCTURE_TOWER) {
                        if (turret.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {

                            if (creep.transfer(turret, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(turret.pos.x, turret.pos.y);
                            }
                        }
                    }

                });

            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }
}
