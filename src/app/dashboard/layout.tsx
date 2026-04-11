export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div
        className="dashboard-pulse pointer-events-none fixed bottom-0 left-1/2 h-56 w-[min(100%,800px)] -translate-x-1/2 -z-[12]"
        aria-hidden
      />
      {children}
    </div>
  );
}
