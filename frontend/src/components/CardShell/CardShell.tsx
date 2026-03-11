import './CardShell.css';

interface CardShellProps {
  children: React.ReactNode;
}

export function CardShell({ children }: CardShellProps) {
  return (
    <main className="card-shell">
      {children}
    </main>
  );
}
