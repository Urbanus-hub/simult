export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1221] to-[#0b152f] px-4 text-foreground">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_60%_80%,rgba(16,185,129,0.12),transparent_25%)]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-lg py-16 md:max-w-xl">
        {children}
      </div>
    </div>
  );
}
