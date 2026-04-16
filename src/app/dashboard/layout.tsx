export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#FDFDFD]">
      <div className="flex flex-col min-h-screen w-full">{children}</div>
    </div>
  );
}
