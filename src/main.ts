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
import { Explorer } from "explorer";
import { LinkManager } from "linkmanager";

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

  // Used for link structures
  interface LinkNode {
    target: string;
    source: Array<string>;
  }

  // Syntax for adding properties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }

}

const LinkNodes: Array<LinkNode> = [

  { target:"622666c4d1cdfb135e4ab1f6", source:["621397690f1d5e04031db3d1"] },

];

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

  let spawnLogicCPU: number = Game.cpu.getUsed();
  for (const spName in Game.spawns) {
    let spawn = Game.spawns[spName] as StructureSpawn;
    let spawnRoom: Room = spawn.room;

    let numMiners = _.sum(Game.creeps, (c) => c.memory.role == "MINER" && c.room.name === spawnRoom.name ? 1 : 0);
    let numHarvesters = _.sum(Game.creeps, (c) => c.memory.role == "HARVESTER" && c.room.name === spawnRoom.name ? 1 : 0);
    let numBuilders = _.sum(Game.creeps, (c) => c.memory.role == "BUILDER" && c.room.name === spawnRoom.name ? 1 : 0);
    let numRepairers = _.sum(Game.creeps, (c) => c.memory.role == "REPAIRER" && c.room.name === spawnRoom.name ? 1 : 0);
    let numGunners = _.sum(Game.creeps, (c) => c.memory.role == "GUNNER" && c.room.name === spawnRoom.name ? 1 : 0);
    let numUpgraders = _.sum(Game.creeps, (c) => c.memory.role == "UPGRADER" && c.room.name === spawnRoom.name ? 1: 0);
    let numDefenders = _.sum(Game.creeps, (c) => c.memory.role == "DEFENDER" && c.room.name === spawnRoom.name ? 1: 0);
    let numRangedDefenders = _.sum(Game.creeps, (c) => c.memory.role == "RANGEDDEFENDER" && c.room.name === spawnRoom.name ? 1: 0);
    let numWallRepairers = _.sum(Game.creeps, (c) => c.memory.role == "WALLREPAIRER" && c.room.name === spawnRoom.name ? 1: 0);
    let numQuartermasters = _.sum(Game.creeps, (c) => c.memory.role == "QUARTERMASTER" && c.room.name === spawnRoom.name ? 1: 0);
    let numLinkBearers = _.sum(Game.creeps, (c) => c.memory.role == "LINKBEARER" && c.room.name === spawnRoom.name ? 1: 0);
    let numHealers = _.sum(Game.creeps, (c) => c.memory.role == "HEALER" && c.room.name === spawnRoom.name ? 1: 0);
    let numExplorers = _.sum(Game.creeps, (c) => c.memory.role == "EXPLORER" && c.room.name === spawnRoom.name ? 1: 0);

      let storageStructures = spawn.room.find(FIND_STRUCTURES, { filter: (k: StructureStorage) => {
        return (k.structureType === STRUCTURE_STORAGE);
      }});

      let turretStructures: Array<StructureTower> = spawn.room.find(FIND_MY_STRUCTURES, { filter: (k: StructureTower) => {
        return (k.structureType === STRUCTURE_TOWER);
      }}) as Array<StructureTower>;

      let linkStructures: Array<StructureLink> = spawn.room.find(FIND_MY_STRUCTURES, { filter: (k) => {
        return (k.structureType === STRUCTURE_LINK);
      }}) as Array<StructureLink>;

      // console.log("LinkStructures: " + linkStructures.length + " - " + spawnRoom.name);

      let creepName = spawn.name + "_" + Game.time;
      // console.log("Creep: " + creepName);

      let roomLevel = (spawn.room.controller != null) ? spawn.room.controller.level : 1;

      // console.log("Room: " + spawnRoom.name + " Energy: " + spawnRoom.energyAvailable + " / Capacity: " + spawnRoom.energyCapacityAvailable);
      // if (spawn.room.energyAvailable >= spawn.room.energyCapacityAvailable && numMiners >= 1 && numHarvesters >= 1) {

      if (numMiners >= 1 && numHarvesters >= 1) {
        if (numMiners < 3) {
          let miner: Miner = new Miner();
          miner.spawnCreep(creepName, spawn);
        } else if (numHarvesters < 3) {
          let harvester: Harvester = new Harvester();
          harvester.spawnCreep(creepName, spawn);
        } else if (numUpgraders < 1) {
          let upgrader: Upgrader = new Upgrader();
          upgrader.spawnCreep(creepName, spawn);
        } else if (numBuilders < 3) {
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
          let linkbearer: LinkBearer = new LinkBearer(LinkNodes);
          linkbearer.spawnCreep(creepName, spawn);
        } else if (numGunners < 1 && turretStructures.length > 0) {
          let gunner: Gunner = new Gunner();
          gunner.spawnCreep(creepName, spawn);
        } else if (numDefenders < 1) {
          spawn.spawnCreep([ MOVE, MOVE, TOUGH, ATTACK ], creepName, { memory: {role: "DEFENDER", room: spawn.room.name }} as SpawnOptions);
        } else if (numRangedDefenders < 1) {
          spawn.spawnCreep([ MOVE, MOVE, TOUGH, RANGED_ATTACK ], creepName, { memory: {role: "RANGEDDEFENDER", room: spawn.room.name }} as SpawnOptions);
        } else if (numExplorers < 1) {
          let explorer: Explorer = new Explorer();
          explorer.spawnCreep(creepName, spawn);
        }
     } else {

      // We cannot work without miners!
      if (numMiners < 1) {
        let miner: Miner = new Miner();
        miner.spawnCreep(creepName, spawn);
      }

      // Or harvesters!
      if (numHarvesters < 1) {
        let harvester: Harvester = new Harvester();
        harvester.spawnCreep(creepName, spawn);
      }
    }

    // Utilise tower manager
    let towerManager = new TowerManager();
    towerManager.update(spawn.room.name);
  }
  console.log("PERFORMANCE: [spawn logic: " + (Game.cpu.getUsed() - spawnLogicCPU) + "]");

  let creepLogicCPU: number = Game.cpu.getUsed();
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
      let linkbearer: LinkBearer = new LinkBearer(LinkNodes);
      linkbearer.update(creep);
    }
    if (creep.memory.role === "HEALER") {
      let healer: Healer = new Healer();
      healer.update(creep);
    }
    if (creep.memory.role === "EXPLORER") {
      let explorer: Explorer = new Explorer();
      explorer.update(creep);
    }
  }
  console.log("PERFORMANCE: [creep updates: " + (Game.cpu.getUsed() - creepLogicCPU) + "]");

  let linkManager: LinkManager = new LinkManager();
  linkManager.update(LinkNodes);

  // Code to run for each room
  // console.log("CPU: " + Game.cpu.limit);
  Game.cpu.generatePixel();

});
