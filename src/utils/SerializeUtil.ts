export class SerializeUtil {

    public static SerializeArray<T>(param: Array<T>) : string {
        return JSON.stringify(param);
    }

    public static DeserializeArray<T>(param: string) : Array<T> {
        return JSON.parse(param) as Array<T>;
    }

    public static Serialize<T>(param: T) : string {
        return JSON.stringify(param);
    }

    public static Deserialize<T>(param: string) : T {
        return JSON.parse(param) as T;
    }
};
