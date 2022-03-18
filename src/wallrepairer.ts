import { BaseCreep } from "basecreep";

export class WallRepairer extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "WALLREPAIRER", state: "MINING", room: spawn.room.name };

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

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_wallRepairer", { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn wall-repairer: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {

        if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() > 0) {

                if (!this.getResourceFromFloor(creep, RESOURCE_ENERGY)) {
                    this.getResourceFromContainer(creep, RESOURCE_ENERGY);
                }
            } else {
                creep.memory.state = "WORKING";
                creep.say("Working!");

                let structures: Array<Structure> = creep.room.find(FIND_STRUCTURES, { filter: (k) => {
                    return (k.hits < k.hitsMax);
                }}) as Array<Structure>;

                structures.sort((a: Structure, b: Structure) => a.hits - b.hits);
                if (structures.length > 0) {
                    creep.memory.target = structures[0].id;
                }
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {

                if (creep.memory.target != null || creep.memory.target != undefined) {
                    let targetStructure: AnyStructure | null = Game.getObjectById(creep.memory.target);

                    if (targetStructure != null) {
                        if (creep.repair(targetStructure) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targetStructure.pos.x, targetStructure.pos.y, { reusePath: 3 });
                        }
                    }
                }
            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
                creep.say("Mining!");
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
