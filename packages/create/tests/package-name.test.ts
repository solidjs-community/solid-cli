import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { projectNameFromDestination, toValidPackageName, updatePackageJsonName } from "../src/utils/package-name";

describe("toValidPackageName", () => {
	it("lowercases and replaces spaces with dashes", () => {
		expect(toValidPackageName("My Cool App")).toBe("my-cool-app");
	});

	it("strips characters that are invalid in npm names", () => {
		expect(toValidPackageName("solid_project!")).toBe("solid-project-");
	});

	it("strips a leading dot or underscore", () => {
		expect(toValidPackageName(".project")).toBe("project");
		expect(toValidPackageName("_project")).toBe("project");
	});
});

describe("projectNameFromDestination", () => {
	it("uses the last path segment", () => {
		expect(projectNameFromDestination(join("foo", "my-app"))).toBe("my-app");
	});

	it("sanitizes the segment", () => {
		expect(projectNameFromDestination(join("foo", "My App"))).toBe("my-app");
	});
});

describe("updatePackageJsonName", () => {
	const dirs: string[] = [];
	const scratch = () => {
		const dir = mkdtempSync(join(tmpdir(), "solid-cli-name-"));
		dirs.push(dir);
		return dir;
	};
	afterEach(() => {
		for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
	});

	it("replaces the template name with the directory name", async () => {
		const dir = scratch();
		const destination = join(dir, "my-app");
		mkdirSync(destination, { recursive: true });
		writeFileSync(
			join(destination, "package.json"),
			JSON.stringify({ name: "vite-template-solid", version: "0.0.0" }, null, 2) + "\n",
		);

		await updatePackageJsonName(destination);

		const pkg = JSON.parse(readFileSync(join(destination, "package.json")).toString());
		expect(pkg.name).toBe("my-app");
		expect(pkg.version).toBe("0.0.0");
	});

	it("preserves the template formatting (indent + trailing newline)", async () => {
		const dir = scratch();
		const destination = join(dir, "my-app");
		mkdirSync(destination, { recursive: true });
		writeFileSync(join(destination, "package.json"), '{\n    "name": "example-basic"\n}\n');

		await updatePackageJsonName(destination);

		expect(readFileSync(join(destination, "package.json")).toString()).toBe('{\n    "name": "my-app"\n}\n');
	});

	it("is a no-op when there is no package.json", async () => {
		await expect(updatePackageJsonName(join(scratch(), "empty"))).resolves.toBeUndefined();
	});

	it("does not rewrite the file when the name already matches", async () => {
		const dir = scratch();
		const destination = join(dir, "my-app");
		mkdirSync(destination, { recursive: true });
		const contents = JSON.stringify({ name: "my-app" }, null, 2);
		writeFileSync(join(destination, "package.json"), contents);

		await updatePackageJsonName(destination);

		expect(readFileSync(join(destination, "package.json")).toString()).toBe(contents);
	});
});
