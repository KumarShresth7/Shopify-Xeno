import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import ChatWidget from '@/components/ChatWidget';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Sidebar />
        <main className="pl-72 transition-all duration-200">
          <div className="max-w-7xl mx-auto p-8 animate-fade-in">
            {children}
          </div>
        </main>
        

        <ChatWidget />
      </div>
    </ProtectedRoute>
  );
}