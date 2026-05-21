import { useState, useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { useCompetenceLevels } from '../../hooks/useCompetenceLevels';
import { transformCompetenceLevels, calculateSummaryStats } from '../../utils/dataTransformers';
import CompetenceLevelsChart from '../charts/CompetenceLevelsChart';
import ItemStatisticsChart from '../charts/ItemStatisticsChart';
import AggregationsView from '../charts/AggregationsView';
import EducationalMaterialsPanel from '../charts/EducationalMaterialsPanel';
import StudentsPanel from '../charts/StudentsPanel';
import CompetenceDeltaView from '../charts/CompetenceDeltaView';
import HelpView from '../HelpView';
import StudentDetailView from '../common/StudentDetailView';
import CompetencyOverviewCards from '../charts/CompetencyOverviewCards';
import { getStudentById } from '../../utils/studentData';

const Dashboard = () => {
  const { selectedLevel, getSelectedId, buildQueryParams } = useFilters();
  const { data: competenceData } = useCompetenceLevels(selectedLevel, getSelectedId(), buildQueryParams());
  const overviewChartData = competenceData ? transformCompetenceLevels(competenceData) : null;
  const overviewStats = competenceData ? calculateSummaryStats(competenceData) : null;

  // Get initial tab from URL
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'competence';
  };

  const getInitialStudentId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('student') || null;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [activeStudentId, setActiveStudentId] = useState(getInitialStudentId);

  // Update URL when tab or student changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    if (activeStudentId) {
      params.set('student', activeStudentId);
    } else {
      params.delete('student');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeTab, activeStudentId]);

  const openStudent = (studentId) => {
    setActiveTab('students');
    setActiveStudentId(studentId);
  };

  const closeStudent = () => {
    setActiveStudentId(null);
  };

  const tabs = [
    { id: 'competence', label: 'Kompetenzstufen', icon: '📊' },
    { id: 'delta', label: 'Vergleichsauswertung', icon: '⇄' },
    { id: 'items', label: 'Item-Statistiken', icon: '📈' },
    { id: 'aggregations', label: 'Aggregationen', icon: '📉' },
    { id: 'students', label: 'Schüler*innen', icon: '👥' },
    { id: 'materials', label: 'Lernmaterialien', icon: '📚' },
    { id: 'help', label: 'Hilfe', icon: '📖' },
  ];

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Overview cards — always visible at the top */}
        <CompetencyOverviewCards chartData={overviewChartData} stats={overviewStats} />

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setActiveStudentId(null); }}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'competence' && (
            <CompetenceLevelsChart level={selectedLevel} id={getSelectedId()} />
          )}

          {activeTab === 'delta' && (
            <CompetenceDeltaView />
          )}

          {activeTab === 'items' && (
            <ItemStatisticsChart level={selectedLevel} id={getSelectedId()} />
          )}

          {activeTab === 'aggregations' && (
            <AggregationsView level={selectedLevel} id={getSelectedId()} />
          )}

          {activeTab === 'students' && (() => {
            const student = activeStudentId ? getStudentById(activeStudentId) : null;
            if (student) {
              return (
                <StudentDetailView
                  student={student}
                  onBack={closeStudent}
                />
              );
            }
            return (
              <StudentsPanel
                onNavigateMaterials={(groupId) => {
                  setActiveTab('materials');
                  setActiveStudentId(null);
                  sessionStorage.setItem('tba3_navigate_custom_group', groupId);
                }}
                onOpenStudent={openStudent}
              />
            );
          })()}

          {activeTab === 'materials' && (
            <EducationalMaterialsPanel />
          )}

          {activeTab === 'help' && (
            <HelpView />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
