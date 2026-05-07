import { createRouter, createWebHashHistory } from 'vue-router';
import IndexView from '../views/IndexView.vue';
import PercentileBandView from '../views/PercentileBandView.vue';
import CompetenceLevelsView from '../views/CompetenceLevelsView.vue';
import ItemSolutionTableView from '../views/ItemSolutionTableView.vue';
import CompetencyOverviewView from '../views/CompetencyOverviewView.vue';
import StudentScatterView from '../views/StudentScatterView.vue';
import BistaDistributionView from '../views/BistaDistributionView.vue';
import StudentSolutionTableView from '../views/StudentSolutionTableView.vue';
import MeanComparisonView from '../views/MeanComparisonView.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: IndexView },
    { path: '/percentile-band', component: PercentileBandView },
    { path: '/competence-levels', component: CompetenceLevelsView },
    { path: '/item-solution-table', component: ItemSolutionTableView },
    { path: '/competency-overview', component: CompetencyOverviewView },
    { path: '/student-scatter', component: StudentScatterView },
    { path: '/bista-distribution', component: BistaDistributionView },
    { path: '/student-solution-table', component: StudentSolutionTableView },
    { path: '/mean-comparison', component: MeanComparisonView },
  ],
});
