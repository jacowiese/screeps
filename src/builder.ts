import { BaseCreep } from "basecreep";
import { Harvester } from "harvester";
import { random } from "lodash";
import { Repairer } from "repairer";

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

        if (numParts > 2) {
            numParts = 2;
        }

        for (let i: number = 0; i < numParts; i++) {
            body.push(MOVE);
            body.push(MOVE);
            body.push(WORK);
            body.push(CARRY);
        }

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_builder", { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn builder: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {

        let flag: Flag = Game.flags['build'];
        for (const fname in Game.flags) {
            if (fname === 'build') {
                flag = Game.flags[fname];
                break;
            }
        }
        // If there is a build flag, go there and build!
        if (flag != undefined) {

            if (creep.pos.roomName !== flag.pos.roomName) {

                console.log("Builder moving to room: " + flag.pos.roomName);
                creep.moveTo(flag, { reusePath: 3 });
                return;
            }
        }

        if ((creep.ticksToLive || 1500) < 150 && creep.body.length > 10) {
            console.log(creep.name + " going to recharge.");
            creep.memory.state = "RECHARGE";
        }

        if (creep.memory.state == "RECHARGE") {

            this.doRefreshCreep(creep);

        } else if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() != 0) {

                // if (!this.getResourceFromLink(creep)) {
                    if (!this.getResourceFromStorage(creep, RESOURCE_ENERGY)) {
                        if (!this.getResourceFromFloor(creep, RESOURCE_ENERGY)) {
                            if (!this.getResourceFromContainer(creep, RESOURCE_ENERGY)) {
                                // go directly to the source node
                                let sourceNode = creep.pos.findClosestByPath(FIND_SOURCES) as Source;
                                if (creep.harvest(sourceNode) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(sourceNode.pos.x, sourceNode.pos.y, { reusePath: 3 });
                                }
                            }
                        }
                    }
            //    }
            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                let building: ConstructionSite | null = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, { filter: (k: ConstructionSite) => {
                    return (k.progress < k.progressTotal);
                }});

                if (building != null) {
                    // If construction site is not finished, go and build it!
                    if (creep.build(building) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(building.pos.x, building.pos.y, { reusePath: 1 });
                    }
                } else {

                    // if there are no buildings to build, do the harvester role!
                    // let harvester:Harvester = new Harvester();
                    // harvester.update(creep);

                    let repairer:Repairer = new Repairer();
                    repairer.update(creep);

                }
            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }
}
