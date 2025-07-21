import AdminCameraMonitor from '@/components/AdminCameraMonitor';

export default function LiveMonitorPage() {
  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#001F5A] mb-2">Live Camera Monitoring</h1>
          <div className="mt-2 mb-4">
            <div className="bg-white rounded-xl shadow p-4">
              <AdminCameraMonitor />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 