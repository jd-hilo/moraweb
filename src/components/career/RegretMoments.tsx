import { RegretMoment } from '../../types/career';

interface Props {
  regrets: RegretMoment[];
  reflection: string;
}

export function RegretMomentsSection({ regrets, reflection }: Props) {
  if (!regrets?.length) return null;

  return (
    <div className="space-y-6">
      {regrets.map((regret, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
        >
          {/* Year badge */}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-3">
            {regret.year}
          </span>

          <h4 className="text-lg font-bold text-black mb-2">{regret.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{regret.description}</p>

          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-3xl opacity-50" />
        </div>
      ))}

      {/* Reflection */}
      {reflection && (
        <div className="px-4 py-6">
          <p className="text-sm text-gray-500 italic leading-relaxed text-center">{reflection}</p>
        </div>
      )}
    </div>
  );
}
