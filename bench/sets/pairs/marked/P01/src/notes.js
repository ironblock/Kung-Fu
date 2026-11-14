import { // @T01
  readdir,
  readFile,
} from 'node:fs/promises';
import * as yaml from 'yaml'; // @T01

const FRONT_MATTER = /^---\n([\s\S]*?)\n---\n/;

export function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
}

function parse(text) {
  const found = FRONT_MATTER.exec(text);
  const meta = found ? yaml.parse(found[1]) : {};
  const body = found ? text.slice(found[0].length) : text;
  return { ...meta, body, slug: slugify(meta.title ?? 'untitled') };
}

export async function loadNotes(dir) {
  const names = await readdir(dir);
  const texts = await Promise.all(
    names
      .filter((name) => name.endsWith('.md'))
      .map((name) => readFile(`${dir}/${name}`, 'utf8')),
  );
  return texts.map(parse);
}
