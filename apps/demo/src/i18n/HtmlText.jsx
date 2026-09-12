import { useTexte } from './index.js';

/**
 * Für Texte, in denen Auszeichnungen stecken (<strong>, <code>, <br />).
 * Die Übersetzung bringt das Markup mit, statt den Satz in Bruchstücke zu
 * zerlegen, die sich in keiner zweiten Sprache sinnvoll zusammensetzen lassen.
 * Der Inhalt kommt aus `texte.js` — eigener Text, keine Eingabe von außen.
 */
const HtmlText = ({ pfad, werte, als = 'p', className = '', ...rest }) => {
  const t = useTexte();
  const Tag = als;
  return (
    <Tag
      className={`reichtext ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: t(pfad, werte) }}
      {...rest}
    />
  );
};

export default HtmlText;
