// Die wenigen Regeln, die die Bausteine um ihr SVG herum brauchen.
//
// Als Zeichenkette statt als .css-Datei: das Custom Element schiebt sie in sein
// Shadow DOM, wo ein <link> einen zweiten Ladevorgang bedeuten würde, und die
// Vue- und React-Adapter sollen ohne CSS-fähigen Bundler benutzbar bleiben.

export const STIL = `
.tba3-figur { margin: 0; }
.tba3-titel {
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
  font-family: system-ui, sans-serif;
}
.tba3-domain { font-weight: 400; color: #64748b; font-size: 0.9rem; }
.tba3-scroll { overflow-x: auto; }
.tba3-scroll svg { display: block; }
`.trim();

export default STIL;
