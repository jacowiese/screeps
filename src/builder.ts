import { BaseCreep } from "basecreep";
import { Harvester } from "harvester";
import { random } from "lodash";

export class Builder extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "BUILDER", state: "MINING", room: spawn.room.name };

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
                console.log('Could not spawn builder: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {

        if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() != 0) {
                let cntnr = _.filter(creep.room.find(FIND_STRUCTURES), (k) => k.structureType == STRUCTURE_CONTAINER && k.store.getUsedCapacity(RESOURCE_ENERGY) > 0)[0];
                // if there are containers with energy, go get it from them!
                if (cntnr != null) {
                    if (creep.withdraw(cntnr, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(cntnr.pos.x, cntnr.pos.y);
                    }
                } else {

                    // go directly to the source node

                    let sourceNode = creep.pos.findClosestByPath(FIND_SOURCES) as Source;
                    if (creep.harvest(sourceNode) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sourceNode.pos.x, sourceNode.pos.y);
                    }

                    // if (creep.memory.target == null || creep.memory.target == "") {
                    //     let sources = creep.room.find(FIND_SOURCES_ACTIVE);
                    //     let source = sources[random(1, sources.length)];
                    //     let sourceId : string | undefined;
                    //     if (source != undefined) {
                    //         sourceId = source.id;
                    //     } else {
                    //         sourceId = creep.room.find(FIND_SOURCES_ACTIVE)[0].id;
                    //     }
                    //     creep.memory.target =  sourceId;
                    // }

                    // let sourceNode = Game.getObjectById(creep.memory.target) as Source;
                    // if (creep.harvest(sourceNode) == ERR_NOT_IN_RANGE) {
                    //     creep.moveTo(sourceNode.pos.x, sourceNode.pos.y);
                    // }
                }
            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                // let building = _.filter(creep.room.find(FIND_MY_CONSTRUCTION_SITES), (s) => s.progress < s.progressTotal)[0];
                let building = this.closestConstructionSite(creep);
                if (building != null) {
                    // If construction site is not finished, go and build it!
                    if (creep.build(building) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(building.pos.x, building.pos.y);
                    }
                } else {

                    // if there are no buildings to build, put energy into extensions
                    let ext = _.filter(creep.room.find(FIND_MY_STRUCTURES), (m) => m.structureType == STRUCTURE_EXTENSION && m.store.energy < 50)[0] as StructureExtension;
                    if (ext != null) {
                        // If there is room in an extension, fill it first!
                        if (creep.transfer(ext, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
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
