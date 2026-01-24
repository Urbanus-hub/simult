export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Simult Dashboard</h2>
          {/* Add user menu / logout here */}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
