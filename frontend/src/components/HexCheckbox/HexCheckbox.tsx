import './HexCheckbox.css';

interface HexCheckboxProps {
  checked: boolean;
}

export function HexCheckbox({ checked }: HexCheckboxProps) {
  const className = `hex-checkbox${checked ? ' hex-checkbox--checked' : ''}`;

  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-hidden="true"
    >
      <polygon
        className="hex-polygon"
        points="14,2 25.5,8.5 25.5,19.5 14,26 2.5,19.5 2.5,8.5"
      />
      <polyline
        className="hex-checkmark"
        points="8,14 12,18 20,10"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
