import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ChartBarIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Marketplace', href: '/marketplace', icon: CubeTransparentIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const { account, connect, disconnect } = useWeb3();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-cyber-dark/80 backdrop-blur-md border-r border-cyber-blue/20">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <h1 className="font-display text-2xl bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            MONNIVERSE
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-cyber-blue/10 hover:text-cyber-blue transition-all group"
            >
              <item.icon className="w-6 h-6 mr-3 group-hover:text-cyber-blue transition-colors" />
              <span className="font-cyber">{item.name}</span>
            </a>
          ))}
        </nav>

        {/* Wallet Connection */}
        <div className="p-4 border-t border-cyber-blue/20">
          {account ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 truncate">
                {account}
              </p>
              <button
                onClick={disconnect}
                className="w-full px-4 py-2 text-sm text-cyber-blue border border-cyber-blue/50 rounded-lg hover:bg-cyber-blue/10 transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-lg hover:shadow-neon-blue transition-all duration-300"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 