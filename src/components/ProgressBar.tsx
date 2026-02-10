interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
      <div
        className="h-full transition-all duration-500"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(135deg, #25729f, #62edb9)',
        }}
      />
    </div>
  );
}
