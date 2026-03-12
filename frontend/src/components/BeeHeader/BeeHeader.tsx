import { useState } from 'react';
import './BeeHeader.css';

export function BeeHeader() {
  const [isWiggling, setIsWiggling] = useState(false);

  const handleBeeClick = () => {
    if (!isWiggling) {
      setIsWiggling(true);
    }
  };

  const handleAnimationEnd = () => setIsWiggling(false);

  return (
    <header className="bee-header">
      <img
        src="/bumble-bee.svg"
        alt="Bumble bee mascot"
        className={`bee-header-img${isWiggling ? ' bee-header-img--wiggle' : ''}`}
        onClick={handleBeeClick}
        onAnimationEnd={handleAnimationEnd}
        style={{ cursor: 'pointer' }}
        aria-label="Click me for a surprise"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBeeClick(); } }}
      />
      <h1 className="bee-header-title">my todos</h1>
    </header>
  );
}
