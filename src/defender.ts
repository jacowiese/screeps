import { BaseCreep } from "basecreep";
import { random } from "lodash";

export class Defender extends BaseCreep {

    public constructor() {
        super();
    }

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {
        super.spawnCreep(creepName, spawn);

        let creepMemory: CreepMemory = {role: "DEFENDER", state: "", room: spawn.room.name };

        let body: Array<BodyPartConstant> = new Array<BodyPartConstant>();

        let numParts = Math.floor(spawn.room.energyAvailable / 200);
        if (numParts == 0) {
            return;
        }

        for (let i: number = 0; i < numParts; i++) {
            body.push(MOVE); // 50
            body.push(MOVE); // 50
            body.push(TOUGH); // 10
            body.push(TOUGH); // 10
            body.push(ATTACK); // 80
        }

        let result: ScreepsReturnCode = spawn.spawnCreep(body, creepName, { memory: creepMemory });

        console.log(creepMemory.role + " - " + result + " -> " + numParts + ":" + body);

        switch (result) {
            case ERR_NOT_ENOUGH_ENERGY: {
                console.log('Could not spawn defender: not enough energy!');
            }
        }
    }

    public update(creep: Creep): void {

        super.update(creep);

        let flag: Flag = Game.flags['defend'];
        for (const fname in Game.flags) {
            if (fname === 'defend') {
                flag = Game.flags[fname];
                break;
            }
        }

        // If there is a build flag, go there and build!
        if (flag != undefined) {

            if (creep.pos.roomName !== flag.pos.roomName) {

                console.log("Defender moving to room: " + flag.pos.roomName);
                creep.moveTo(flag);
                return;
            }
        }


        // defend!
        let hostile = creep.room.find(FIND_HOSTILE_CREEPS)[0];
        if (hostile != null) {
            if (creep.attack(hostile) != ERR_NOT_IN_RANGE) {
                creep.moveTo(hostile.pos.x, hostile.pos.y);
            }
        } else {

            // First try to move to a flag called move! because it might be important.
            let flag = Game.flags["rally"];
            if (flag != null) {
                creep.moveTo(flag.pos.x, flag.pos.y);
            } else {
                // move to random location in room, until a hostile shows up
                if (creep.moveTo(random(10, 40, false), random(10, 40, false)) == ERR_NO_PATH) {
                    // errrr, do nothing?
                }
            }
        }
    }
}
