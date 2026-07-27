import { Emblem } from '../../icons/Icons';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 52 }: LogoProps) {
  return (
    <div className="logo">
      <Emblem size={size} />
      <div className="wm">
        <b>Defensoría<br />del Pueblo</b>
        <span>COLOMBIA</span>
      </div>
    </div>
  );
}
