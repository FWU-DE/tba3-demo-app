import HtmlText from '../../i18n/HtmlText';

/**
 * Sagt in einem Satz, was diese Anwendung ist und was nicht: ein technischer
 * Demonstrator der Auswertungsschnittstelle, keine mit Lehrkräften erprobte
 * Rückmeldung. Die Abgrenzung gegen /beispiele ist der Punkt — dort stehen die
 * Rückmeldungen des Konsortiums, die genau das sind.
 *
 * Steht unter dem Kopf und nicht in der Hilfe: wer die Demo vorgeführt bekommt,
 * schlägt die Hilfe nicht auf. Aus demselben Grund ohne Schließen-Knopf.
 */
const DemoHinweis = () => (
  <div
    data-testid="demo-hinweis"
    role="note"
    className="bg-amber-50 border-b border-amber-200"
  >
    <div className="px-4 lg:px-6 py-3 flex items-start gap-3">
      <span aria-hidden="true" className="text-base leading-6 text-amber-600">
        ⚠
      </span>
      <HtmlText
        pfad="hinweis.text"
        className="text-sm leading-relaxed text-amber-900 max-w-5xl"
      />
    </div>
  </div>
);

export default DemoHinweis;
