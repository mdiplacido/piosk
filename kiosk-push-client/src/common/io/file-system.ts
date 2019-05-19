import * as fs from "fs-extra";
import { from } from "rxjs";

export const readJson =
    (file: string, options?: fs.ReadOptions) =>
        from(fs.readJson(file, options));

export const saveJson =
    (file: string, object: any, options?: fs.WriteOptions) =>
        from(fs.writeFile(file, JSON.stringify(object, null, 4), options));