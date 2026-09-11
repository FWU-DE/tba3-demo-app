<script setup>
import { computed } from 'vue';

const props = defineProps({
  student: {
    type: Object,
    required: true,
    // { name, gender, bistaScore, emoji, ringColor, zone, competencyLevel, competencyDesc }
  },
});

const ZONE_THEME = {
  'KS I':   { border: '#f97316', bg: '#fff7ed', text: '#c2410c' },
  'KS II':  { border: '#22c55e', bg: '#f0fdf4', text: '#15803d' },
  'KS III': { border: '#14b8a6', bg: '#f0fdfa', text: '#0d9488' },
};

const theme = computed(() => ZONE_THEME[props.student.zone] ?? ZONE_THEME['KS I']);

const genderLabel = computed(() => {
  if (props.student.gender === 'female') return '♀ weiblich';
  if (props.student.gender === 'male')   return '♂ männlich';
  return '⚧ divers';
});
</script>

<template>
  <div class="stu-card">
    <div class="stu-head">
      <div class="stu-av" :style="{ '--c': student.ringColor }">{{ student.emoji }}</div>
      <div class="stu-ident">
        <div class="stu-name">{{ student.name }}</div>
        <div class="stu-gender">{{ genderLabel }}</div>
      </div>
    </div>

    <div class="stu-body">
      <div class="stu-score-block">
        <span class="stu-score-num">{{ student.bistaScore }}</span>
        <span class="stu-score-lbl">BISTA-Punkte</span>
      </div>
      <div
        class="stu-zone-block"
        :style="{ background: theme.bg, borderColor: theme.border, color: theme.text }"
      >
        <span class="stu-zone-id">{{ student.zone }}</span>
        <span class="stu-zone-lbl">{{ student.competencyLevel }}</span>
      </div>
    </div>

    <div v-if="student.competencyDesc" class="stu-desc">{{ student.competencyDesc }}</div>
  </div>
</template>

<style scoped>
.stu-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  width: 230px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.13);
  font-size: 0.82rem;
}

.stu-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.stu-av {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f8fafc;
  border: 3px solid var(--c, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stu-ident { min-width: 0; }

.stu-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stu-gender {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 1px;
}

.stu-body {
  display: flex;
  align-items: stretch;
  gap: 10px;
  margin-bottom: 8px;
}

.stu-score-block {
  display: flex;
  flex-direction: column;
}

.stu-score-num {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stu-score-lbl {
  font-size: 0.67rem;
  color: #94a3b8;
  margin-top: 2px;
}

.stu-zone-block {
  margin-left: auto;
  border: 1.5px solid;
  border-radius: 7px;
  padding: 5px 9px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
}

.stu-zone-id {
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1;
}

.stu-zone-lbl {
  font-size: 0.63rem;
  text-align: right;
  line-height: 1.3;
}

.stu-desc {
  font-size: 0.71rem;
  color: #64748b;
  border-top: 1px solid #f1f5f9;
  padding-top: 7px;
  line-height: 1.45;
}
</style>
