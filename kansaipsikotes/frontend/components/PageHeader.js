import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PageHeader = ({ 
  title, 
  subtitle, 
  backLink, 
  backText = 'Back',
  children 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {backLink && (
              <Link
                href={backLink}
                className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{backText}</span>
              </Link>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader; 