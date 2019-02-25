import * as fs from "fs-extra";
import { from } from "rxjs";

export const readJson =
    (file: string, options?: fs.ReadOptions) =>
        from(fs.readJson(file, options));