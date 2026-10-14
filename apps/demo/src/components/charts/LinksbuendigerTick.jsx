import { Text } from 'recharts';

// Beschriftungen einer Kategorienachse links bündig, wie in den Bausteinen.
// Recharts setzt den Tick an die Achse und richtet rechtsbündig aus; hier
// beginnt der Text am linken Rand der Achsenfläche. `breite` ist die `width`
// der YAxis — der Tick kennt nur seinen eigenen Punkt, nicht die Fläche.
// Lange Namen brechen innerhalb der Breite um, statt in die Balken zu laufen.
//
// Auf Modulebene, nicht im Render: Recharts hängt eine im Render definierte
// Komponente bei jedem Durchlauf neu ein.
const ABSTAND_ZUR_ACHSE = 8; // tickSize 6 + tickMargin 2, so setzt Recharts den Punkt

export const linksbuendigerTick = (breite) => {
  function LinksbuendigerTick({ x, y, payload }) {
    return (
      <Text
        x={x - breite + ABSTAND_ZUR_ACHSE + 2}
        y={y}
        width={breite - ABSTAND_ZUR_ACHSE - 6}
        textAnchor="start"
        verticalAnchor="middle"
        fontSize={11}
        fill="#6b7280"
      >
        {payload.value}
      </Text>
    );
  }
  return LinksbuendigerTick;
};
