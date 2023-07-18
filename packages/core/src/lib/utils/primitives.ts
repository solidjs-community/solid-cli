import { tmpdir } from "os";
import type { Option } from "../../components/autocomplete/autocomplete";
import { createSignal } from "../../reactivity/core";
import { readFile, writeFile } from "fs/promises";
export const [primitives, setPrimitives] = createSignal<Option[]>([]);
const fetchPrimitives = async () => {
  const result = await (
    await fetch("https://registry.npmjs.com/-/v1/search?text=scope:solid-primitives&size=250.json")
  ).json();

  const primitives: Option[] = result.objects.map((v: any) => {
    const opt: Option = {
      label: v.package.name.split("/")[1],
      value: v.package.name,
      group: "primitives",
    };

    return opt;
  });

  return primitives;
};
const cache = async (primitives: Option[]) => {
  const tmp = tmpdir();
  await writeFile(`${tmp}/primitives.json`, JSON.stringify(primitives));
};
const getCached = async () => {
  const tmp = tmpdir();
  const cached = JSON.parse((await readFile(`${tmp}/primitives.json`)).toString());
  return cached as Option[];
};
export const refetchPrimitives = async () => {
  const p = await fetchPrimitives();
  setPrimitives(p);
  await cache(p);
};
export const loadPrimitives = async () => {
  try {
    const cached = await getCached();
    setPrimitives(cached);
  } catch (e) {
    // Cannot fetch from cache, must fetch
    await refetchPrimitives();
  }
};
