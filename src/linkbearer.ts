import { BaseCreep } from "basecreep";
import { random } from "lodash";

export class LinkBearer extends BaseCreep {

    private linkNodes: Array<LinkNode>;

    public constructor(linkNodes: Array<LinkNode>) {
        super();
        this.linkNodes = linkNodes;
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

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_linkBearer", { memory: creepMemory });

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

                let resource: Resource | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: (k: Resource) => {
                    return (k.resourceType === RESOURCE_ENERGY && k.amount > 100);
                }});
                if (resource != null) {

                    if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(resource.pos.x, resource.pos.y);
                    }

                } else {

                    let cntnr = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (k: StructureContainer) => {
                        return (k.structureType === STRUCTURE_CONTAINER && k.store.getUsedCapacity(RESOURCE_ENERGY) > 100);
                    }});

                    // if there are containers with energy, go get it from them!
                    if (cntnr != null) {
                        if (creep.withdraw(cntnr, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(cntnr.pos.x, cntnr.pos.y);
                        }
                    }
                }

            } else {
                creep.memory.state = "WORKING";
                creep.say("Working!");
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {


                this.linkNodes.forEach((node: LinkNode) => {

                    let targetNode: StructureLink = Game.getObjectById<StructureLink>(node.target) as StructureLink;
                    if (creep.room.name == targetNode.room.name) {

                        // Only in the same room as the creep

                        let closestNode: StructureLink | null = null;
                        let range: number = Number.MAX_VALUE;
                        node.source.forEach((id: string) => {

                            let tempSrcNode: StructureLink = Game.getObjectById<StructureLink>(id) as StructureLink;
                            let r: number = creep.pos.getRangeTo(tempSrcNode.pos);
                            if (r < range) {
                                closestNode = tempSrcNode;
                                range = r;
                            }
                        });

                        if (closestNode != null) {
                            console.log("Linkbearer going to: " + closestNode);
                            if (creep.transfer(closestNode, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(closestNode);
                            }
                        }

                    }
                });

            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
                creep.say("Mining!");
            }
        }
    }
}
