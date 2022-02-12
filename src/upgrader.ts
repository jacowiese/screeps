import { random } from "lodash";

export class Upgrader {

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
