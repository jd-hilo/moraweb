import { SocietalImpact } from '../../types/career';
import { Rocket, Users, Globe } from 'lucide-react';

interface Props {
  data: SocietalImpact;
}

export function SocietalImpactSection({ data }: Props) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Products Shipped */}
      {data.productsShipped?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-4 h-4 text-teal-500" />
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Products Shipped</h4>
          </div>
          <ul className="space-y-2">
            {data.productsShipped.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-teal-500 mt-1 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* People Influenced */}
      {data.peopleInfluenced?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-purple-500" />
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">People Influenced</h4>
          </div>
          <ul className="space-y-2">
            {data.peopleInfluenced.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-purple-500 mt-1 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Industry Contributions */}
      {data.industryContributions?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Industry Contributions</h4>
          </div>
          <ul className="space-y-2">
            {data.industryContributions.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ripple Effect */}
      {data.rippleEffect && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Ripple Effect</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{data.rippleEffect}</p>
        </div>
      )}

      {/* Honest Assessment */}
      {data.honestAssessment && (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Honest Assessment</h4>
          <p className="text-sm text-gray-500 leading-relaxed italic">{data.honestAssessment}</p>
        </div>
      )}
    </div>
  );
}
