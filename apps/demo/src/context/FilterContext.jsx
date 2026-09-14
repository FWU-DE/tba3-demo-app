import { useState, useEffect } from 'react';
import { GROUPS } from '../utils/constants';
import { FilterContext } from './filterKontext';

// Die Parameter, die dieser Kontext in der Adresszeile führt. Alles andere
// dort gehört jemand anderem und bleibt unangetastet.
const EIGENE_PARAMETER = [
  'level',
  'group',
  'school',
  'state',
  'subject',
  'grade',
  'type',
  'gender',
  'languageAtHome',
  'comparison',
  'districtComparison',
];

// Helper to get initial value from URL or default
const getUrlParam = (param, defaultValue) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(param) || defaultValue;
};

export const FilterProvider = ({ children }) => {
  const [selectedLevel, setSelectedLevel] = useState(getUrlParam('level', 'group')); // 'group', 'school', 'state'
  const [selectedGroup, setSelectedGroup] = useState(getUrlParam('group', GROUPS[0].id));
  const [selectedSchool, setSelectedSchool] = useState(getUrlParam('school', 'gs-musterstadt'));
  const [selectedState, setSelectedState] = useState(getUrlParam('state', 'beispielland'));
  const [selectedSubject, setSelectedSubject] = useState(getUrlParam('subject', null)); // null = all
  const [selectedGrade, setSelectedGrade] = useState(getUrlParam('grade', null)); // null = all
  const [typeParam, setTypeParam] = useState(getUrlParam('type', 'both')); // 'group', 'students', 'both'
  const [demographicFilters, setDemographicFilters] = useState({
    gender: getUrlParam('gender', null), // null = all
    languageAtHome: getUrlParam('languageAtHome', null), // null = all
  });
  const [comparisonEnabled, setComparisonEnabled] = useState(getUrlParam('comparison', 'false') === 'true');
  const [districtComparison, setDistrictComparison] = useState(getUrlParam('districtComparison', 'false') === 'true');
  const [observerMode, setObserverMode] = useState(false);

  // Update URL when filters change
  //
  // Die Filter sind nicht die einzigen Parameter in der Adresszeile: `lang`
  // steht dort auch, und die gemeinsame Leiste liest es von dort. Deshalb von
  // den vorhandenen Parametern ausgehen und nur die eigenen austauschen — ein
  // frisches URLSearchParams() würde alles Fremde wegwerfen. Die Leiste wird
  // zur Laufzeit nachgeladen und käme dann zu spät: `?lang=de` wäre weg, sie
  // fiele auf die Browsersprache zurück und stünde in der anderen Sprache da
  // als der Inhalt daneben.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    EIGENE_PARAMETER.forEach((schluessel) => params.delete(schluessel));

    params.set('level', selectedLevel);

    if (selectedLevel === 'group') params.set('group', selectedGroup);
    if (selectedLevel === 'school') params.set('school', selectedSchool);
    if (selectedLevel === 'state') params.set('state', selectedState);

    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedGrade) params.set('grade', selectedGrade);
    if (typeParam !== 'both') params.set('type', typeParam);
    if (demographicFilters.gender) params.set('gender', demographicFilters.gender);
    if (demographicFilters.languageAtHome) params.set('languageAtHome', demographicFilters.languageAtHome);
    if (comparisonEnabled) params.set('comparison', 'true');
    if (districtComparison) params.set('districtComparison', 'true');

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedLevel, selectedGroup, selectedSchool, selectedState, selectedSubject, selectedGrade, typeParam, demographicFilters, comparisonEnabled, districtComparison]);

  const getSelectedId = () => {
    switch (selectedLevel) {
      case 'group':
        return selectedGroup;
      case 'school':
        return selectedSchool;
      case 'state':
        return selectedState;
      default:
        return selectedGroup;
    }
  };

  const buildQueryParams = () => {
    // District comparison mode overrides the regular type param
    if (selectedLevel === 'state' && districtComparison) {
      return { type: 'state,district' };
    }

    // Map 'both' to the API-expected 'group,students' value
    const apiType = typeParam === 'both' ? 'group,students' : typeParam;
    const params = { type: apiType };

    if (demographicFilters.gender) {
      params.gender = demographicFilters.gender;
    }

    if (demographicFilters.languageAtHome) {
      params.languageAtHome = demographicFilters.languageAtHome;
    }

    return params;
  };

  const value = {
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
    demographicFilters,
    setDemographicFilters,
    comparisonEnabled,
    setComparisonEnabled,
    districtComparison,
    setDistrictComparison,
    observerMode,
    setObserverMode,
    getSelectedId,
    buildQueryParams,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
