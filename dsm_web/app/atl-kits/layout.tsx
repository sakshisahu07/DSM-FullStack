import AtlNavbar from "@/components/atl/AtlNavbar";

export default function AtlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AtlNavbar />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
