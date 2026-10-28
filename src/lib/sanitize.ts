// Saneador de HTML del LLM: allowlist estricta (sin scripts ni eventos).
const TAGS = new Set([
  'H2', 'H3', 'H4', 'P', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'BLOCKQUOTE', 'CODE', 'SPAN', 'DIV',
  'BR', 'HR', 'FIGURE', 'FIGCAPTION', 'IMG', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'A',
  'SUP', 'SUB',
]);

const CLASES = new Set(['rl-callout', 'rl-concept', 'rl-note', 'rl-quote', 'rl-img']);

export function sanitizarHTML(html: string): string {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html || '');

  const walk = (node: Node): void => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 3) return; // texto
      if (child.nodeType !== 1) {
        node.removeChild(child);
        return;
      }
      const el = child as HTMLElement;
      if (!TAGS.has(el.tagName)) {
        el.replaceWith(...Array.from(el.childNodes));
        walk(node);
        return;
      }
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (name === 'class') {
          const ok = attr.value.split(/\s+/).filter(Boolean).every((c) => CLASES.has(c));
          if (!ok) el.removeAttribute('class');
        } else if (name === 'href') {
          if (!/^https?:\/\//i.test(attr.value)) el.removeAttribute('href');
          else {
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
          }
        } else if (name === 'src') {
          if (!/^https:\/\//i.test(attr.value)) el.removeAttribute('src');
        } else if (['alt', 'title', 'colspan', 'rowspan', 'width', 'height'].includes(name)) {
          // permitidos
        } else {
          el.removeAttribute(attr.name);
        }
      });
      walk(el);
    });
  };

  walk(tpl.content);
  return tpl.innerHTML;
}

// Oculta imágenes rotas y las hace lazy (se ejecuta después de renderizar).
export function arreglarImagenes(root: HTMLElement | null): void {
  if (!root) return;
  root.querySelectorAll('img').forEach((img) => {
    img.loading = 'lazy';
    img.onerror = () => {
      img.style.display = 'none';
    };
  });
}
