import { BaseCreep } from "basecreep";

export class Extractor extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "EXTRACTOR", state: "MINING", room: spawn.room.name };

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

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_extractor", { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn extractor: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {
        super.update(creep);

        // let extractorStructure: StructureExtractor = creep.room.find(FIND_STRUCTURES, { filter: (k) => {
        //     return (k.structureType === STRUCTURE_EXTRACTOR);
        // }});

        let deposit: Mineral<MineralConstant> = creep.room.find(FIND_MINERALS)[0];

        // if (extractorStructure != null) {

            if (deposit != null) {

                if (creep.harvest(deposit) === ERR_NOT_IN_RANGE) {

                    creep.moveTo(deposit, { reusePath: 3 });
                }
            }
        // }

    }
}
