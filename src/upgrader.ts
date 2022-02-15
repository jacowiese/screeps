import { BaseCreep } from "basecreep";
import { random } from "lodash";

export class Upgrader extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "UPGRADER", state: "MINING", room: spawn.room.name };

        let body: Array<BodyPartConstant> = new Array<BodyPartConstant>();

        let numParts = Math.floor(spawn.room.energyAvailable / 250);
        if (numParts == 0) {
            return;
        }

        for (let i: number = 0; i < numParts; i++) {
            body.push(MOVE);
            body.push(MOVE);
            body.push(WORK);
            body.push(CARRY);
        }

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName, { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn upgrader: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {

        if (creep.memory.state == "MINING") {
            if (creep.store.getFreeCapacity() != 0) {

                let structures = _.filter(creep.room.find(FIND_STRUCTURES), (k) => k.structureType == STRUCTURE_CONTAINER && k.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
                let cntnr = this.closestStructure(creep, structures) as StructureContainer;

                // if there are containers with energy, go get it from them!
                if (cntnr != null) {
                    if (creep.withdraw(cntnr, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(cntnr.pos.x, cntnr.pos.y);
                    }
                } else {

                    // do nothing - only get energy from a container
                    // this.moveToRandomLocation(creep);

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
