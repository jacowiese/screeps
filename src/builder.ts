import { Repairer } from "repairer";
import { random } from "lodash";

export class Builder {

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
                    // if there are no buildings to build, then go fix something!
                    let rep = new Repairer();
                    rep.update(creep);
                }
            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }

    private closestConstructionSite(creep: Creep): ConstructionSite | null {
        let building : ConstructionSite | null = null;
        let distance : number = Number.MAX_VALUE;
        let incompleteBuildings = _.filter(creep.room.find(FIND_MY_CONSTRUCTION_SITES), (s) => s.progress < s.progressTotal);
        if (incompleteBuildings != null) {

            for (let b = 0; b < incompleteBuildings.length; b++) {
                let d = this.dist(creep.pos, incompleteBuildings[b].pos);
                if (d < distance) {
                    distance = d;
                    building = incompleteBuildings[b];
                }
            }
        }

        // console.log("Min distance: " + distance);

        return building;
    }

    private dist(a: RoomPosition, b: RoomPosition): number {
        let sqrDist = Math.abs(a.x * a.x - b.x * b.x + a.y * a.y - b.y * b.y);
        return Math.sqrt(sqrDist);
    }
}
