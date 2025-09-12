export function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-4xl font-bold mb-4 sm:text-5xl">
      {children}
    </h1>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-semibold mb-3 sm:text-4xl">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-2xl font-medium mb-2 sm:text-3xl">
      {children}
    </h3>
  );
}

export function H4({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xl font-medium mb-1 sm:text-2xl">
      {children}
    </h4>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base sm:text-lg">
      {children}
    </p>
  );
}

export function Small({ children }: { children: React.ReactNode }) {
  return (
    <small className="text-sm sm:text-base">
      {children}
    </small>
  );
}

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs sm:text-sm">
      {children}
    </span>
  );
}