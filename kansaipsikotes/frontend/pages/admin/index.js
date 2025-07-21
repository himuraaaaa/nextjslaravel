import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Greeting from '@/components/Greeting';

const AdminDashboard = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/test_list');
  }, [router]);
    return (
      <div>
        <Greeting />
        {/* ...rest of admin dashboard... */}
      </div>
    );
};

export default AdminDashboard;