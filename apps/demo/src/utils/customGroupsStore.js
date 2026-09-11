const STORAGE_KEY = 'tba3_custom_groups';

export const loadCustomGroups = () => {
  try {
    const groups = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Repair duplicate IDs caused by Date.now() collisions
    const seenIds = new Set();
    let needsSave = false;
    const repaired = groups.map((g) => {
      if (seenIds.has(g.id)) {
        needsSave = true;
        return { ...g, id: `cg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
      }
      seenIds.add(g.id);
      return g;
    });
    if (needsSave) localStorage.setItem(STORAGE_KEY, JSON.stringify(repaired));
    return repaired;
  } catch {
    return [];
  }
};

export const saveCustomGroups = (groups) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

export const createCustomGroup = (groups, name) => {
  const next = [
    ...groups,
    {
      id: `cg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      studentIds: [],
      createdAt: new Date().toISOString(),
    },
  ];
  saveCustomGroups(next);
  return next;
};

export const addStudentsToGroup = (groups, groupId, studentIds) => {
  const next = groups.map((g) =>
    g.id === groupId
      ? { ...g, studentIds: [...new Set([...g.studentIds, ...studentIds])] }
      : g
  );
  saveCustomGroups(next);
  return next;
};

export const removeStudentFromGroup = (groups, groupId, studentId) => {
  const next = groups.map((g) =>
    g.id === groupId
      ? { ...g, studentIds: g.studentIds.filter((id) => id !== studentId) }
      : g
  );
  saveCustomGroups(next);
  return next;
};

export const deleteCustomGroup = (groups, groupId) => {
  const next = groups.filter((g) => g.id !== groupId);
  saveCustomGroups(next);
  return next;
};

export const setGroupMembers = (groups, groupId, studentIds) => {
  const next = groups.map((g) =>
    g.id === groupId ? { ...g, studentIds: [...new Set(studentIds)] } : g
  );
  saveCustomGroups(next);
  return next;
};

export const renameCustomGroup = (groups, groupId, name) => {
  const next = groups.map((g) =>
    g.id === groupId ? { ...g, name: name.trim() } : g
  );
  saveCustomGroups(next);
  return next;
};
