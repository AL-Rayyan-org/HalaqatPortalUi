import { useEffect, useState } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { getCountries } from "@/shared/services/listsService";
import { showToast } from "@/shared/components/ui/toast-config";
import { useCountriesStore } from "@/shared/stores/countriesStore";
import { Label, Button, Checkbox, Input } from "@/shared/components/ui";
import { Search, X } from "lucide-react";

interface CountriesEditorProps {
  nationalityCountries: string[];
  residencyCountries: string[];
  nationalitySelectAll: boolean;
  residencySelectAll: boolean;
  onNationalityChange: (countries: string[], selectAll: boolean) => void;
  onResidencyChange: (countries: string[], selectAll: boolean) => void;
}

export function CountriesEditor({
  nationalityCountries,
  residencyCountries,
  nationalitySelectAll,
  residencySelectAll,
  onNationalityChange,
  onResidencyChange,
}: CountriesEditorProps) {
  const { t } = useI18n();
  const { countries, isLoading, setCountries, setLoading, setError } =
    useCountriesStore();
  const [nationalitySearch, setNationalitySearch] = useState("");
  const [residencySearch, setResidencySearch] = useState("");

  useEffect(() => {
    // Only fetch if countries list is empty
    if (countries.length === 0 && !isLoading) {
      const loadCountries = async () => {
        setLoading(true);
        try {
          const response = await getCountries();
          if (response.success && response.data) {
            setCountries(response.data);
          } else {
            showToast.error(response.message || t("common:error"));
            setError(response.message || t("common:error"));
          }
        } catch {
          showToast.error(t("common:error"));
          setError(t("common:error"));
        } finally {
          setLoading(false);
        }
      };
      loadCountries();
    }
  }, [countries.length, isLoading, setCountries, setLoading, setError, t]);

  const filteredNationalityCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(nationalitySearch.toLowerCase())
  );

  const filteredResidencyCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(residencySearch.toLowerCase())
  );

  // Nationality handlers
  const isNationalitySelected = (countryCode: string): boolean => {
    if (nationalitySelectAll) {
      return true;
    }
    return nationalityCountries.includes(countryCode);
  };

  const handleNationalityToggle = (countryCode: string) => {
    if (nationalitySelectAll) {
      // User wants to deselect one, so select all EXCEPT this one
      const allExceptThis = countries
        .map((c) => c.code.toLowerCase())
        .filter((code) => code !== countryCode);
      onNationalityChange(allExceptThis, false);
    } else {
      const selected = new Set(nationalityCountries);
      if (selected.has(countryCode)) {
        selected.delete(countryCode);
        onNationalityChange(Array.from(selected), false);
      } else {
        selected.add(countryCode);
        // Check if all countries are now selected
        const allSelected = selected.size === countries.length;
        onNationalityChange(Array.from(selected), allSelected);
      }
    }
  };

  const handleNationalitySelectAll = () => {
    onNationalityChange([], true);
  };

  const handleNationalityClear = () => {
    onNationalityChange([], false);
  };

  // Residency handlers
  const isResidencySelected = (countryCode: string): boolean => {
    if (residencySelectAll) {
      return true;
    }
    return residencyCountries.includes(countryCode);
  };

  const handleResidencyToggle = (countryCode: string) => {
    if (residencySelectAll) {
      // User wants to deselect one, so select all EXCEPT this one
      const allExceptThis = countries
        .map((c) => c.code.toLowerCase())
        .filter((code) => code !== countryCode);
      onResidencyChange(allExceptThis, false);
    } else {
      const selected = new Set(residencyCountries);
      if (selected.has(countryCode)) {
        selected.delete(countryCode);
        // Prevent deselecting all - must have at least 1
        if (selected.size === 0) {
          showToast.error(t("settings:services.countries.atLeastOne"));
          return;
        }
        onResidencyChange(Array.from(selected), false);
      } else {
        selected.add(countryCode);
        // Check if all countries are now selected
        const allSelected = selected.size === countries.length;
        onResidencyChange(Array.from(selected), allSelected);
      }
    }
  };

  const handleResidencySelectAll = () => {
    onResidencyChange([], true);
  };

  const handleResidencyClear = () => {
    onResidencyChange([], false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">{t("common:loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nationality Countries */}
      <div className="space-y-3">
        <div className="flex flex-col items-start gap-1">
          <Label className="text-base font-semibold">
            {t("settings:services.countries.nationality")}
          </Label>
          <p className="text-sm text-muted-foreground font-normal">
            {t("settings:services.countries.selectedCount", {
              count: nationalitySelectAll
                ? countries.length
                : nationalityCountries.length,
              total: countries.length,
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("settings:services.countries.searchCountries")}
              value={nationalitySearch}
              onChange={(e) => setNationalitySearch(e.target.value)}
              className="ps-9"
            />
            {nationalitySearch && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setNationalitySearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNationalitySelectAll}
            >
              {t("common:selectAll")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNationalityClear}
            >
              {t("common:clear")}
            </Button>
          </div>
        </div>

        <div className="max-h-[105px] overflow-y-auto border rounded-md p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
            {filteredNationalityCountries.map((country) => {
              const countryCode = country.code.toLowerCase();
              const isSelected = isNationalitySelected(countryCode);
              return (
                <div
                  key={country.id}
                  className="flex items-center space-x-2 space-x-reverse py-1.5 px-2 hover:bg-muted/50 rounded-sm transition-colors"
                >
                  <Checkbox
                    id={`nationality-${country.code}`}
                    checked={isSelected}
                    onCheckedChange={() => handleNationalityToggle(countryCode)}
                    className="me-2"
                  />
                  <label
                    htmlFor={`nationality-${country.code}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {country.name}
                  </label>
                </div>
              );
            })}
            {filteredNationalityCountries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                {t("settings:services.countries.noCountriesFound")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Residency Countries */}
      <div className="space-y-3">
        <div className="flex flex-col items-start gap-1">
          <Label className="text-base font-semibold">
            {t("settings:services.countries.residency")}
          </Label>
          <p className="text-sm text-muted-foreground font-normal">
            {t("settings:services.countries.selectedCount", {
              count: residencySelectAll
                ? countries.length
                : residencyCountries.length,
              total: countries.length,
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("settings:services.countries.searchCountries")}
              value={residencySearch}
              onChange={(e) => setResidencySearch(e.target.value)}
              className="ps-9"
            />
            {residencySearch && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setResidencySearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResidencySelectAll}
            >
              {t("common:selectAll")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResidencyClear}
            >
              {t("common:clear")}
            </Button>
          </div>
        </div>

        <div className="max-h-[105px] overflow-y-auto border rounded-md p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
            {filteredResidencyCountries.map((country) => {
              const countryCode = country.code.toLowerCase();
              const isSelected = isResidencySelected(countryCode);
              return (
                <div
                  key={country.id}
                  className="flex items-center space-x-2 space-x-reverse py-1.5 px-2 hover:bg-muted/50 rounded-sm transition-colors"
                >
                  <Checkbox
                    id={`residency-${country.code}`}
                    checked={isSelected}
                    onCheckedChange={() => handleResidencyToggle(countryCode)}
                    className="me-2"
                  />
                  <label
                    htmlFor={`residency-${country.code}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {country.name}
                  </label>
                </div>
              );
            })}
            {filteredResidencyCountries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                {t("settings:services.countries.noCountriesFound")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
