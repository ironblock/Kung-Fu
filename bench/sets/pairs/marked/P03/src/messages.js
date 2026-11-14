const templates = {
  email: '%s must be an email address',
  url: '%s must be a link',
};

function fromTemplate(kind) {
  return templates[kind];
}

export function message(kind) {
  return fromTemplate(kind) ?? '%s is not valid';
}

export {
  templates,
  fromTemplate,
};
