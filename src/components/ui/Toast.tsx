import { Icon, type IconName } from '../../icons/Icons';

interface ToastProps {
  message: string;
  visible: boolean;
  icon?: IconName;
}

export function Toast({ message, visible, icon = 'checkc' }: ToastProps) {
  return (
    <div className={`toast ${visible ? 'on' : ''}`}>
      <Icon name={icon} size={16} />
      <span>{message}</span>
    </div>
  );
}
