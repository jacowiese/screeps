import { BaseCreep } from "basecreep";
import { random } from "lodash";

export class Miner extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "MINER", state: "MINING", room: spawn.room.name };

        let body: Array<BodyPartConstant> = new Array<BodyPartConstant>();

        let numParts = Math.floor(spawn.room.energyAvailable / 250);
        if (numParts == 0) {
            return;
        }

        for (let i: number = 0; i < numParts; i++) {
            body.push(MOVE);
            body.push(WORK);
            body.push(WORK);
        }

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName, { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn miner: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {
        super.update(creep);

        if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() != 0) {

                if (creep.memory.target == null || creep.memory.target == "") {
                    let sources: Array<Source> = creep.room.find(FIND_SOURCES_ACTIVE) as Array<Source>;

                    let sourceId: string | undefined = "";
                    let targetCount = 100;
                    sources.forEach((tempSrc) => {

                        let result = this.targetCount(tempSrc.id);
                        if (result < targetCount) {
                            targetCount = result;
                            sourceId = tempSrc.id;
                        }
                    });

                    creep.memory.target = sourceId;
                }

                let sourceNode = Game.getObjectById(creep.memory.target) as Source;
                if (creep.harvest(sourceNode) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sourceNode.pos.x, sourceNode.pos.y);
                }
            } else {
                creep.memory.state = "WORKING";
            }
        } else if (creep.memory.state == "WORKING") {
            if (creep.store.getUsedCapacity() > 0) {


                // put energy into container if there are any
                let cntnr = _.filter(creep.room.find(FIND_STRUCTURES), (k) => k.structureType == STRUCTURE_CONTAINER && k.store.getFreeCapacity(RESOURCE_ENERGY) > 0)[0];
                if (cntnr != null) {
                    if (creep.transfer(cntnr, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(cntnr.pos.x, cntnr.pos.y);
                    }
                }

            } else {
                creep.memory.state = "MINING";
                creep.memory.target = "";
            }
        }
    }

    public targetCount(sourceId: string): number {

        let counter = 0;
        for (let creepName in Game.creeps) {
            let creep: Creep = Game.creeps[creepName];

            if (creep.memory.target != undefined || creep.memory.target != "") {

                if (creep.memory.target == sourceId) {
                    counter++;
                }
            }
        }

        return counter;
    }
}
