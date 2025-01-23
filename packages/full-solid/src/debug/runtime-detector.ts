type RuntimeName = "Bun" | "Node" | "Deno"
type Runtime = { name: RuntimeName, version: string }
declare global {
  var Bun: { version: string } | undefined
  var Deno: { version: { deno: string } } | undefined
}
export const detectRuntime = (): Runtime => {
  if (globalThis.Bun) {
    return { name: "Bun", version: globalThis.Bun?.version }
  }
  if (globalThis.Deno) {
    return { name: "Deno", version: globalThis.Deno?.version?.deno }
  }
  // @ts-ignore
  if (typeof process !== undefined && !!process.versions?.node) {
    // @ts-ignore
    return { name: "Node", version: process?.version }
  }
  throw new Error("Unable to detect")
}
