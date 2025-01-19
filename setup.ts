import type { TestProject } from 'vitest/node'
import { rmSync } from "fs";
export default function setup(project: TestProject) {
    //   Clean up test directory before running tests
    rmSync("./test", { recursive: true })
}