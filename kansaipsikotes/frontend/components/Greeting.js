import { useAuth } from '@/contexts/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat Pagi';
  if (hour >= 11 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function Greeting() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="text-xl font-semibold text-[#001F5A] mb-4">
      {getGreeting()}, {user.name}
    </div>
  );
} 