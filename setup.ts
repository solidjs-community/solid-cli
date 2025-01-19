import type { TestProject } from 'vitest/node'
import { existsSync, rmSync } from "fs";
export default function setup(project: TestProject) {
    //   Clean up test directory before running tests
    if (existsSync("./test"))
        rmSync("./test", { recursive: true })
}