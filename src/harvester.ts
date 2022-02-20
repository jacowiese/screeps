import { BaseCreep } from "basecreep";
import { random } from "lodash";

export class Harvester extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "HARVESTER", state: "MINING", room: spawn.room.name };

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
                console.log('Could not spawn harvester: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {
        super.update(creep);

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

                    let resourcePos = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                    if (resourcePos != null &&  resourcePos.amount > 100) {

                        if (creep.pickup(resourcePos) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(resourcePos.pos.x, resourcePos.pos.y);
                        }

                    } else {
                        let structures = _.filter(creep.room.find(FIND_STRUCTURES), (k) => k.structureType == STRUCTURE_CONTAINER && k.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
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
                                // creep.memory.flipflop = random(0, 1, false);

                                if (creep.memory.flipflop == undefined || creep.memory.flipflop == 0)
                                    creep.memory.flipflop = 1;
                                else
                                    creep.memory.flipflop = 0;
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

                // put the energy in an extension
                    let exts = creep.room.find(FIND_MY_STRUCTURES, { filter: (m) => {
                        return (m.structureType === STRUCTURE_EXTENSION && m.store.energy < 50);
                    }}) as Array<StructureExtension>;
                    //let ext: StructureExtension = this.closestStructure(creep, exts) as StructureExtension;

                    let ext: StructureExtension = exts[0];
                    if (ext != null) {
                        // If there is room in an extension, fill it first!
                        if (creep.transfer(ext, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(ext.pos.x, ext.pos.y);
                        }
                    } else {

                            // if all places are full, put the energy in the spawn
                        let spawn = creep.room.find(FIND_MY_SPAWNS)[0];
                        if (spawn == null) {
                            console.log("Harvester cannot find room spawn!");
                            return;
                        }

                        if (spawn.energy < spawn.energyCapacity) {
                            // Put energy into spawn for new creeps!

                            if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(spawn.pos.x, spawn.pos.y);
                            }

                        } else {

                            // if spawn is full, move to a random extension, in case it empties, but also make sure creep is full!
                            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                                creep.memory.state = "MINING";
                                creep.memory.target = "";
                            }
                            let exts = _.filter(creep.room.find(FIND_MY_STRUCTURES), (m) => m.structureType == STRUCTURE_EXTENSION) as Array<StructureExtension>;
                            let ext: StructureExtension = this.closestStructure(creep, exts) as StructureExtension;
                            if (ext != null) {
                                creep.moveTo(ext.pos.x, ext.pos.y);
                            }

                        }
                    }
            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }
}
