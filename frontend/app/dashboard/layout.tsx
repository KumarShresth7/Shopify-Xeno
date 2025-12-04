import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {/* Updated class: bg-background ensures it uses the black variable from globals.css */}
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Sidebar />
        <main className="pl-72 transition-all duration-200">
          <div className="max-w-7xl mx-auto p-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}