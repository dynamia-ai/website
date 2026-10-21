/* Text-only localization: DOM structure, route keys and filter values stay stable. */
export function makeLocalizer(catalog, document) {
  const messages = new Map(catalog?.translations || []);
  const translate = value => {
    if (!value || !catalog) return value;
    if (messages.has(value)) return messages.get(value);
    const trimmed = value.trim();
    if (messages.has(trimmed)) return value.replace(trimmed,messages.get(trimmed));
    const count = trimmed.match(/^(\d+)\s*(篇文章|场活动|个设备|项)$/);
    if (count && messages.has(count[2])) return count[1]+' '+messages.get(count[2]);
    return value;
  };
  const markup = html => {
    if (!catalog) return html;
    const template = document.createElement('template');
    template.innerHTML=html;
    function walk(node) {
      if(node.nodeType===3) node.textContent=translate(node.textContent);
      if(node.nodeType===1) {
        if(['SCRIPT','STYLE','CODE','PRE'].includes(node.tagName))return;
        for(const attr of ['alt','title','placeholder','aria-label']) if(node.hasAttribute(attr))node.setAttribute(attr,translate(node.getAttribute(attr)));
        if(node.tagName==='IMG') {
          const src=node.getAttribute('src');
          const replacement=catalog.assets?.[src];
          if(replacement)node.setAttribute('src',replacement);
        }
      }
      for(const child of [...node.childNodes])walk(child);
    }
    walk(template.content);
    return template.innerHTML;
  };
  return {translate,markup};
}
