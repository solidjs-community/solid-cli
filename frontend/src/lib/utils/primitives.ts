import type { Option } from "../../autocomplete/autocomplete";

export const fetchPrimitives = async () => {
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
