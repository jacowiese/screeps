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
    target?: string;
    flipflop?: number;
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

  for (const spName in Game.spawns) {
    let spawn = Game.spawns[spName];

      let creepName = spawn.room.name + "_" + spawn.name + "_" + Game.time;

      let roomLevel = (spawn.room.controller != null) ? spawn.room.controller.level : 1;

    if (numHarvesters < 4 * roomLevel) {
      let harvester: Harvester = new Harvester();
      harvester.spawnCreep(creepName, spawn);
    } else if (numBuilders < 3) {
      let builder: Builder = new Builder();
      builder.spawnCreep(creepName, spawn);
    } else if (numRepairers < 2) {
      let repairer: Repairer = new Repairer();
      repairer.spawnCreep(creepName, spawn);
    } else if (numUpgraders < 1) {
      let upgrader: Upgrader = new Upgrader();
      upgrader.spawnCreep(creepName, spawn);
    } else if (numDefenders < 2) {
      spawn.spawnCreep([ MOVE, MOVE, TOUGH, ATTACK ], creepName, { memory: {role: "DEFENDER", room: spawn.room.name }} as SpawnOptions);
    } else if (numRangedDefenders < 2) {
      spawn.spawnCreep([ MOVE, MOVE, TOUGH, RANGED_ATTACK ], creepName, { memory: {role: "RANGEDDEFENDER", room: spawn.room.name }} as SpawnOptions);
    } else if (numWallRepairers < 2) {
      let wallrepairer: WallRepairer = new WallRepairer();
      wallrepairer.spawnCreep(creepName, spawn);
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
