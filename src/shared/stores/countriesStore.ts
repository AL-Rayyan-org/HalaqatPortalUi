import { create } from "zustand";
import type { Country } from "@/shared/types/api";

interface CountriesStore {
  countries: Country[];
  isLoading: boolean;
  error: string | null;
  setCountries: (countries: Country[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCountries: () => void;
}

export const useCountriesStore = create<CountriesStore>((set) => ({
  countries: [],
  isLoading: false,
  error: null,
  setCountries: (countries) => set({ countries, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearCountries: () => set({ countries: [], error: null }),
}));
