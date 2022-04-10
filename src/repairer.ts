import { BaseCreep } from "basecreep";
import { random } from "lodash";
import { WallRepairer } from "wallrepairer";

export class Repairer extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "REPAIRER", state: "MINING", room: spawn.room.name };

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

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_repairer", { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn repairer: not enough energy!');
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
                        this.getResourceFromStorage(creep, RESOURCE_ENERGY);
                    }
                }

            } else {
                creep.memory.state = "WORKING";
                creep.memory.target = "";

                let brkbuildings = creep.room.find(FIND_STRUCTURES, { filter: (k) => {
                    return k.hits < k.hitsMax && k.structureType !== STRUCTURE_WALL && k.structureType !== STRUCTURE_RAMPART;
                }});

                brkbuildings.sort((a: AnyStructure, b: AnyStructure) => (a.hits - b.hits));

                if (brkbuildings.length > 0) {
                    creep.memory.target = brkbuildings[0].id;
                }
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                if (creep.memory.target != null || creep.memory.target != "") {
                    let targetStructure: AnyStructure | null = Game.getObjectById<AnyStructure>(creep.memory.target as string);

                    if (targetStructure != null) {
                        let result = creep.repair(targetStructure);
                        if (result == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targetStructure.pos.x, targetStructure.pos.y, { reusePath: 3 });
                        }
                        if (result == ERR_INVALID_TARGET) {
                            creep.memory.target = "";
                        }
                    }

                } else {

                    creep.memory.target = "";
                    let wallRepairer: WallRepairer = new WallRepairer();
                    wallRepairer.update(creep);

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
        let damagedBuildings = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_ROAD);

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
