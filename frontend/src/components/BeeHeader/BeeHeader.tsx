import './BeeHeader.css';

export function BeeHeader() {
  return (
    <header className="bee-header">
      <img src="/bumble-bee.svg" alt="" className="bee-header-img" />
      <h1 className="bee-header-title">my todos</h1>
    </header>
  );
}
