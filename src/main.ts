import { Harvester } from "harvester";
import { Builder } from "builder";
import { Repairer } from "repairer";
import { Upgrader } from "upgrader";
import { Defender } from "defender";
import { RangedDefender } from "rangeddefender";
import { WallRepairer } from "wallrepairer";
import { Explorer } from "explorer";
import { random } from "lodash";
import { SourceNode } from "source-map";
import { ErrorMapper } from "utils/ErrorMapper";
import { SerializeUtil } from "utils/SerializeUtil";
import "role";
import { TowerManager } from "tower";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definition alone.
          You must also give them an implementation if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    state: string;
    room: string;
    target: string;
  }

  // Syntax for adding properties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }


}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  let numHarvesters = _.sum(Game.creeps, (c) => c.memory.role == "HARVESTER" ? 1 : 0);
  let numBuilders = _.sum(Game.creeps, (c) => c.memory.role == "BUILDER" ? 1 : 0);
  let numRepairers = _.sum(Game.creeps, (c) => c.memory.role == "REPAIRER" ? 1: 0);
  let numUpgraders = _.sum(Game.creeps, (c) => c.memory.role == "UPGRADER" ? 1: 0);
  let numDefenders = _.sum(Game.creeps, (c) => c.memory.role == "DEFENDER" ? 1: 0);
  let numRangedDefenders = _.sum(Game.creeps, (c) => c.memory.role == "RANGEDDEFENDER" ? 1: 0);
  let numWallRepairers = _.sum(Game.creeps, (c) => c.memory.role == "WALLREPAIRER" ? 1: 0);

  Game.map.visual.clear().text("Harvesters: " + numHarvesters, new RoomPosition(30,30, "W32S51"), { color: "#ffffff" });

  for (const spName in Game.spawns) {
    let spawn = Game.spawns[spName];

    if (spawn.room.energyAvailable >= 300) {
      let creepName = spawn.room.name + "_" + spawn.name + "_" + Game.time;

      let roomLevel = (spawn.room.controller != null) ? spawn.room.controller.level : 1;

      if (numHarvesters < 3 * roomLevel) {
        if (spawn.spawnCreep([ MOVE, MOVE, MOVE, WORK, CARRY ], creepName, { memory: {role: "HARVESTER", state: "MINING", room: spawn.room.name }} as SpawnOptions) == ERR_NOT_ENOUGH_ENERGY) {
          console.log('Could not spawn harvester: not enough energy!');
        }
      } else if (numBuilders < 1) {
        spawn.spawnCreep([ MOVE, MOVE, MOVE, WORK, CARRY ], creepName, { memory: {role: "BUILDER", state: "MINING", room: spawn.room.name }} as SpawnOptions);
      } else if (numRepairers < 2) {
        spawn.spawnCreep([ MOVE, MOVE, MOVE, WORK, CARRY ], creepName, { memory: {role: "REPAIRER", state: "MINING", room: spawn.room.name }} as SpawnOptions);
      } else if (numUpgraders < 1 * roomLevel) {
        spawn.spawnCreep([ MOVE, MOVE, WORK, CARRY ], creepName, { memory: {role: "UPGRADER", state: "MINING", room: spawn.room.name }} as SpawnOptions);
      } else if (numDefenders < 2) {
        spawn.spawnCreep([ MOVE, MOVE, TOUGH, ATTACK ], creepName, { memory: {role: "DEFENDER", room: spawn.room.name }} as SpawnOptions);
      } else if (numRangedDefenders < 2) {
        spawn.spawnCreep([ MOVE, MOVE, TOUGH, RANGED_ATTACK ], creepName, { memory: {role: "RANGEDDEFENDER", room: spawn.room.name }} as SpawnOptions);
      }else if (numWallRepairers < 2) {
        spawn.spawnCreep([ MOVE, MOVE, WORK, CARRY ], creepName, { memory: {role: "WALLREPAIRER", state: "MINING", room: spawn.room.name }} as SpawnOptions);
      }

    }
  }

  for (const creepName in Game.creeps) {
    let creep = Game.creeps[creepName];

    if (creep.memory.role === "HARVESTER") {
      let harvester = new Harvester();
      harvester.update(creep);
    }
    if (creep.memory.role === "BUILDER") {
      let builder = new Builder();
      builder.update(creep);
    }
    if (creep.memory.role === "REPAIRER") {
      let repairer = new Repairer();
      repairer.update(creep);
    }
    if (creep.memory.role === "UPGRADER") {
      let upgrader = new Upgrader();
      upgrader.update(creep);
    }
    if (creep.memory.role === "DEFENDER") {
      let defender = new Defender();
      defender.update(creep);
    }
    if (creep.memory.role === "RANGEDDEFENDER") {
      let rdefender = new RangedDefender();
      rdefender.update(creep);
    }
    if (creep.memory.role === "WALLREPAIRER") {
      let wallrepairer = new WallRepairer();
      wallrepairer.update(creep);
    }
  }

  // Code to run for each room



  // Utilise tower manager
  let towerManager = new TowerManager();
  towerManager.update("W32S51");

});
