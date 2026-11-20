import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

export const metadata = {
  title: 'RoadSense India — Road Accident Severity Prediction & Geospatial Analytics',
  description: 'AI-powered Indian road safety intelligence platform using Machine Learning (Decision Tree, Random Forest, XGBoost) on 500,000 accident records.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen flex">
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pl-20 sm:pl-64 transition-all duration-300">
          <TopNav />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
          
          {/* Subtle footer */}
          <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
            RoadSense India • B.Tech Introduction to Machine Learning Mini-Project • Powered by Scikit-learn & XGBoost
          </footer>
        </div>
      </body>
    </html>
  );
}

