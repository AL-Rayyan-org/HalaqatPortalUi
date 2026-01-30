import type { StylesConfig } from 'react-select';

/**
 * Custom styles for react-select components matching the design system
 * Uses CSS variables for theming support (light/dark mode)
 */
export function getReactSelectStyles<OptionType, IsMulti extends boolean = false>(): StylesConfig<OptionType, IsMulti> {
  return {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'var(--background)',
      borderColor: 'var(--input)',
      borderWidth: '1px',
      borderRadius: 'calc(var(--radius) - 2px)',
      minHeight: '2.5rem',
      boxShadow: 'none',
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      ':hover': { borderColor: 'var(--input)' },
      ...(state.isFocused && {
        borderColor: 'var(--primary)',
        boxShadow: '0 0 0 1px var(--primary)',
      }),
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--popover)',
      border: '1px solid var(--border)',
      borderRadius: 'calc(var(--radius) - 2px)',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      zIndex: 50,
      padding: 4,
    }),
    menuList: (p) => ({ ...p, padding: 0 }),
    option: (p, state) => ({
      ...p,
      backgroundColor: 'transparent',
      color: 'var(--popover-foreground)',
      padding: '6px 8px',
      borderRadius: 'calc(var(--radius) - 4px)',
      margin: 0,
      cursor: 'pointer',
      transition: 'all 0.15s ease-in-out',
      ...(state.isFocused && {
        backgroundColor: 'var(--accent)',
        color: 'var(--accent-foreground)',
      }),
      ...(state.isSelected && {
        backgroundColor: 'var(--accent)',
        color: 'var(--accent-foreground)',
      }),
      ':active': { backgroundColor: 'var(--accent)' },
    }),
    multiValue: (p) => ({
      ...p,
      backgroundColor: 'var(--muted)',
      borderRadius: 'calc(var(--radius) - 4px)',
      margin: 2,
    }),
    multiValueLabel: (p) => ({
      ...p,
      color: 'var(--secondary-foreground)',
      padding: '2px 6px',
    }),
    multiValueRemove: (p) => ({
      ...p,
      color: 'var(--secondary-foreground)',
      borderRadius: '0 calc(var(--radius) - 4px) calc(var(--radius) - 4px) 0',
      ':hover': {
        backgroundColor: 'var(--destructive)',
        color: 'var(--destructive-foreground)',
      },
    }),
    placeholder: (p) => ({
      ...p,
      color: 'var(--foreground)',
    }),
    input: (p) => ({
      ...p,
    }),
    singleValue: (p) => ({
      ...p,
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    clearIndicator: (p) => ({
      ...p,
      ':hover': { color: 'var(--foreground)' },
      padding: 0,
    }),
    dropdownIndicator: (p) => ({
      ...p,
      ':hover': { color: 'var(--foreground)' },
      fontSize: '16px',
      padding: 7,
    }),
  };
}
