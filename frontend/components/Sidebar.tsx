
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { icon: "grid", label: "Dashboard", path: "/" },
  { icon: "clipboard-list", label: "Tasks", path: "/tasks" },
  { icon: "flag", label: "Quests", path: "/quests" },
  { icon: "chart-bar", label: "Leaderboard", path: "/leaderboard" },
  { icon: "users", label: "Partnerships", path: "/partnerships" },
  { icon: "user-circle", label: "Profile", path: "/profile" },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="w-64 h-screen bg-gray-900 text-gray-300 fixed left-0 top-0 border-r border-gray-800">
      <div className="p-4 flex items-center">
        <span className="text-lg font-semibold text-purple-400">Lagoon</span>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link href={item.path} key={item.label} passHref>
            <div 
              className={`flex items-center px-6 py-3 cursor-pointer hover:bg-gray-800 transition-colors ${
                router.pathname === item.path ? 'border-l-4 border-purple-500 bg-gray-800' : ''
              }`}
            >
              <span className="w-6 h-6 mr-3">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className="w-5 h-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={getIconPath(item.icon)} 
                  />
                </svg>
              </span>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

function getIconPath(icon: string): string {
  switch (icon) {
    case "grid": return "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z";
    case "clipboard-list": return "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01";
    case "flag": return "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9";
    case "chart-bar": return "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z";
    case "users": return "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z";
    case "user-circle": return "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z";
    default: return "";
  }
}

export default Sidebar;
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, label }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link href={href} passHref>
      <div className={`flex items-center p-3 cursor-pointer transition-colors ${
        isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
      }`}>
        <div className="mr-3">{icon}</div>
        <span>{label}</span>
      </div>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  return (
    <div className="w-56 h-screen bg-dark-800 border-r border-gray-700">
      <div className="flex items-center p-5 border-b border-gray-700">
        <div className="mr-2">
          <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
        </div>
        <span className="text-purple-400 text-xl font-medium">Lagoon</span>
      </div>
      
      <nav className="mt-6">
        <SidebarItem 
          href="/dashboard" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>} 
          label="Dashboard" 
        />
        <SidebarItem 
          href="/tasks" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} 
          label="Tasks" 
        />
        <SidebarItem 
          href="/quests" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
          label="Quests" 
        />
        <SidebarItem 
          href="/leaderboard" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} 
          label="Leaderboard" 
        />
        <SidebarItem 
          href="/partnerships" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
          label="Partnerships" 
        />
        <SidebarItem 
          href="/profile" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} 
          label="Profile" 
        />
      </nav>
    </div>
  );
};

export default Sidebar;
