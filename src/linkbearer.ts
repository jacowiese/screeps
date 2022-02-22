import { BaseCreep } from "basecreep";
import { random } from "lodash";

export class LinkBearer extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "LINKBEARER", state: "MINING", room: spawn.room.name };

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
                console.log('Could not spawn linkbearer: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {
        super.update(creep);

        if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() != 0) {

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
                    }
                }

            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                let link = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (k) => {
                    return (k.structureType === STRUCTURE_LINK && k.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }});

                if (link != undefined || link != null) {

                    if (creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(link.pos.x, link.pos.y);
                    }
                }

            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }
}