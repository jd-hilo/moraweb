import { GlobalComparison } from '../../types/career';

interface Props {
  data: GlobalComparison;
}

function PercentileBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-bold text-gray-800">Top {value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${100 - value}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n.toLocaleString()}`;
}

export function GlobalComparisonSection({ data }: Props) {
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Percentile bars */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Your Global Ranking</h3>

        <PercentileBar
          value={data.income?.globalPercentile || 50}
          label="Income"
          color="linear-gradient(90deg, #25729f, #62edb9)"
        />
        <PercentileBar
          value={data.careerProgression?.globalPercentile || 50}
          label="Career Progression"
          color="linear-gradient(90deg, #7c3aed, #a78bfa)"
        />
        <PercentileBar
          value={data.workLife?.globalPercentile || 50}
          label="Work-Life Balance"
          color="linear-gradient(90deg, #f59e0b, #fbbf24)"
        />
        {data.equity && (
          <PercentileBar
            value={data.equity.globalPercentile || 50}
            label="Equity"
            color="linear-gradient(90deg, #10b981, #6ee7b7)"
          />
        )}
      </div>

      {/* Income comparison */}
      {data.income && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Income Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Your Comp</p>
              <p className="text-xl font-bold text-black">{formatNum(data.income.yourComp)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">US Average</p>
              <p className="text-xl font-bold text-gray-600">{formatNum(data.income.usAverage)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Global Average</p>
              <p className="text-xl font-bold text-gray-600">{formatNum(data.income.globalAverage)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Top Earners</p>
              <p className="text-sm font-bold text-gray-600">{data.income.topEarners?.range}</p>
              <p className="text-xs text-gray-400">{data.income.topEarners?.group}</p>
            </div>
          </div>
        </div>
      )}

      {/* Work-Life comparison */}
      {data.workLife && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Work-Life Hours</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{data.workLife.range?.minLabel} ({data.workLife.range?.min}h)</span>
                <span>{data.workLife.range?.maxLabel} ({data.workLife.range?.max}h)</span>
              </div>
              <div className="relative w-full bg-gray-100 rounded-full h-3">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-teal-500 shadow-md border-2 border-white z-10"
                  style={{
                    left: `${((data.workLife.yourHours - (data.workLife.range?.min || 35)) / ((data.workLife.range?.max || 80) - (data.workLife.range?.min || 35))) * 100}%`,
                  }}
                />
              </div>
              <p className="text-center text-xs font-bold text-teal-600 mt-2">You: {data.workLife.yourHours}h/week</p>
            </div>
          </div>
        </div>
      )}

      {/* Geographic */}
      {data.geographic && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Geographic Salary Comparison</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'North America', value: data.geographic.northAmerica },
              { label: 'Europe', value: data.geographic.europe },
              { label: 'Asia', value: data.geographic.asia },
              { label: 'Latin America', value: data.geographic.latinAmerica },
            ].map((region) => (
              <div key={region.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">{region.label}</p>
                <p className="text-sm font-bold text-gray-800">{formatNum(region.value)}</p>
              </div>
            ))}
          </div>
          {data.geographic.note && (
            <p className="text-xs text-gray-500">{data.geographic.note}</p>
          )}
        </div>
      )}

      {/* Global Reality */}
      {data.globalReality && (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Global Reality</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{data.globalReality}</p>
        </div>
      )}
    </div>
  );
}
