import { TextOptions, text } from "@clack/prompts";

interface Field extends TextOptions {
  name: string;
  render?: (this: Field) => Promise<any>;
}

export const form = async (fields: Field[]) => {
  let returns: { name: string; value: any }[] = [];

  for (const field of fields) {
    if (field.render) {
      const r = await field.render.bind(field)();
      if (r) {
        returns.push({ name: field.name, value: r });
      }
      continue;
    }

    const r = await text({ ...field });

    returns.push({ name: field.name, value: r });
  }

  // console.log(JSON.stringify(returns));

  return returns;
};
