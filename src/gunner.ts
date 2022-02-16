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

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName, { memory: creepMemory });

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

                let storage:Array<StructureStorage> = creep.room.find(FIND_MY_STRUCTURES, { filter: (k: StructureStorage) => {
                    return (k.structureType === STRUCTURE_STORAGE && k.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
                }}) as Array<StructureStorage>;
                if (storage.length > 0) {

                    if (creep.withdraw(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage[0].pos.x, storage[0].pos.y);
                    }

                } else {

                    let resourcePos = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                    if (resourcePos != null &&  resourcePos.amount > 100) {

                        if (creep.pickup(resourcePos) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(resourcePos.pos.x, resourcePos.pos.y);
                        }

                    } else {
                        let structures = creep.room.find(FIND_STRUCTURES, { filter: (k: StructureContainer) => {
                            return (k.structureType === STRUCTURE_CONTAINER && k.store.getUsedCapacity(RESOURCE_ENERGY) > 100);
                        }});

                        let cntnr = this.closestStructure(creep, structures) as StructureContainer;

                        // if there are containers with energy, go get it from them!
                        if (cntnr != null) {
                            if (creep.withdraw(cntnr, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(cntnr.pos.x, cntnr.pos.y);
                            }
                        } else {
                            if (creep.memory.target == null || creep.memory.target == "") {
                                let sources = creep.room.find(FIND_SOURCES_ACTIVE);
                                let source = sources[random(1, sources.length)];
                                let sourceId : string | undefined;
                                if (source != undefined) {
                                    sourceId = source.id;
                                } else {
                                    sourceId = creep.room.find(FIND_SOURCES_ACTIVE)[0].id;
                                }
                                creep.memory.target =  sourceId;
                            }

                            let sourceNode = Game.getObjectById(creep.memory.target) as Source;
                            if (creep.harvest(sourceNode) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(sourceNode.pos.x, sourceNode.pos.y);
                            }
                        }
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
