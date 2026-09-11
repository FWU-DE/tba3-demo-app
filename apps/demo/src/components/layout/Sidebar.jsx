import { useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { GROUPS, SCHOOLS, STATES, SUBJECTS, GRADES, TYPE_OPTIONS } from '../../utils/constants';

const Sidebar = () => {
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

  return (
    <aside className="w-80 bg-gray-900 text-white min-h-screen p-6">
      <div className="space-y-6">
        {/* Level Selector */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Ebene
          </h3>
          <div className="space-y-2">
            {[
              { value: 'group', label: 'Gruppe' },
              { value: 'school', label: 'Schule' },
              { value: 'state', label: 'Bundesland' },
            ].map((level) => (
              <button
                key={level.value}
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
            {selectedLevel === 'group' && 'Gruppe'}
            {selectedLevel === 'school' && 'Schule'}
            {selectedLevel === 'state' && 'Bundesland'}
          </h3>

          {selectedLevel === 'group' && (
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {filteredGroups.length === 0 ? (
                <option value="">Keine Gruppen verfügbar</option>
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
            Fach
          </h3>
          <select
            value={selectedSubject || ''}
            onChange={(e) => setSelectedSubject(e.target.value || null)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Alle Fächer</option>
            {Object.values(SUBJECTS).map((subject) => (
              <option key={subject.code} value={subject.code}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Klassenstufe
          </h3>
          <select
            value={selectedGrade || ''}
            onChange={(e) => setSelectedGrade(e.target.value || null)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Alle Klassenstufen</option>
            {Object.values(GRADES).map((grade) => (
              <option key={grade.code} value={grade.code}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Parameter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Datentyp
          </h3>
          <select
            value={typeParam}
            onChange={(e) => setTypeParam(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info Section */}
        <div className="pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            TBA3 Demonstration App
            <br />
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
