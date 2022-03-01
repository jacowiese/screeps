import { BaseCreep } from "basecreep";

export class Explorer extends BaseCreep{

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "EXPLORER", state: "EXPLORE", room: spawn.room.name };

        let body: Array<BodyPartConstant> = new Array<BodyPartConstant>();

        let numParts = Math.floor(spawn.room.energyAvailable / 700);
        if (numParts == 0) {
            return;
        }

        body.push(MOVE);
        body.push(MOVE);
        body.push(CLAIM);

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName, { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn explorer: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {

        let flag: Flag = Game.flags['claim'];
        for (const fname in Game.flags) {
            if (fname === 'claim') {
                flag = Game.flags[fname];
                break;
            }
        }

        if (flag != undefined) {


            // If the creep is in the claim flag room, do its thing!
            if (creep.pos.roomName === flag.pos.roomName) {

                let targetRoom: Room = Game.rooms[flag.pos.roomName];
                if (targetRoom.controller != undefined) {

                    // If there is a controller in the claim flag room, try to claim it!
                    if (creep.claimController(targetRoom.controller) === ERR_NOT_IN_RANGE) {

                        creep.moveTo(targetRoom.controller.pos.x, targetRoom.controller.pos.y);
                    }
                }
            } else {

                // If the creep is not in the claim flag room, go to it first!
                creep.moveTo(flag);

            }
        }


    }
}
