interface ProgressBarProps {
  step: string;
  pct: number;
}

export function ProgressBar({ step, pct }: ProgressBarProps) {
  return (
    <div className="prog">
      <div className="lbls">
        <span>{step}</span>
        <span>{pct}%</span>
      </div>
      <div className="bar">
        <div
          className="fill"
          style={{ width: `${pct}%`, transition: 'width 0.55s var(--ease)' }}
        />
      </div>
    </div>
  );
}
