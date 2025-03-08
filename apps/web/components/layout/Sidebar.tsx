import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/common/Logo';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const getNavigation = (userId?: string) => [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Profile', href: userId ? `/profile/${userId}` : '/profile', icon: UserCircleIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Marketplace', href: '/marketplace', icon: CubeTransparentIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const { account, connect, disconnect: disconnectWallet } = useWeb3();
  const { user, isAuthenticated, signout } = useAuth();

  const navigation = getNavigation(user?.id);

  const handleDisconnect = () => {
    disconnectWallet();
    signout();
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-cyber-dark/80 backdrop-blur-md border-r border-pink-500/20">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-pink-500/10 hover:text-pink-500 transition-all group"
            >
              <item.icon className="w-6 h-6 mr-3 group-hover:text-pink-500 transition-colors" />
              <span className="font-cyber">{item.name}</span>
            </a>
          ))}
        </nav>

        {/* User & Wallet Connection */}
        <div className="p-4 border-t border-pink-500/20 space-y-4">
          {isAuthenticated && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                {user?.email}
              </p>
              <button
                onClick={signout}
                className="flex items-center w-full px-4 py-2 text-sm text-pink-500 border border-pink-500/50 rounded-lg hover:bg-pink-500/10 transition-all"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Sign Out
              </button>
            </div>
          )}

          {account ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 truncate">
                {account}
              </p>
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 text-sm text-pink-500 border border-pink-500/50 rounded-lg hover:bg-pink-500/10 transition-all"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:shadow-neon-pink transition-all duration-300"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 