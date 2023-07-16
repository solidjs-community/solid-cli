import { Key } from "node:readline";
import { Prompt } from "@clack/core";
import { TextOptions } from "@clack/prompts";
import { S_CHECKBOX_ACTIVE, S_CHECKBOX_SELECTED, S_CHECKBOX_INACTIVE, S_BAR, S_BAR_END, box } from "./utils";
import color from "picocolors";

export type Option = { value: any; label?: string; hint?: string; group?: string };

const buildRegex = (str: string) => {
  let s = "";

  for (let i = 0; i < str.length; i++) {
    s += str[i] + ".*";
  }

  s = ".*" + s;

  return RegExp(s);
};

const search = <T extends Option>(values: T[], lookFor: string) => {
  const group = lookFor.match(/(\w+)\/(\w+)?/);

  if (group) {
    const groupData = values.filter((option) => option.group && option.group.includes(group[1]));

    const sp = group[2];

    if (!sp) return groupData;

    const r = buildRegex(sp);
    return groupData.filter((v) => r.test((v.label ?? v.value).toLowerCase()));
  }

  const r = buildRegex(lookFor);

  return !lookFor.length ? values : values.filter((v) => r.test((v.label ?? v.value).toLowerCase()));
};

const sortByGroup = <T extends Option>(options: T[]) => {
  return [...options].sort((a, b) => {
    if (a.group && b.group) return 0;

    if (a.group && !b.group) return 1;

    return -1;
  });
};

const opt = (
  option: any,
  state: "inactive" | "active" | "selected" | "active-selected" | "submitted" | "cancelled",
) => {
  const label = option.label ?? String(option.value);
  if (state === "active") {
    return `${color.cyan(S_CHECKBOX_ACTIVE)} ${label} ${option.hint ? color.dim(`(${option.hint})`) : ""}`;
  } else if (state === "selected") {
    return `${color.green(S_CHECKBOX_SELECTED)} ${color.dim(label)}`;
  } else if (state === "cancelled") {
    return `${color.strikethrough(color.dim(label))}`;
  } else if (state === "active-selected") {
    return `${color.green(S_CHECKBOX_SELECTED)} ${label} ${option.hint ? color.dim(`(${option.hint})`) : ""}`;
  } else if (state === "submitted") {
    return `${color.dim(label)}`;
  }
  return `${color.dim(S_CHECKBOX_INACTIVE)} ${color.dim(label)}`;
};

interface AutocompleteTextOptions<T extends Option> extends TextOptions {
  options: T[];
  render: (this: Omit<AutocompleteText<T>, "prompt">) => string | void;
}

class AutocompleteText<T extends Option> extends Prompt {
  valueWithCursor = "";
  options: T[];

  get cursor() {
    return this._cursor;
  }

  filteredOptions: T[];
  selected: T[];

  focusIndex: number = 0;

  constructor(opts: AutocompleteTextOptions<T>) {
    super(opts);

    this.options = opts.options;
    this.filteredOptions = opts.options;
    this.selected = [];

    this.customKeyPress = this.customKeyPress.bind(this);

    this.on("finalize", () => {
      if (!this.value) {
        this.value = opts.defaultValue;
      }
      this.valueWithCursor = this.value;
      this.value = this.selected;
    });

    this.on("value", () => {
      const value = this.value as string;
      if (this.cursor >= value.length) {
        this.valueWithCursor = `${value}${color.inverse(color.hidden("_"))}`;
      } else {
        const s1 = value.slice(0, this.cursor);
        const s2 = value.slice(this.cursor);
        this.valueWithCursor = `${s1}${color.inverse(s2)}${s2.slice(1)}`;
      }

      const indexSelector = value.match(/:(\d+)/);
      if (!indexSelector) this.focusIndex = 0;

      const last = value[value.length - 1];
      if (last === ":") {
        const tillSelector = value.slice(0, value.length - 1);

        if (tillSelector.length > 0) {
          this.filteredOptions = sortByGroup(search(this.options, tillSelector));
        } else {
          this.filteredOptions = sortByGroup(this.options);
        }

        return;
      }

      if (indexSelector && indexSelector[1]) {
        const index = Number(indexSelector[1]);

        if (this.filteredOptions.length > 1 && index > this.filteredOptions.length - 1) {
          this.state = "error";
          return;
        }
        this.focusIndex = index;
        return;
      }

      this.filteredOptions = sortByGroup(search(this.options, value.toLowerCase()));
    });

    this.input.on("keypress", this.customKeyPress);
  }

  private customKeyPress(char: string, key?: Key) {
    if (key?.name === "tab") {
      const focusedOption = this.filteredOptions[this.focusIndex];
      const selected = this.selected.find((v) => v?.value === focusedOption?.value) !== undefined;
      if (selected) {
        this.selected = this.selected.filter((v) => v !== focusedOption);
      } else {
        this.selected = this.filteredOptions?.length === 0 ? this.selected : [...this.selected, focusedOption];
      }
      this.rl.clearLine();
    }
  }
}

const highlight = <T extends Option>(option: T) => {
  return color.bgBlack(`${color.white(S_CHECKBOX_INACTIVE)} ${color.white(option.label ?? option.value)}`);
};

const getTerminalSize = () => {
  const stdout = process.stdout.getWindowSize();

  return {
    width: stdout[0],
    height: stdout[1],
  };
};

export const autocomplete = <T extends Option>(opts: Omit<AutocompleteTextOptions<T>, "render">) => {
  return new AutocompleteText({
    options: opts.options,
    message: opts.message,
    validate: opts.validate,
    placeholder: opts.placeholder,
    defaultValue: opts.defaultValue,
    initialValue: opts.initialValue,
    render() {
      const title = `${color.gray(S_BAR)}\n  ${color.bgBlue(color.black(opts.message))}\n`;

      const selected = this.selected.map((option, i) => `${color.red(option.label)}`).join(" ");
      const placeholder = opts.placeholder
        ? color.inverse(opts.placeholder[0]) + color.dim(opts.placeholder.slice(1))
        : color.inverse(color.hidden("_"));

      const value = typeof this.value === "string" ? (!this.value ? placeholder : this.valueWithCursor) : "";

      const textView = "Search: " + value + "\n";

      const noResults = color.red("No results");

      let uniqueGroups = new Set();
      const filteredOptions = this.filteredOptions
        .map((option, i) => {
          const active = i === 0;
          const selected = this.selected.find((v) => v.value === option.value) !== undefined;
          const has = option.group && uniqueGroups.has(option.group);
          if (!has && option.group) {
            uniqueGroups.add(option.group);
          }

          const isFocused = this.focusIndex === i;

          const state = selected ? (active ? "active-selected" : "selected") : active ? "active" : "inactive";

          const spacing = i > 9 ? " " : "  ";

          const groupView = `${
            has || !option.group ? "" : `\n${color.cyan(S_BAR)}${color.bgBlue(color.black(option.group))}`
          } ${!has && option.group ? `\n${color.cyan(S_BAR)}   ` : ""}`;

          return groupView + `${i}:${spacing}` + (isFocused ? highlight(option) : opt(option, state));
        })
        .join(`\n${color.cyan(S_BAR)}  `);

      const options = `${color.cyan(S_BAR)}  ${this.filteredOptions.length ? filteredOptions : noResults}\n${color.cyan(
        S_BAR_END,
      )}\n`;

      return title + `Selected: ${selected}\n` + textView + options;
    },
  }).prompt() as Promise<T[] | symbol>;
};
