interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
      <div
        className="h-full gradient-turquoise transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
