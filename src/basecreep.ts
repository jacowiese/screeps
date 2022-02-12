export abstract class BaseCreep {

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

    public dist(a: RoomPosition, b: RoomPosition): number {
        let sqrDist = Math.abs(a.x * a.x - b.x * b.x + a.y * a.y - b.y * b.y);
        return Math.sqrt(sqrDist);
    }

}
