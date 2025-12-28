interface MultiSelectOption {
  value: string;
  label: string;
  emoji?: string;
}

interface MultiSelectGridProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectGrid({ options, selected, onChange }: MultiSelectGridProps) {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => toggleOption(option.value)}
          className={`px-4 py-3 rounded-xl transition-all duration-200 border-2 text-center text-black ${
            selected.includes(option.value)
              ? 'border-turquoise bg-turquoise/10 font-semibold'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          {option.emoji && <span className="text-2xl block mb-1">{option.emoji}</span>}
          <span className="text-sm text-black">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
