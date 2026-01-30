import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Input } from "./Input"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  // منطق الفلترة
  const filteredOptions = React.useMemo(() => {
    if (!searchValue.trim()) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  const handleSelect = (option: ComboboxOption) => {
    onValueChange?.(option.value)
    setOpen(false)
    setSearchValue("") 
  }

  // التحكم بما يظهر داخل الـ Input
  // 1. إذا القائمة مفتوحة: يظهر نص البحث (searchValue)
  // 2. إذا القائمة مغلقة: يظهر اسم الخيار المختار (selectedOption.label)
  const displayValue = open ? searchValue : (selectedOption?.label || "")

  // التحكم بالـ Placeholder
  // إذا فتحنا القائمة وكان في خيار مسبق، نعرضه كـ placeholder باهت أثناء البحث
  const displayPlaceholder = (open && selectedOption) ? selectedOption.label : placeholder

  return (
    <PopoverPrimitive.Root 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) setSearchValue("") // تصفير البحث عند الفتح لإظهار الكل
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <div className={cn("relative w-full", className)}>
          <Input
            disabled={disabled}
            placeholder={displayPlaceholder}
            value={displayValue}
            autoComplete="off"
            onChange={(e) => {
              if (!open) setOpen(true)
              setSearchValue(e.target.value)
            }}
            // منع ظهور مؤشر الكتابة (Cursor) بشكل مزعج لما تكون القائمة مغلقة
            className="pr-10 cursor-pointer focus:cursor-text"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={5}
          // استخدام المتغيرات لضبط العرض مئة بالمئة مع الحقل
          className="z-50 min-w-[var(--radix-popover-trigger-width)] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No results found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center justify-between rounded-sm px-3 py-2 outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    value === option.value && "bg-accent"
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <span className="truncate pr-4">{option.label}</span>
                  {value === option.value && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}