import type { Part } from '../b11/types';

export function DeviceGraphic({ part }: { part: Part }) {
  const metal = '#b9c8cf';
  const dark = '#1d2b34';
  const screw = (x: number, y: number) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="5" fill={metal} stroke="#637681" strokeWidth="2" /><path d={`M ${x - 2} ${y} L ${x + 2} ${y}`} stroke="#53646c" /></g>;
  let drawing;
  switch (part.kind) {
    case 'breaker':
      drawing = <><rect x="9" y="8" width="82" height="64" rx="5" fill={dark} stroke="#73838b" strokeWidth="3" />{[25, 50, 75].map((x) => <g key={x}>{screw(x, 15)}<rect x={x - 10} y="25" width="20" height="31" rx="3" fill="#11191e" stroke="#63737b" /><rect x={x - 6} y="31" width="12" height="16" rx="2" fill="#384b55" />{screw(x, 65)}</g>)}</>;
      break;
    case 'contactor':
    case 'relay':
    case 'overload':
      drawing = <><rect x="10" y="6" width="80" height="68" rx="4" fill={dark} stroke="#8b9ca3" strokeWidth="3" /><rect x="19" y="25" width="62" height="31" rx="3" fill="#445861" stroke="#c3d0d5" />{[28, 50, 72].map((x) => <g key={x}>{screw(x, 15)}{screw(x, 65)}</g>)}<rect x="43" y="34" width="14" height="12" rx="2" fill={part.kind === 'overload' ? '#ddae62' : '#e3eaed'} /></>;
      break;
    case 'fuse':
      drawing = <><rect x="31" y="6" width="38" height="68" rx="5" fill="#d9e0e2" stroke="#71848d" strokeWidth="3" />{screw(50, 15)}<rect x="39" y="25" width="22" height="31" rx="11" fill="#f7f4e6" stroke="#6f8188" strokeWidth="2" />{screw(50, 65)}</>;
      break;
    case 'button':
      drawing = <><rect x="13" y="13" width="74" height="54" rx="6" fill={dark} stroke="#84959e" strokeWidth="3" /><circle cx="50" cy="40" r="23" fill="#aab8bd" /><circle cx="50" cy="40" r="17" fill={part.id === 'stop' ? '#d44343' : '#30a779'} stroke="#eff5f3" strokeWidth="3" /></>;
      break;
    case 'lamp':
      drawing = <><rect x="29" y="36" width="42" height="29" rx="3" fill={dark} /><circle cx="50" cy="35" r="24" fill="#bdcbd0" /><circle cx="50" cy="35" r="18" fill={part.id === 'lamp-g' ? '#40b676' : '#dc4949'} stroke="#fff" strokeWidth="3" /></>;
      break;
    case 'motor':
      drawing = <><rect x="11" y="28" width="77" height="37" rx="8" fill="#6d8996" stroke="#c5d4dc" strokeWidth="3" /><circle cx="49" cy="40" r="29" fill="#879eaa" stroke="#dbe5e8" strokeWidth="3" /><circle cx="49" cy="40" r="14" fill="#344d59" /><circle cx="49" cy="40" r="5" fill="#dce5e8" />{[23, 32, 66, 75].map((x) => <path key={x} d={`M ${x} 17 L ${x} 64`} stroke="#4b6875" strokeWidth="3" />)}</>;
      break;
    case 'terminal-block':
      drawing = <><rect x="11" y="11" width="78" height="58" rx="4" fill="#303b43" stroke="#a6b8c0" strokeWidth="3" />{[23, 41, 59, 77].map((x) => <g key={x}>{screw(x, 28)}{screw(x, 52)}</g>)}</>;
      break;
    case 'buzzer':
      drawing = <><rect x="18" y="13" width="64" height="54" rx="8" fill={dark} stroke="#93a5ad" strokeWidth="3" /><circle cx="50" cy="40" r="20" fill="#101a20" stroke="#677b84" strokeWidth="3" />{[32, 40, 48].map((y) => <path key={y} d={`M 37 ${y} L 63 ${y}`} stroke="#6f858f" strokeWidth="3" />)}</>;
      break;
    case 'earth':
      drawing = <><circle cx="50" cy="40" r="29" fill="#d9eee2" stroke="#3d9266" strokeWidth="3" /><path d="M 50 19 V 49 M 32 49 H 68 M 38 56 H 62 M 44 62 H 56" fill="none" stroke="#23744f" strokeWidth="5" strokeLinecap="round" /></>;
      break;
    case 'selector':
      drawing = <><rect x="14" y="10" width="72" height="60" rx="7" fill="#d8e2e5" stroke="#70838b" strokeWidth="3" /><circle cx="50" cy="39" r="22" fill={dark} stroke="#9dafb7" strokeWidth="3" /><path d="M 50 39 L 67 25" stroke="#edf3f5" strokeWidth="7" strokeLinecap="round" /><text x="18" y="22" fontSize="12" fontWeight="700" fill="#173747">手</text><text x="73" y="22" fontSize="12" fontWeight="700" fill="#173747">自</text></>;
      break;
    case 'level-controller':
      drawing = <><rect x="10" y="8" width="80" height="64" rx="5" fill={dark} stroke="#9eb0b7" strokeWidth="3" /><rect x="18" y="18" width="64" height="28" rx="3" fill="#38515d" /><text x="50" y="37" textAnchor="middle" fontSize="14" fontWeight="700" fill="#e8f3f5">61F</text>{[24, 37, 50, 63, 76].map((x) => screw(x, 60))}</>;
      break;
    case 'water-system':
      drawing = <><path d="M 11 25 H 89 V 69 H 11 Z" fill="#81c5dc" opacity=".75" stroke="#d8eef6" strokeWidth="3" /><path d="M 11 35 Q 25 28 39 35 T 67 35 T 89 35" fill="none" stroke="#effbff" strokeWidth="3" />{[32, 50, 68].map((x, index) => <g key={x}><path d={`M ${x} 12 V ${45 + index * 6}`} stroke="#344d59" strokeWidth="4" /><text x={x} y="78" textAnchor="middle" fontSize="10" fontWeight="700" fill="#173747">E{index + 1}</text></g>)}</>;
      break;
    default:
      drawing = <><rect x="14" y="12" width="72" height="56" rx="6" fill={dark} stroke="#a8bdc8" strokeWidth="3" /><path d="M 22 40 Q 36 17 50 40 T 78 40" fill="none" stroke="#75cbe6" strokeWidth="5" /></>;
  }
  return <svg className="device-graphic" viewBox="0 0 100 80" role="img" aria-label={`${part.name}器材示意圖`} preserveAspectRatio="xMidYMid meet">{drawing}</svg>;
}
