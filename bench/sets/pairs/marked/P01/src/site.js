import 'dotenv/config'; // @T01
import fs from 'node:fs'; // @T01
import './markdown.js'; // @T02
import { loadNotes } from './notes.js'; // @T02
import { // @T02
  renderIndex,
  renderPage,
} from './render.js';

const OUT_DIR = './public';

function write(name, html) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(`${OUT_DIR}/${name}`, html);
}

export async function build(sourceDir = process.env.NOTES_DIR) {
  const notes = await loadNotes(sourceDir);
  for (const note of notes) {
    write(`${note.slug}.html`, renderPage(note));
  }
  write('index.html', renderIndex(notes));
  return notes.length;
}

export { renderPage } from './render.js';
export * from './notes.js';
export { marked } from 'marked';
