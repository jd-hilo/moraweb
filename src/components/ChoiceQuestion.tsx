import { useState } from 'react';

interface ChoiceOption {
  value: string;
  label: string;
}

interface ChoiceQuestionProps {
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  allowOther?: boolean;
  otherPlaceholder?: string;
}

export function ChoiceQuestion({
  options,
  value,
  onChange,
  allowOther = false,
  otherPlaceholder = 'Please specify...',
}: ChoiceQuestionProps) {
  const [otherValue, setOtherValue] = useState('');
  const isOtherSelected = value === 'other' || (allowOther && !options.some(opt => opt.value === value) && value !== '');

  const handleOtherChange = (text: string) => {
    setOtherValue(text);
    onChange(text);
  };

  return (
    <div className="space-y-3 w-full">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`w-full px-6 py-4 rounded-xl text-left transition-all duration-200 border-2 text-black ${
            value === option.value
              ? 'border-turquoise bg-turquoise/10 font-semibold'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          {option.label}
        </button>
      ))}

      {allowOther && (
        <div>
          <button
            onClick={() => {
              onChange('other');
              setOtherValue('');
            }}
            className={`w-full px-6 py-4 rounded-xl text-left transition-all duration-200 border-2 text-black ${
              isOtherSelected
                ? 'border-turquoise bg-turquoise/10 font-semibold'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            Other
          </button>
          {isOtherSelected && (
            <input
              type="text"
              enterKeyHint="done"
              value={otherValue || (value !== 'other' ? value : '')}
              onChange={(e) => handleOtherChange(e.target.value)}
              placeholder={otherPlaceholder}
              className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-turquoise focus:outline-none"
              autoFocus
            />
          )}
        </div>
      )}
    </div>
  );
}
