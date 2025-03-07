import { useWeb3 } from '@/contexts/Web3Context';

export function ConnectWallet() {
  const { account, balance, isConnected, networkError, isLoading, connect, disconnect } = useWeb3();

  return (
    <div className="flex flex-col gap-4">
      {networkError && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
          <div className="font-medium">Connection Error</div>
          <div>{networkError}</div>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        {isConnected ? (
          <>
            <div className="text-sm">
              <p className="text-gray-600">Connected Account</p>
              <p className="font-medium text-gray-900">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600">Balance</p>
              <p className="font-medium text-gray-900">{balance} MONNI</p>
            </div>
            <button
              onClick={disconnect}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={connect}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Connecting...
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>
        )}
      </div>
    </div>
  );
} 