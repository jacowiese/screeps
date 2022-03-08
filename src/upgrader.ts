import { BaseCreep } from "basecreep";
import { random } from "lodash";

export class Upgrader extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "UPGRADER", state: "MINING", room: spawn.room.name };

        let body: Array<BodyPartConstant> = new Array<BodyPartConstant>();

        let numParts = Math.floor(spawn.room.energyAvailable / 250);
        if (numParts == 0) {
            return;
        }

        for (let i: number = 0; i < numParts; i++) {
            body.push(MOVE);
            body.push(MOVE);
            body.push(WORK);
            body.push(CARRY);
        }

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_upgrader", { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn upgrader: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {

        if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() != 0) {

                let link = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (k) => {
                    return (k.structureType === STRUCTURE_LINK && k.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
                }});
                if (link != undefined || link != null) {

                    if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(link.pos.x, link.pos.y);
                    }

                } else {
                    let storage:Array<StructureStorage> = creep.room.find(FIND_MY_STRUCTURES, { filter: (k: StructureStorage) => {
                        return (k.structureType === STRUCTURE_STORAGE && k.store.getUsedCapacity(RESOURCE_ENERGY) > 100);
                    }}) as Array<StructureStorage>;
                    if (storage.length > 0) {

                        if (creep.withdraw(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage[0].pos.x, storage[0].pos.y);
                        }

                    } else {
                        let container: StructureContainer | null = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (k: StructureContainer) => {
                            return (k.structureType === STRUCTURE_CONTAINER && k.store.getUsedCapacity(RESOURCE_ENERGY) > 100);
                        }});

                        // if there are containers with energy, go get it from them!
                        if (container != null) {
                            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(container.pos.x, container.pos.y);
                            }
                        } else {

                            let resourcePos = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                            if (resourcePos != null && resourcePos.amount > 100) {

                                if (creep.pickup(resourcePos) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(resourcePos.pos.x, resourcePos.pos.y);
                                }

                            }
                        }
                    }
                }
            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                // upgrade controller
                let controller = _.filter(creep.room.find(FIND_MY_STRUCTURES), (m) => m.structureType == STRUCTURE_CONTROLLER)[0] as StructureController;
                if (controller == null) {
                    console.log("Harvester cannot find room controller!");
                    return;
                }

                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller.pos.x, controller.pos.y);
                }
            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }
}
