export function isTemplateActive(template) {
  return template?.active !== false
}

export function filterActiveTemplates(templates = []) {
  return templates.filter(isTemplateActive)
}
