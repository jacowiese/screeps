import { random } from "lodash";

export class WallRepairer {

    public constructor() {
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

                    // do nothing - only get energy from a container

                    // go directly to the source node
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

                // if there are no buildings to build, then go fix something!
                // let brokenbuilding = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.hits < s.hitsMax)[0];
                let brokenbuilding = this.structureWithLeastHitPoints(creep);
                if (brokenbuilding != null) {
                    if (creep.repair(brokenbuilding) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(brokenbuilding.pos.x, brokenbuilding.pos.y);
                    }
                }
            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }

    private structureWithLeastHitPoints(creep: Creep): Structure | null {
        let building : Structure | null = null;
        let hp : number = Number.MAX_VALUE;
        let damagedBuildings = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.hits < s.hitsMax && s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART || s.structureType === STRUCTURE_ROAD);

        if (damagedBuildings != null) {

            for (let b = 0; b < damagedBuildings.length; b++) {
                if (damagedBuildings[b].hits < hp) {
                    hp = damagedBuildings[b].hits;
                    building = damagedBuildings[b];
                }
            }
        }

        return building;
    }
}
