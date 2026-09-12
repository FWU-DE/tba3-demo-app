import { useState, useEffect } from 'react';
import { useFilters } from '../../context/useFilters';
import { GROUPS, SCHOOLS, STATES, SUBJECTS, GRADES, TYPE_VALUES } from '../../utils/constants';
import { useTexte } from '../../i18n';

const Sidebar = () => {
  const t = useTexte();
  const {
    selectedLevel,
    setSelectedLevel,
    selectedGroup,
    setSelectedGroup,
    selectedSchool,
    setSelectedSchool,
    selectedState,
    setSelectedState,
    selectedSubject,
    setSelectedSubject,
    selectedGrade,
    setSelectedGrade,
    typeParam,
    setTypeParam,
  } = useFilters();

  // Only show groups that match the active subject/grade filters
  const filteredGroups = GROUPS.filter((g) => {
    if (selectedSubject && g.subject !== selectedSubject) return false;
    if (selectedGrade && g.grade !== selectedGrade) return false;
    return true;
  });

  // Auto-correct group selection when it no longer matches the filter
  useEffect(() => {
    if (
      selectedLevel === 'group' &&
      filteredGroups.length > 0 &&
      !filteredGroups.find((g) => g.id === selectedGroup)
    ) {
      setSelectedGroup(filteredGroups[0].id);
    }
  }, [selectedSubject, selectedGrade, selectedLevel]); // eslint-disable-line

  // Unter 1024 px stünde die 320 px breite Leiste dem Inhalt im Weg — dort wird
  // sie zu einem aufklappbaren Block über dem Dashboard.
  const [filterOffen, setFilterOffen] = useState(false);

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-gray-900 text-white lg:min-h-screen p-4 lg:p-6">
      <button
        type="button"
        data-testid="filter-umschalter"
        aria-expanded={filterOffen}
        aria-controls="filterbereich"
        onClick={() => setFilterOffen((offen) => !offen)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-2 mb-4 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
      >
        <span className="font-medium">{t('seitenleiste.filter')}</span>
        <span aria-hidden="true">{filterOffen ? '▲' : '▼'}</span>
      </button>

      <div
        id="filterbereich"
        className={`space-y-6 ${filterOffen ? '' : 'hidden'} lg:block`}
      >
        {/* Level Selector */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t('seitenleiste.ebene')}
          </h3>
          <div className="space-y-2">
            {[
              { value: 'group', label: t('seitenleiste.gruppe') },
              { value: 'school', label: t('seitenleiste.schule') },
              { value: 'state', label: t('seitenleiste.bundesland') },
            ].map((level) => (
              <button
                key={level.value}
                data-testid={`ebene-${level.value}`}
                aria-pressed={selectedLevel === level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedLevel === level.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entity Selector */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {selectedLevel === 'group' && t('seitenleiste.gruppe')}
            {selectedLevel === 'school' && t('seitenleiste.schule')}
            {selectedLevel === 'state' && t('seitenleiste.bundesland')}
          </h3>

          {selectedLevel === 'group' && (
            <select
              data-testid="auswahl-gruppe"
              aria-label={t('seitenleiste.lerngruppe')}
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {filteredGroups.length === 0 ? (
                <option value="">{t('seitenleiste.keineGruppen')}</option>
              ) : (
                filteredGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))
              )}
            </select>
          )}

          {selectedLevel === 'school' && (
            <select
              data-testid="auswahl-schule"
              aria-label={t('seitenleiste.schule')}
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SCHOOLS.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          )}

          {selectedLevel === 'state' && (
            <select
              data-testid="auswahl-bundesland"
              aria-label={t('seitenleiste.bundesland')}
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATES.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Subject Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t('seitenleiste.fach')}
          </h3>
          <select
            data-testid="auswahl-fach"
            aria-label={t('seitenleiste.fach')}
            value={selectedSubject || ''}
            onChange={(e) => setSelectedSubject(e.target.value || null)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('seitenleiste.alleFaecher')}</option>
            {Object.values(SUBJECTS).map((subject) => (
              <option key={subject.code} value={subject.code}>
                {t(`faecher.${subject.code}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t('seitenleiste.klassenstufe')}
          </h3>
          <select
            data-testid="auswahl-klassenstufe"
            aria-label={t('seitenleiste.klassenstufe')}
            value={selectedGrade || ''}
            onChange={(e) => setSelectedGrade(e.target.value || null)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('seitenleiste.alleKlassenstufen')}</option>
            {Object.values(GRADES).map((grade) => (
              <option key={grade.code} value={grade.code}>
                {t(`klassenstufen.${grade.code}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Type Parameter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t('seitenleiste.datentyp')}
          </h3>
          <select
            data-testid="auswahl-datentyp"
            aria-label={t('seitenleiste.datentyp')}
            value={typeParam}
            onChange={(e) => setTypeParam(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {TYPE_VALUES.map((wert) => (
              <option key={wert} value={wert}>
                {t(`datentypen.${wert}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Info Section */}
        <div className="pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            {t('seitenleiste.fuss')}
            <br />
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
