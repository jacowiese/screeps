import { Harvester } from "harvester";
import { Builder } from "builder";
import { Repairer } from "repairer";
import { Upgrader } from "upgrader";
import { Defender } from "defender";
import { RangedDefender } from "rangeddefender";
import { WallRepairer } from "wallrepairer";
import { ErrorMapper } from "utils/ErrorMapper";
import { TowerManager } from "tower";
import { Miner } from "miner";
import { Gunner } from "gunner";
import { QuarterMaster } from "quartermaster";
import { LinkBearer } from "linkbearer";
import { Healer } from "healer";

declare global {
  /*
    BODYPART_COST: { "move": 50, "work": 100, "attack": 80, "carry": 50, "heal": 250, "ranged_attack": 150, "tough": 10, "claim": 600 }

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

  let numMiners = _.sum(Game.creeps, (c) => c.memory.role == "MINER" ? 1 : 0);
  let numHarvesters = _.sum(Game.creeps, (c) => c.memory.role == "HARVESTER" ? 1 : 0);
  let numBuilders = _.sum(Game.creeps, (c) => c.memory.role == "BUILDER" ? 1 : 0);
  let numRepairers = _.sum(Game.creeps, (c) => c.memory.role == "REPAIRER" ? 1 : 0);
  let numGunners = _.sum(Game.creeps, (c) => c.memory.role == "GUNNER" ? 1 : 0);
  let numUpgraders = _.sum(Game.creeps, (c) => c.memory.role == "UPGRADER" ? 1: 0);
  let numDefenders = _.sum(Game.creeps, (c) => c.memory.role == "DEFENDER" ? 1: 0);
  let numRangedDefenders = _.sum(Game.creeps, (c) => c.memory.role == "RANGEDDEFENDER" ? 1: 0);
  let numWallRepairers = _.sum(Game.creeps, (c) => c.memory.role == "WALLREPAIRER" ? 1: 0);
  let numQuartermasters = _.sum(Game.creeps, (c) => c.memory.role == "QUARTERMASTER" ? 1: 0);
  let numLinkBearers = _.sum(Game.creeps, (c) => c.memory.role == "LINKBEARER" ? 1: 0);
  let numHealers = _.sum(Game.creeps, (c) => c.memory.role == "HEALER" ? 1: 0);

  for (const spName in Game.spawns) {
    let spawn = Game.spawns[spName];

      let storageStructures = spawn.room.find(FIND_STRUCTURES, { filter: (k: StructureStorage) => {
        return (k.structureType === STRUCTURE_STORAGE);
      }});

      let turretStructures: Array<StructureTower> = spawn.room.find(FIND_MY_STRUCTURES, { filter: (k: StructureTower) => {
        return (k.structureType === STRUCTURE_TOWER);
      }}) as Array<StructureTower>;

      let linkStructures: Array<StructureLink> = spawn.room.find(FIND_MY_STRUCTURES, { filter: (k) => {
        return (k.structureType === STRUCTURE_LINK);
      }}) as Array<StructureLink>;

      let creepName = spawn.room.name + "_" + spawn.name + "_" + Game.time;

      let roomLevel = (spawn.room.controller != null) ? spawn.room.controller.level : 1;

      console.log("Energy available: " + spawn.room.energyAvailable + " / Energy capacity: " + spawn.room.energyCapacityAvailable);
      // if (spawn.room.energyAvailable >= spawn.room.energyCapacityAvailable && numMiners >= 1 && numHarvesters >= 1) {

        if (numMiners < 4) {
          let miner: Miner = new Miner();
          miner.spawnCreep(creepName, spawn);
        } else if (numHarvesters < 4) {
          let harvester: Harvester = new Harvester();
          harvester.spawnCreep(creepName, spawn);
        } else if (numUpgraders < 1) {
          let upgrader: Upgrader = new Upgrader();
          upgrader.spawnCreep(creepName, spawn);
        } else if (numBuilders < 2) {
          let builder: Builder = new Builder();
          builder.spawnCreep(creepName, spawn);
        } else if (numRepairers < 2) {
          let repairer: Repairer = new Repairer();
          repairer.spawnCreep(creepName, spawn);
        } else if (numWallRepairers < 1) {
          let wallrepairer: WallRepairer = new WallRepairer();
          wallrepairer.spawnCreep(creepName, spawn);
        } else if (numHealers < 1) {
          let healer: Healer = new Healer();
          healer.spawnCreep(creepName, spawn);
        } else if (numQuartermasters < 2 && storageStructures.length > 0) {
          let quartermaster: QuarterMaster = new QuarterMaster();
          quartermaster.spawnCreep(creepName, spawn);
        } else if (numLinkBearers < 1 && linkStructures.length > 0) {
          let linkbearer: LinkBearer = new LinkBearer();
          linkbearer.spawnCreep(creepName, spawn);
        } else if (numGunners < 1 && turretStructures.length > 0) {
          let gunner: Gunner = new Gunner();
          gunner.spawnCreep(creepName, spawn);
        } else if (numDefenders < 1) {
          spawn.spawnCreep([ MOVE, MOVE, TOUGH, ATTACK ], creepName, { memory: {role: "DEFENDER", room: spawn.room.name }} as SpawnOptions);
        } else if (numRangedDefenders < 1) {
          spawn.spawnCreep([ MOVE, MOVE, TOUGH, RANGED_ATTACK ], creepName, { memory: {role: "RANGEDDEFENDER", room: spawn.room.name }} as SpawnOptions);
        }
    // } else {

    //   // We cannot work without miners!
    //   if (numMiners < 1) {
    //     let miner: Miner = new Miner();
    //     miner.spawnCreep(creepName, spawn);
    //   }

    //   // Or harvesters!
    //   if (numHarvesters < 1) {
    //     let harvester: Harvester = new Harvester();
    //     harvester.spawnCreep(creepName, spawn);
    //   }
    // }

    // Utilise tower manager
    let towerManager = new TowerManager();
    towerManager.update(spawn.room.name);


  }

  for (const creepName in Game.creeps) {
    let creep = Game.creeps[creepName];

    if (creep.memory.role === "MINER") {
      let miner = new Miner();
      miner.update(creep);
    }
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
    if (creep.memory.role === "GUNNER") {
      let gunner = new Gunner();
      gunner.update(creep);
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
    if (creep.memory.role === "QUARTERMASTER") {
      let quartermaster: QuarterMaster = new QuarterMaster();
      quartermaster.update(creep);
    }
    if (creep.memory.role === "LINKBEARER") {
      let linkbearer: LinkBearer = new LinkBearer();
      linkbearer.update(creep);
    }
    if (creep.memory.role === "HEALER") {
      let healer: Healer = new Healer();
      healer.update(creep);
    }
  }

  // Code to run for each room
  console.log("CPU: " + Game.cpu.limit);
  Game.cpu.generatePixel();

});
