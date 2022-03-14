import { random } from "lodash";

export abstract class BaseCreep {

    public spawnCreep(creepName: string, spawn: StructureSpawn): void {}

    public update(creep: Creep): void {}

    public getResourceFromFloor<R extends ResourceConstant>(creep: Creep, resource: R) : boolean {
        let resourcePos: Resource | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: (r: Resource) => {
            return (r.amount > 100 && r.resourceType === resource);
        }});
        if (resourcePos != null) {

            creep.say("Floor!");
            if (creep.pickup(resourcePos) === ERR_NOT_IN_RANGE) {
                creep.moveTo(resourcePos.pos.x, resourcePos.pos.y);
            }

            return true;
        }

        return false;
    }

    public getResourceFromContainer<R extends ResourceConstant>(creep: Creep, resource: R) : boolean {
        let container: StructureContainer | null = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (k: StructureContainer) => {
            return (k.structureType === STRUCTURE_CONTAINER && k.store.getUsedCapacity(resource) > 100);
        }}) as StructureContainer;

        // if there are containers with energy, go get it from them!
        if (container != null) {

            creep.say("Container!");
            if (creep.withdraw(container, resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container.pos.x, container.pos.y);
            }

            return true;
        }

        return false;
    }

    public getResourceFromStorage<R extends ResourceConstant>(creep: Creep, resource: R) : boolean {
        let storage:Array<StructureStorage> = creep.room.find(FIND_MY_STRUCTURES, { filter: (k: StructureStorage) => {
            return (k.structureType === STRUCTURE_STORAGE && k.store.getUsedCapacity(resource) > 0);
        }}) as Array<StructureStorage>;
        if (storage.length > 0) {

            if (creep.withdraw(storage[0], resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage[0].pos.x, storage[0].pos.y);
            }

            return true;
        }

        return false;
    }

    public getResourceFromLink(creep: Creep) : boolean {
        let link = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (k) => {
            return (k.structureType === STRUCTURE_LINK && k.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
        }});
        if (link != undefined || link != null) {

            if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(link.pos.x, link.pos.y);
            }

            return true;
        }

        return false;
    }

    public closestConstructionSite(creep: Creep): ConstructionSite | null {
        let building : ConstructionSite | null = null;
        let distance : number = Number.MAX_VALUE;
        let incompleteBuildings = _.filter(creep.room.find(FIND_MY_CONSTRUCTION_SITES), (s) => s.progress < s.progressTotal);
        if (incompleteBuildings != null) {

            for (let b = 0; b < incompleteBuildings.length; b++) {
                let d = this.dist(creep.pos, incompleteBuildings[b].pos);
                if (d < distance) {
                    distance = d;
                    building = incompleteBuildings[b];
                }
            }
        }

        // console.log("Min distance: " + distance);

        return building;
    }

    public closestStructure(creep: Creep, structures: Array<Structure>): Structure | null {
        let building : Structure | null = null;
        let distance : number = Number.MAX_VALUE;
        if (structures != null) {

            for (let b = 0; b < structures.length; b++) {
                let d = this.dist(creep.pos, structures[b].pos);
                if (d <= distance) {
                    distance = d;
                    building = structures[b];
                }
            }
        }

        return building;
    }

    public dist(a: RoomPosition, b: RoomPosition): number {
        let sqrDist = Math.abs(a.x * a.x - b.x * b.x + a.y * a.y - b.y * b.y);
        return Math.sqrt(sqrDist);
    }

    public moveToRandomLocation(creep: Creep): void {
        if (creep.moveTo(random(10, 40, false), random(10, 40, false)) == ERR_NO_PATH) {
            // errrr, do nothing?
        }
    }

    public countRoles(role: string): number {
        return _.sum(Game.creeps, (c) => c.memory.role == role ? 1 : 0);
    }
}
