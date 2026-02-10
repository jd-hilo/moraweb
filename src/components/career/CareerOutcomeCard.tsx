import { CareerOutcome, CareerStats } from '../../types/career';
import { Building2, MapPin, Star, TrendingUp } from 'lucide-react';

interface Props {
  outcome: CareerOutcome;
  stats: CareerStats;
  timeHorizon: number;
  confidence: number;
}

function formatComp(n: number): string {
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n.toLocaleString()}`;
}

export function CareerOutcomeCard({ outcome, stats, timeHorizon, confidence }: Props) {
  const stars = Math.floor(outcome.satisfaction);
  const hasHalf = outcome.satisfaction - stars >= 0.3;

  // Estimate market comparison
  const marketDiff = Math.round(((outcome.totalComp - stats.compensation.base) / stats.compensation.base) * 100);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 overflow-hidden relative">
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Career Outcome
        </span>
        <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-teal-500/10 to-green-500/10 text-teal-700 border border-teal-200">
          {timeHorizon} YEAR HORIZON
        </span>
      </div>

      {/* Role title */}
      <h2
        className="text-2xl md:text-3xl font-bold text-black mb-4 leading-tight"
        style={{
          fontFamily: 'Recoleta, Georgia, serif',
          fontVariantLigatures: 'none',
          WebkitFontFeatureSettings: '"liga" off',
          fontFeatureSettings: '"liga" off',
        }}
      >
        {outcome.title}
      </h2>

      {/* Company + Location */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 className="w-4 h-4" />
          <span className="text-sm font-medium">{outcome.company}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">{outcome.location}</span>
        </div>
      </div>

      {/* Total Comp */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl md:text-5xl font-bold text-black tracking-tight">
            {formatComp(outcome.totalComp)}
          </span>
          {marketDiff > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
              <TrendingUp className="w-3 h-3" />
              +{marketDiff}% vs Market
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">Total Compensation</p>
      </div>

      {/* Satisfaction */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < stars
                  ? 'text-yellow-400 fill-yellow-400'
                  : i === stars && hasHalf
                  ? 'text-yellow-400 fill-yellow-400/50'
                  : 'text-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-700">{outcome.satisfaction.toFixed(1)}</span>
        <span className="text-xs text-gray-400">Satisfaction</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400 mb-1">Promotions</p>
          <p className="text-lg font-bold text-black">{stats.growth.promotions}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Team Size</p>
          <p className="text-lg font-bold text-black">{stats.growth.teamSize}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Hours/Week</p>
          <p className="text-lg font-bold text-black">{stats.workLife.hoursPerWeek}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Burnout Risk</p>
          <p className={`text-lg font-bold ${
            stats.workLife.burnoutRisk === 'Low' ? 'text-green-600' :
            stats.workLife.burnoutRisk === 'Medium' ? 'text-yellow-600' : 'text-red-600'
          }`}>{stats.workLife.burnoutRisk}</p>
        </div>
      </div>
    </div>
  );
}
