import { BaseCreep } from "basecreep";
import { spawn } from "child_process";
import { random } from "lodash";
import { QuarterMaster } from "quartermaster";

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

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_harvester", { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn harvester: not enough energy!');
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

                if (!this.getResourceFromFloor(creep, RESOURCE_ENERGY)) {
                    if (!this.getResourceFromContainer(creep, RESOURCE_ENERGY)) {
                        // Move to the source with the lowest respawn timer
                        let lowestSources: Array<Source> = creep.room.find(FIND_SOURCES_ACTIVE) as Array<Source>;
                        if (lowestSources.length > 1) {
                            lowestSources.sort((a: Source, b: Source) => { return a.ticksToRegeneration - b.ticksToRegeneration });
                        }
                    }
                }
            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                // put the energy in an extension
                let ext: StructureExtension | null = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (m: StructureExtension) => {
                    return (m.structureType === STRUCTURE_EXTENSION && m.store.energy < 50);
                }});

                if (ext != null) {
                    // If there is room in an extension, fill it first!
                    if (creep.transfer(ext, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(ext.pos.x, ext.pos.y,{
                            reusePath: 3
                        });
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
                            creep.moveTo(spawn.pos.x, spawn.pos.y, { reusePath: 3 });
                        }

                    } else {

                        // if spawn is full, move to a random extension, in case it empties, but also make sure creep is full!
                        // if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        //     creep.memory.state = "MINING";
                        //     creep.memory.target = "";
                        // }
                        // let exts = _.filter(creep.room.find(FIND_MY_STRUCTURES), (m) => m.structureType == STRUCTURE_EXTENSION) as Array<StructureExtension>;
                        // let ext: StructureExtension = this.closestStructure(creep, exts) as StructureExtension;
                        // if (ext != null) {
                        //     creep.moveTo(ext.pos.x, ext.pos.y);
                        // }

                        // Fill storage!
                        let qmaster: QuarterMaster = new QuarterMaster();
                        qmaster.update(creep);

                    }
                }
            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }
}
