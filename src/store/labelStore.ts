import { create } from 'zustand';
import { YoloLabel, Category, ProjectData } from '@/lib/types';

interface HistoryState {
  labels: YoloLabel[];
}

interface LabelStore {
  // Project data
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  updateCategoryColor: (id: number, color: string) => void;

  // Current image
  currentImageName: string | null;
  currentImageData: string | null;
  setCurrentImage: (name: string | null, data: string | null) => void;

  // Root path for the current dataset
  rootPath: string | null;
  setRootPath: (path: string | null) => void;

  // Labels for current image
  labels: YoloLabel[];
  setLabels: (labels: YoloLabel[]) => void;

  // Selected labels
  selectedLabelIds: string[];
  setSelectedLabelIds: (ids: string[]) => void;

  // History for undo/redo
  history: HistoryState[];
  historyIndex: number;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Label operations
  addLabel: (label: YoloLabel) => void;
  updateLabel: (id: string, updates: Partial<YoloLabel>) => void;
  deleteLabel: (id: string) => void;

  // Project data
  projectData: ProjectData | null;
  setProjectData: (data: ProjectData | null) => void;

  // Label file path for saving
  currentLabelFilePath: string | null;
  setCurrentLabelFilePath: (path: string | null) => void;

  // Modified state
  isModified: boolean;
  setIsModified: (modified: boolean) => void;

  // Auto-save state
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;

  // Reset store
  reset: () => void;
}

const MAX_HISTORY = 50;

export const useLabelStore = create<LabelStore>((set, get) => ({
  // Categories
  categories: [],
  setCategories: (categories) => set({ categories }),
  updateCategoryColor: (id, color) => set((state) => ({
    categories: state.categories.map((c) => (c.id === id ? { ...c, color } : c)),
  })),

  // Current image
  currentImageName: null,
  currentImageData: null,
  setCurrentImage: (name, data) => set({
    currentImageName: name,
    currentImageData: data,
    history: [],
    historyIndex: -1,
    isModified: false,
  }),

  // Root path
  rootPath: null,
  setRootPath: (path) => set({ rootPath: path }),

  // Labels
  labels: [],
  setLabels: (labels) => {
    set({ labels });
    get().saveToHistory();
  },

  // Selected labels
  selectedLabelIds: [],
  setSelectedLabelIds: (ids) => set({ selectedLabelIds: ids }),

  // History
  history: [],
  historyIndex: -1,

  saveToHistory: () => {
    const { labels, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ labels: JSON.parse(JSON.stringify(labels)) });

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isModified: true,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        labels: JSON.parse(JSON.stringify(history[newIndex].labels)),
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        labels: JSON.parse(JSON.stringify(history[newIndex].labels)),
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Label operations
  addLabel: (label) => {
    const { labels } = get();
    set({ labels: [...labels, label] });
    get().saveToHistory();
  },

  updateLabel: (id, updates) => {
    const { labels } = get();
    set({
      labels: labels.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    });
    // Don't save to history on every update (will save on mouse up)
  },

  deleteLabel: (id) => {
    const { labels, selectedLabelIds } = get();
    set({
      labels: labels.filter((l) => l.id !== id),
      selectedLabelIds: selectedLabelIds.filter((selectedId) => selectedId !== id),
    });
    get().saveToHistory();
  },

  // Project data
  projectData: null,
  setProjectData: (data) => set({ projectData: data }),

  // Label file path
  currentLabelFilePath: null,
  setCurrentLabelFilePath: (path) => set({ currentLabelFilePath: path }),

  // Modified state
  isModified: false,
  setIsModified: (modified) => set({ isModified: modified }),

  // Auto-save
  autoSave: true,
  setAutoSave: (enabled: boolean) => set({ autoSave: enabled }),

  // Reset
  reset: () => set({
    categories: [],
    currentImageName: null,
    currentImageData: null,
    labels: [],
    selectedLabelIds: [],
    history: [],
    historyIndex: -1,
    projectData: null,
    currentLabelFilePath: null,
    rootPath: null,
    isModified: false,
    autoSave: true,
  }),
}));
