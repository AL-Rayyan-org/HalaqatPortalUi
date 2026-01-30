import { Globe, Palette } from "lucide-react";
import { useI18n } from "@/shared/hooks/useI18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { ThemeSwitcher } from "@/shared/components/theme/ThemeSwitcher";

const AVAILABLE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export function PreferencesSection() {
  const { t, language, changeLanguage } = useI18n();

  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage);
  };

  return (
    <>
      <div className="mb-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("settings:preferences.title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("settings:preferences.description")}
        </p>
      </div>
      <Card>
        <CardTitle className="sr-only"></CardTitle>
        <CardDescription></CardDescription>
        <CardContent className="space-y-6 pt-6">
          {/* Language Selection */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("settings:preferences.language")}
            </Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue
                  placeholder={t("settings:preferences.selectLanguage")}
                />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Selection */}
          <div className="space-y-4 w-full sm:w-[300px]">
            <Label className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t("settings:preferences.theme")}
            </Label>
            <ThemeSwitcher size="sm" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
