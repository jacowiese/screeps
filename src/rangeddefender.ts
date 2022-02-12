import { random } from "lodash";

export class RangedDefender {

    public constructor() {
    }

    public update(creep: Creep): void {

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
