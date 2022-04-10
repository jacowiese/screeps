import { BaseCreep } from "basecreep";
import { random } from "lodash";

export class QuarterMaster extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "QUARTERMASTER", state: "MINING", room: spawn.room.name };

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

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_quarterMaster", { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn quartermaster: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {
        super.update(creep);

        if ((creep.ticksToLive || 1500) < 150 && creep.body.length > 10) {
            console.log(creep.name + " going to recharge.");
            creep.memory.state = "RECHARGE";
        }

        if (creep.memory.state == "RECHARGE") {

            this.doRefreshCreep(creep);

        } else if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() != 0) {

                // if (!this.getResourceFromLink(creep)) {
                    if (!this.getResourceFromFloor(creep, RESOURCE_ENERGY)) {
                        this.getResourceFromContainer(creep, RESOURCE_ENERGY);
                    }
                // }

            } else {
                creep.memory.state = "WORKING";
            }

        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                let storages = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => {
                    return (structure.structureType === STRUCTURE_STORAGE && structure.store.getFreeCapacity() != 0);
                    }
                }) as Array<StructureStorage>;

                storages.forEach((storage) => {

                    if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage.pos.x, storage.pos.y, { reusePath: 3 });
                    }
                });

            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }
}
