import { AlternatePath } from '../../types/career';
import { GitBranch, Lock } from 'lucide-react';

interface Props {
  paths: AlternatePath[];
  onSelectPath: (path: AlternatePath) => void;
  isPro?: boolean;
}

export function AlternatePathsSection({ paths, onSelectPath, isPro = true }: Props) {
  if (!paths?.length) return null;

  return (
    <div className="space-y-4">
      {!isPro && (
        <p className="text-sm text-amber-600 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Upgrade to Mora+ to explore these alternate paths and generate new simulations
        </p>
      )}
      {paths.map((path) => (
        <button
          key={path.id}
          onClick={() => onSelectPath(path)}
          className={`w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all text-left group ${
            isPro ? 'hover:shadow-md hover:border-teal-200' : 'opacity-90'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <GitBranch className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-black group-hover:text-teal-700 transition-colors leading-tight">
                {path.label}
              </h4>
              {path.year && (
                <p className="text-xs text-gray-400 mt-1">Branch point: Year {path.year}</p>
              )}
            </div>
            <div className="flex-shrink-0 flex items-center gap-1">
              {!isPro && <Lock className="w-4 h-4 text-amber-500" />}
              <span className="text-gray-300 group-hover:text-teal-500 transition-colors">→</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
