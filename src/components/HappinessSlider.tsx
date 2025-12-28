interface HappinessSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function HappinessSlider({ value, onChange, label = 'Happiness Level' }: HappinessSliderProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-2xl font-bold text-turquoise">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6BCA9A 0%, #6BB8D4 ${value}%, #E5E7EB ${value}%, #E5E7EB 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Not happy</span>
        <span>Very happy</span>
      </div>
    </div>
  );
}
