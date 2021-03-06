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

        let numParts = Math.floor((spawn.room.energyAvailable - 50) / 100);
        if (numParts == 0) {
            return;
        }

        if (numParts > 5) {
            numParts = 5;
        }

        body.push(MOVE);
        for (let i: number = 0; i < numParts; i++) {
            body.push(WORK);
        }

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName + "_miner", { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn miner: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {
        super.update(creep);

        // if (creep.memory.target == null || creep.memory.target == "") {

        //     let sources: Array<Source> = creep.room.find(FIND_SOURCES_ACTIVE);

        //     if (!creep.room.memory.minerMap.has(creep.id)) {

        //         creep.room.memory.minerMap.set(creep.id, sources[0].id);
        //     }
        // }


        /* Old code */

        if (creep.memory.target == null || creep.memory.target == "") {

            // let numMiners = _.sum(Game.creeps, (c) => c.memory.role == "MINER" && c.room.name === creep.room.name ? 1 : 0) + 1;

            // let sourceNodes = creep.room.find(FIND_SOURCES_ACTIVE);
            // let sourceNode = sourceNodes[numMiners % 2 == 0 ? 0 : 1];

            // creep.memory.target = sourceNode.id;

            this.selectSource(creep);
        } else {

            let sourceNode: Source | null = Game.getObjectById(creep.memory.target);
            if (sourceNode != null) {
                if (creep.harvest(sourceNode) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sourceNode.pos.x, sourceNode.pos.y, { reusePath: 3 });
                }
            }
        }

        // if (creep.memory.target != undefined || creep.memory.target != "") {
        //     let sourceNode = Game.getObjectById(creep.memory.target as string) as Source;
        //     let result = creep.harvest(sourceNode);
        //     if (result === ERR_NOT_IN_RANGE) {
        //         creep.moveTo(sourceNode.pos.x, sourceNode.pos.y, { reusePath: 3 });
        //         // console.log(creep.name + " - " + creep.memory.flipflop);
        //         if (creep.memory.flipflop != undefined) {
        //             creep.memory.flipflop = creep.memory.flipflop + 1;
        //             // 5 retries, and then it tries another source
        //             if (creep.memory.flipflop > 10 && this.countRoles("MINER") > 1) {
        //                 this.selectSource(creep);
        //             }
        //         }
        //     } else if (result === ERR_NOT_ENOUGH_RESOURCES) {

        //         this.selectSource(creep);
        //     }
        // }
    }

    private selectSource(creep: Creep): void {
            let sources: Array<Source> = creep.room.find(FIND_SOURCES_ACTIVE, {filter: (k: Source) => {
                return (k.energy > 0);
            }}) as Array<Source>;

            let sourceId: string | undefined = "";
            if (sources.length > 0) {
                let targetCount = 100;
                sources.forEach((tempSrc) => {

                    let result = this.targetCount(tempSrc.id);
                    if (result < targetCount) {
                        targetCount = result;
                        sourceId = tempSrc.id;
                    }
                });
            } else {

                let emptySources:Array<Source> = creep.room.find(FIND_SOURCES);
                if (emptySources.length > 0) {

                    emptySources.sort((a: Source, b: Source) => {
                        if (a.ticksToRegeneration < b.ticksToRegeneration)
                            return -1;
                        if (a.ticksToRegeneration > b.ticksToRegeneration)
                            return 1;

                        return 0;
                    });

                    sourceId = emptySources[0].id;
                    creep.moveTo(emptySources[0].pos.x, emptySources[0].pos.y);
                }
            }

            creep.memory.target = sourceId;
            creep.memory.flipflop = 0;
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
