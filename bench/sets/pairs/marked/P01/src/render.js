import { marked } from "marked"; // @T01
import escape from "lodash.escape"; // @T01
import { slugify } from "./notes.js"; // @T02
import site from "../site.config.js";

const page = (title, body) => [
  "<!doctype html>",
  `<title>${escape(title)} - ${escape(site.name)}</title>`,
  `<main>${body}</main>`,
].join("\n");

export function renderPage(note) {
  return page(note.title, marked.parse(note.body));
}

export function renderIndex(notes) {
  const links = notes.map(
    (note) => `<li><a href="${note.slug}.html">${escape(note.title)}</a></li>`,
  );
  return page("Notes", `<ul id="${slugify(site.name)}">${links.join("")}</ul>`);
}
