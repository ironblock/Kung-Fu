import { marked } from 'marked'; // @T01
import hljs from 'highlight.js'; // @T01

marked.setOptions({
  highlight: (code, language) => hljs.highlight(code, { language }).value,
});
