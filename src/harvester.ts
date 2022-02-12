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
            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                // put the energy in an extension
                if (creep.memory.flipflop == undefined || creep.memory.flipflop == 0) {
                    let ext = _.filter(creep.room.find(FIND_MY_STRUCTURES), (m) => m.structureType == STRUCTURE_EXTENSION && m.store.energy < 50)[0] as StructureExtension;
                    if (ext != null) {
                        // If there is room in an extension, fill it first!
                        if (creep.transfer(ext, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(ext.pos.x, ext.pos.y);
                        }
                    }
                }

                if (creep.memory.flipflop == 1) {

                    // put energy into container if there are any
                    let cntnr = _.filter(creep.room.find(FIND_STRUCTURES), (k) => k.structureType == STRUCTURE_CONTAINER && k.store.getFreeCapacity(RESOURCE_ENERGY) > 0)[0];
                    if (cntnr != null) {
                        if (creep.transfer(cntnr, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(cntnr.pos.x, cntnr.pos.y);
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

                        } // else {

                        //     // upgrade controller
                        //     let controller = _.filter(creep.room.find(FIND_MY_STRUCTURES), (m) => m.structureType == STRUCTURE_CONTROLLER)[0] as StructureController;
                        //     if (controller == null) {
                        //         console.log("Harvester cannot find room controller!");
                        //         return;
                        //     }

                        //     if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                        //         creep.moveTo(controller.pos.x, controller.pos.y);
                        //     }
                        // }
                    }
                }
            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }
}
