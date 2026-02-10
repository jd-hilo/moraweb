import { TimelineNode } from '../../types/career';

interface Props {
  milestones: TimelineNode[];
}

function formatSalary(n: number): string {
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

export function CareerTimeline({ milestones }: Props) {
  if (!milestones?.length) return null;

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-400 to-green-400 opacity-30" />

      <div className="space-y-8">
        {milestones.map((milestone, i) => (
          <div key={i} className="relative pl-12 group">
            {/* Dot */}
            <div className="absolute left-[9px] top-1 w-3 h-3 rounded-full bg-white border-[3px] border-teal-500 group-hover:scale-150 transition-transform duration-300 z-10" />

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 mb-2">
                    Year {milestone.year}
                  </span>
                  <h4 className="text-base font-bold text-black leading-tight">{milestone.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{milestone.company}</p>
                </div>
                <span className="text-lg font-bold text-black flex-shrink-0">
                  {formatSalary(milestone.salary)}
                </span>
              </div>
              {milestone.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{milestone.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
