import { Languages, Check } from 'lucide-react';
import { useI18n } from '@/shared/hooks/useI18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  align?: 'start' | 'end' | 'center';
  mode?: 'dropdown' | 'submenu';
}

export function LanguageSwitcher({ 
  align = 'end',
  mode = 'dropdown'
}: LanguageSwitcherProps) {
  const { t, i18n } = useI18n();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  // Submenu mode for use inside another dropdown menu
  if (mode === 'submenu') {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className='py-2'>
          <Languages className={`h-5 w-5 me-2`} />
          {t('common:language')}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
            <div className="flex items-center justify-between w-full">
              <span>{t('common:languages.en')}</span>
              {i18n.language === 'en' && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('ar')}>
            <div className="flex items-center justify-between w-full">
              <span>{t('common:languages.ar')}</span>
              {i18n.language === 'ar' && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  // Default dropdown mode
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer p-2 rounded-md bg-primary text-primary-foreground transition-colors outline-0">
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('common:language')}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-40">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>{t('common:languages.en')}</span>
          {i18n.language === 'en' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('ar')}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>{t('common:languages.ar')}</span>
          {i18n.language === 'ar' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
