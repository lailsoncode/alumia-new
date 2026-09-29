import { Switch } from "@/components/ui/switch";

interface PreferenceSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function PreferenceSwitch({ checked, onCheckedChange, label, disabled = false }: PreferenceSwitchProps) {
  return (
    <label className="flex h-11 w-14 cursor-pointer items-center justify-center rounded-xl has-focus:ring-2 has-focus:ring-ring has-focus:ring-offset-2 has-focus:ring-offset-background has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
      <span className="sr-only">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={label}
        className="h-7 w-12 border-0 p-0.5 [&>span]:h-6 [&>span]:w-6 [&>span]:data-[state=checked]:translate-x-5"
      />
    </label>
  );
}
