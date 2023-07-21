import color from "picocolors";
// Taken from https://github.com/natemoo-re/clack/blob/main/packages/prompts/src/index.ts#L642
const S_STEP_ACTIVE = "◆";
const S_STEP_CANCEL = "■";
const S_STEP_ERROR = "▲";
const S_STEP_SUBMIT = "◇";

const S_BAR_START = "┌";
const S_BAR = "│";
const S_BAR_END = "└";

const S_RADIO_ACTIVE = "●";
const S_RADIO_INACTIVE = "○";
const S_CHECKBOX_ACTIVE = "◻";
const S_CHECKBOX_SELECTED = "◼";
const S_CHECKBOX_INACTIVE = "◻";
const S_PASSWORD_MASK = "▪";

const S_BAR_H = "─";
const S_CORNER_TOP_RIGHT = "╮";
const S_CONNECT_LEFT = "├";
const S_CORNER_BOTTOM_RIGHT = "╯";

const S_INFO = "●";
const S_SUCCESS = "◆";
const S_WARN = "▲";
const S_ERROR = "■";

// Adapted from https://github.com/chalk/ansi-regex
// @see LICENSE
function ansiRegex() {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))",
  ].join("|");

  return new RegExp(pattern, "g");
}

const strip = (str: string) => str.replace(ansiRegex(), "");
const box = (message = "", title = "") => {
  const lines = `\n${message}\n`.split("\n");
  const len =
    Math.max(
      lines.reduce((sum, ln) => {
        ln = strip(ln);
        return ln.length > sum ? ln.length : sum;
      }, 0),
      strip(title).length,
    ) + 2;
  const msg = lines
    .map((ln) => `${color.gray(S_BAR)}  ${color.dim(ln)}${" ".repeat(len - strip(ln).length)}${color.gray(S_BAR)}`)
    .join("\n");
  return `${color.gray(S_BAR)}\n${color.green(S_STEP_SUBMIT)}  ${color.reset(title)} ${color.gray(
    S_BAR_H.repeat(Math.max(len - title.length - 1, 1)) + S_CORNER_TOP_RIGHT,
  )}\n${msg}\n${color.gray(S_CONNECT_LEFT + S_BAR_H.repeat(len + 2) + S_CORNER_BOTTOM_RIGHT)}\n`;
};

export {
  S_CONNECT_LEFT,
  S_CORNER_BOTTOM_RIGHT,
  S_CORNER_TOP_RIGHT,
  S_BAR,
  S_BAR_START,
  S_BAR_END,
  S_BAR_H,
  S_INFO,
  S_ERROR,
  S_WARN,
  S_SUCCESS,
  S_RADIO_ACTIVE,
  S_RADIO_INACTIVE,
  S_PASSWORD_MASK,
  S_CHECKBOX_ACTIVE,
  S_CHECKBOX_INACTIVE,
  S_CHECKBOX_SELECTED,
  S_STEP_ACTIVE,
  S_STEP_ERROR,
  S_STEP_CANCEL,
  S_STEP_SUBMIT,
};

export { strip, box };
