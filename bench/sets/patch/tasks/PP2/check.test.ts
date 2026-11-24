import { describe, expect, it } from "vitest";
import * as mod from "../src/notices";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-notices";

describe("fill, with a fallback after a bar", () => {
    it("uses the value when the field has one, and not the fallback", () => {
        expect(mod.fill("{boat|your boat}", { boat: "Kingfisher" })).toEqual({ text: "Kingfisher", missing: [] });
        expect(mod.fill("Dear {name|customer},", { name: "Priya" })).toEqual({ text: "Dear Priya,", missing: [] });
    });

    it("uses the fallback when the field has no value, and does not list the name as missing", () => {
        expect(mod.fill("{boat|your boat}", {})).toEqual({ text: "your boat", missing: [] });
        expect(mod.fill("Dear {name|customer}, {boat|your boat} is ready.", { ref: "LW-2041" })).toEqual({
            text: "Dear customer, your boat is ready.",
            missing: [],
        });
    });

    it("takes an empty string as a value", () => {
        expect(mod.fill("[{name|customer}]", { name: "" })).toEqual({ text: "[]", missing: [] });
    });

    it("trims the name before the bar", () => {
        expect(mod.fill("{ boat |your boat}", { boat: "Kingfisher" })).toEqual({ text: "Kingfisher", missing: [] });
        expect(mod.fill("{boat   |your boat}", { boat: "Kingfisher" })).toEqual({ text: "Kingfisher", missing: [] });
    });

    it("keeps the fallback exactly as written, spaces and all", () => {
        expect(mod.fill("[{boat|  your boat }]", {})).toEqual({ text: "[  your boat ]", missing: [] });
        expect(mod.fill("[{ boat | }]", {})).toEqual({ text: "[ ]", missing: [] });
        expect(mod.fill("[{boat|your\nboat}]", {})).toEqual({ text: "[your\nboat]", missing: [] });
        expect(mod.fill("[{boat|\tx}]", {})).toEqual({ text: "[\tx]", missing: [] });
    });

    it("keeps an opening brace in the fallback as text, doubled or not", () => {
        expect(mod.fill("{a|x{{y}", {})).toEqual({ text: "x{{y", missing: [] });
        expect(mod.fill("{a|{x}", {})).toEqual({ text: "{x", missing: [] });
    });

    it("puts the fallback in as it is written, even when it is the name of a field", () => {
        expect(mod.fill("Dear {nickname|name},", { name: "Ann" })).toEqual({ text: "Dear name,", missing: [] });
    });

    it("looks up only the name before the bar, never the whole of what is in the braces", () => {
        expect(mod.fill("{boat|your boat}", { "boat|your boat": "X" })).toEqual({ text: "your boat", missing: [] });
        expect(mod.fill("{way|email}", { "way|email": "x" })).toEqual({ text: "email", missing: [] });
    });

    it("takes an empty name before the bar as a name, as empty braces are", () => {
        expect(mod.fill("{|none}", {})).toEqual({ text: "none", missing: [] });
        expect(mod.fill("{ |none}", { "": "v" })).toEqual({ text: "v", missing: [] });
    });

    it("takes an empty fallback", () => {
        expect(mod.fill("a{note|}b", {})).toEqual({ text: "ab", missing: [] });
        expect(mod.fill("a{note|}b", { note: "!" })).toEqual({ text: "a!b", missing: [] });
    });

    it("splits at the first bar, so a fallback may hold more bars", () => {
        expect(mod.fill("{way|email|post|text}", {})).toEqual({ text: "email|post|text", missing: [] });
        expect(mod.fill("{way||}", {})).toEqual({ text: "|", missing: [] });
        expect(mod.fill("{way|email|post|text}", { way: "pigeon" })).toEqual({ text: "pigeon", missing: [] });
        expect(mod.fill("{way|email|post|text}", { "way|email|post": "x", "way|email": "y" })).toEqual({
            text: "email|post|text",
            missing: [],
        });
    });

    it("still lists a field written without a bar, and leaves it in the text", () => {
        expect(mod.fill("{a|-} {b} {a} {b|+} {c}", { c: "x" })).toEqual({
            text: "- {b} {a} + x",
            missing: ["b", "a"],
        });
    });

    it("puts the fallback in every place it is written, each with its own", () => {
        expect(mod.fill("{a|one} {a|two} {a|one}", {})).toEqual({ text: "one two one", missing: [] });
    });

    it("counts only a field that was given, as before", () => {
        expect(mod.fill("{toString|none} {constructor|none}", {})).toEqual({ text: "none none", missing: [] });
    });

    it("leaves doubled braces and a brace never closed as they were", () => {
        expect(mod.fill("{{boat|x}} {boat|x} {name|y", {})).toEqual({ text: "{boat|x} x {name|y", missing: [] });
        expect(mod.fill("a | b {{|}} c", {})).toEqual({ text: "a | b {|} c", missing: [] });
    });

    it("does not change the fields it is given", () => {
        const fields = { boat: "Kingfisher", name: "" };
        const before = copyOf(fields);
        mod.fill("{boat|a} {name|b} {ref|c} {end}", fields);
        expect(fields).toEqual(before);
    });
});

unchanged(mod, ["fill: a bar inside the braces is part of the name"]);
