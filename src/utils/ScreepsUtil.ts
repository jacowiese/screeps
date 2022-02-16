export class ScreepsUtil {

    public static distance(a: RoomPosition, b: RoomPosition): number {
        let sqrDist = Math.abs(a.x * a.x - b.x * b.x + a.y * a.y - b.y * b.y);
        return Math.sqrt(sqrDist);
    }

    public static samePos(a: RoomPosition, b: RoomPosition): boolean {
        if (Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1)
            return true;

        return false;
    }

}
