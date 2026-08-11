import { create } from "zustand";
import type { District, MineralType, QuarryStatus } from "../types/common";

export interface DateRange {
  from: string | null; // ISO date
  to: string | null; // ISO date
}

export interface DashboardFilters {
  districts: District[];
  mineralTypes: MineralType[];
  statuses: QuarryStatus[];
  licenseExpiryRange: DateRange;
  lastInspectionRange: DateRange;
}

export const EMPTY_FILTERS: DashboardFilters = {
  districts: [],
  mineralTypes: [],
  statuses: [],
  licenseExpiryRange: { from: null, to: null },
  lastInspectionRange: { from: null, to: null },
};

interface DashboardState {
  filters: DashboardFilters;
  searchQuery: string;
  selectedQuarryId: string | null;
  isSidePanelOpen: boolean;

  setFilters: (filters: Partial<DashboardFilters>) => void;
  toggleArrayFilter: <K extends "districts" | "mineralTypes" | "statuses">(
    key: K,
    value: DashboardFilters[K][number]
  ) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  selectQuarry: (id: string | null) => void;
  closeSidePanel: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  filters: EMPTY_FILTERS,
  searchQuery: "",
  selectedQuarryId: null,
  isSidePanelOpen: false,

  setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),

  toggleArrayFilter: (key, value) => {
    const current = get().filters[key] as unknown[];
    const exists = current.includes(value);
    const next = exists ? current.filter((v) => v !== value) : [...current, value];
    set((state) => ({ filters: { ...state.filters, [key]: next } }));
  },

  clearFilters: () => set({ filters: EMPTY_FILTERS, searchQuery: "" }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  selectQuarry: (id) => set({ selectedQuarryId: id, isSidePanelOpen: id !== null }),

  closeSidePanel: () => set({ isSidePanelOpen: false }),
}));
