import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const router = useRouter();
  const { pathname, query } = router;

  // Don't show breadcrumb on login/register pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  const generateBreadcrumbs = () => {
    const breadcrumbs = [];
    
    // Add home breadcrumb
    if (pathname.startsWith('/admin')) {
      breadcrumbs.push({
        name: 'Admin',
        href: '/admin',
        current: pathname === '/admin'
      });
    } else {
      breadcrumbs.push({
        name: 'Dashboard',
        href: '/dashboard',
        current: pathname === '/dashboard'
      });
    }

    // Add specific page breadcrumbs
    if (pathname.startsWith('/admin/test_list')) {
      breadcrumbs.push({
        name: 'Tests',
        href: '/admin/test_list',
        current: true
      });
    } else if (pathname.startsWith('/admin/question_list')) {
      breadcrumbs.push({
        name: 'Tests',
        href: '/admin/test_list',
        current: false
      });
      breadcrumbs.push({
        name: `Questions (Test #${query.test_id})`,
        href: `/admin/question_list?test_id=${query.test_id}`,
        current: true
      });
    } else if (pathname.startsWith('/admin/test_create')) {
      breadcrumbs.push({
        name: 'Tests',
        href: '/admin/test_list',
        current: false
      });
      breadcrumbs.push({
        name: 'Create Test',
        href: '/admin/test_create',
        current: true
      });
    } else if (pathname.startsWith('/admin/test_edit')) {
      breadcrumbs.push({
        name: 'Tests',
        href: '/admin/test_list',
        current: false
      });
      breadcrumbs.push({
        name: 'Edit Test',
        href: `/admin/test_edit?test_id=${query.test_id}`,
        current: true
      });
    } else if (pathname.startsWith('/admin/question_create')) {
      breadcrumbs.push({
        name: 'Tests',
        href: '/admin/test_list',
        current: false
      });
      breadcrumbs.push({
        name: 'Questions',
        href: `/admin/question_list?test_id=${query.test_id}`,
        current: false
      });
      breadcrumbs.push({
        name: 'Create Question',
        href: `/admin/question_create?test_id=${query.test_id}`,
        current: true
      });
    } else if (pathname.startsWith('/admin/question_edit')) {
      breadcrumbs.push({
        name: 'Tests',
        href: '/admin/test_list',
        current: false
      });
      breadcrumbs.push({
        name: 'Questions',
        href: `/admin/question_list?test_id=${query.test_id}`,
        current: false
      });
      breadcrumbs.push({
        name: 'Edit Question',
        href: `/admin/question_edit?question_id=${query.question_id}&test_id=${query.test_id}`,
        current: true
      });
    } else if (pathname.startsWith('/admin/test-results')) {
      breadcrumbs.push({
        name: 'Test Results',
        href: '/admin/test-results',
        current: true
      });
    } else if (pathname.startsWith('/tests/')) {
      breadcrumbs.push({
        name: 'Tests',
        href: '/tests',
        current: false
      });
      breadcrumbs.push({
        name: 'Take Test',
        href: pathname,
        current: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 py-3">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              {breadcrumb.current ? (
                <span className="text-sm font-medium text-gray-900">
                  {breadcrumb.name}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {breadcrumb.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb; 