
export class Explorer {

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

                    // go directly to the source node
                    let sourceNode = creep.room.find(FIND_SOURCES_ACTIVE)[0];
                    if (sourceNode == null)
                        return;

                    if (creep.harvest(sourceNode) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sourceNode.pos.x, sourceNode.pos.y);
                    }
                }

            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                // let toExit = creep.room.findExitTo(creep.room.name);
                // creep.move(toExit);

                console.log("I'm the explorer in room: " + creep.room.name);

                let exit = creep.room.find(FIND_EXIT)[0];
                console.log(exit);

                if (creep.room.controller != null) {
                    if (creep.room.controller.owner == undefined) {
                        console.log("Claiming controller!");

                        if (creep.claimController(creep.room.controller) != ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller.pos.x, creep.room.controller.pos.y);
                        }
                    }
                } else {

                    // Move on to the next room
                    creep.moveTo(exit.x, exit.y);
                }

            } else {
                creep.memory.state = "MINING";
            }
        }
    }
}
