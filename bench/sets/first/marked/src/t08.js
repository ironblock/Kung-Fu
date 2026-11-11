import theme from "./palette.js"; // @T08
import { primary, accent } from "./palette.js"; // @T08
import * as tones from "./palette.js"; // @T08
import "./palette.js"; // @T08
import base, { muted as soft } from "./palette.js"; // @T08
import { // @T08
  warm,
  cool,
} from "./palette.js";

import plural from "./palettes.js";
import data from "./palette.json";
import view from "./palette.jsx";
import bare from "./palette";
import upper from "../palette.js";
import deep from "./lib/palette.js";
import pkg from "palette.js";
import "./palettes.js";

const viaRequire = require("./palette.js");
const text = "./palette.js";
const lazy = () => import("./palette.js");

export { primary as main } from "./palette.js";
export * from "./palette.js";

console.log(theme, primary, accent, tones, base, soft, warm, cool);
console.log(plural, data, view, bare, upper, deep, pkg, viaRequire, text, lazy);
