import { Icon, type IconName } from '../../icons/Icons';

interface KpiProps {
  label: string;
  value: string;
  detail: React.ReactNode;
  icon: IconName;
  hot?: boolean;
}

export function Kpi({ label, value, detail, icon, hot }: KpiProps) {
  return (
    <div className={`kpi ${hot ? 'hot' : ''}`}>
      <div className="lb">
        <Icon name={icon} size={15} />
        {label}
      </div>
      <div className="vl num">{value}</div>
      <div className="dt">{detail}</div>
    </div>
  );
}
