import { createStart, CreateStartArgs } from "./create-start";
import { createVanilla, CreateVanillaArgs } from "./create-vanilla";

export async function create(args: CreateVanillaArgs, js: boolean, isStart: false): Promise<void>;
export async function create(args: CreateStartArgs, js: boolean, isStart: true): Promise<void>;
export async function create(args: CreateVanillaArgs | CreateStartArgs, js: boolean, isStart: boolean) {
    if (isStart) {
        return createStart(args, js);
    }
    else {
        return createVanilla(args, js);
    }
}