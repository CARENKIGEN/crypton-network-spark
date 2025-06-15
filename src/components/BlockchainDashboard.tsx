import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Blockchain, Wallet, Transaction, Block, generateTransactionId } from '@/lib/crypto';
import { Pickaxe, Wallet as WalletIcon, Network, Activity } from 'lucide-react';

const BlockchainDashboard = () => {
  const [blockchain] = useState(() => new Blockchain());
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [pendingTxCount, setPendingTxCount] = useState(0);

  useEffect(() => {
    const newWallet = new Wallet();
    setWallet(newWallet);
    
    // Give the wallet some initial balance
    const initialTx: Transaction = {
      id: generateTransactionId(),
      fromAddress: null,
      toAddress: newWallet.publicKey,
      amount: 1000,
      timestamp: Date.now()
    };
    blockchain.createTransaction(initialTx);
    
    updateBlockchainData();
  }, []);

  const updateBlockchainData = () => {
    if (wallet) {
      setBalance(blockchain.getBalance(wallet.publicKey));
    }
    setRecentBlocks([...blockchain.chain].reverse().slice(0, 5));
    setPendingTxCount(blockchain.pendingTransactions.length);
  };

  const createWallet = () => {
    const newWallet = new Wallet();
    setWallet(newWallet);
    setBalance(blockchain.getBalance(newWallet.publicKey));
  };

  const sendTransaction = async () => {
    if (!wallet) return;

    const transaction: Transaction = {
      id: generateTransactionId(),
      fromAddress: wallet.publicKey,
      toAddress: '04f72c8e7c2d94c8b5a3e8f9d2a1b7c6e4d8f3a2b9c7e1f5d3a8b4c6e9f1d2a5b8c3e7f4d6a9b2c5e8f1d4a7b',
      amount: 50,
      timestamp: Date.now()
    };

    transaction.signature = wallet.signTransaction(transaction);
    blockchain.createTransaction(transaction);
    updateBlockchainData();
  };

  const mineBlock = async () => {
    if (!wallet || isMining) return;

    setIsMining(true);
    setMiningProgress(0);

    const progressInterval = setInterval(() => {
      setMiningProgress(prev => Math.min(prev + Math.random() * 10, 95));
    }, 200);

    try {
      await blockchain.minePendingTransactions(wallet.publicKey);
      setMiningProgress(100);
      updateBlockchainData();
    } catch (error) {
      console.error('Mining failed:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsMining(false);
        setMiningProgress(0);
      }, 1000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 16)}...${hash.slice(-16)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            CryptoChain <span className="text-cyan-400">Network</span>
          </h1>
          <p className="text-slate-300">Proof of Work Blockchain Implementation</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Blocks</p>
                  <p className="text-2xl font-bold text-white">{blockchain.chain.length}</p>
                </div>
                <Activity className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Your Balance</p>
                  <p className="text-2xl font-bold text-green-400">{balance} CTC</p>
                </div>
                <WalletIcon className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Txs</p>
                  <p className="text-2xl font-bold text-yellow-400">{pendingTxCount}</p>
                </div>
                <Network className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Difficulty</p>
                  <p className="text-2xl font-bold text-purple-400">{blockchain.difficulty}</p>
                </div>
                <Pickaxe className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mining" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="mining" className="data-[state=active]:bg-cyan-600">Mining</TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-cyan-600">Wallet</TabsTrigger>
            <TabsTrigger value="blockchain" className="data-[state=active]:bg-cyan-600">Blockchain</TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-cyan-600">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="mining" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Pickaxe className="h-5 w-5 text-cyan-400" />
                  Mining Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={mineBlock}
                    disabled={isMining || pendingTxCount === 0}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    {isMining ? 'Mining...' : 'Mine Block'}
                  </Button>
                  <Button
                    onClick={sendTransaction}
                    disabled={!wallet || balance < 50}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Send Test Transaction
                  </Button>
                </div>

                {isMining && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Mining Progress</span>
                      <span>{Math.round(miningProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${miningProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <WalletIcon className="h-5 w-5 text-green-400" />
                  Wallet Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Button
                    onClick={createWallet}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Generate New Wallet
                  </Button>
                </div>

                {wallet && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400">Public Key (Address)</label>
                      <div className="p-3 bg-slate-900/50 rounded-lg font-mono text-sm text-slate-300 break-all">
                        {wallet.publicKey}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Private Key</label>
                      <div className="p-3 bg-slate-900/50 rounded-lg font-mono text-sm text-red-300 break-all">
                        {wallet.privateKey}
                      </div>
                      <p className="text-xs text-red-400 mt-1">⚠️ Keep this private and secure!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blockchain" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Blockchain Explorer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBlocks.map((block) => (
                    <div key={block.index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                            Block #{block.index}
                          </Badge>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(block.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-purple-400 text-purple-400">
                          {block.transactions.length} txs
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-400">Hash: </span>
                          <span className="text-cyan-300 font-mono">{formatHash(block.hash)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Previous: </span>
                          <span className="text-slate-300 font-mono">{formatHash(block.previousHash)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Nonce: </span>
                          <span className="text-yellow-300">{block.nonce}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="h-5 w-5 text-blue-400" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Local Node</p>
                      <p className="text-sm text-slate-400">Primary mining node</p>
                    </div>
                    <Badge className="bg-green-600 text-white">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Blockchain Validity</p>
                      <p className="text-sm text-slate-400">Chain integrity check</p>
                    </div>
                    <Badge className={blockchain.isChainValid() ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                      {blockchain.isChainValid() ? "Valid" : "Invalid"}
                    </Badge>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">API Endpoints</h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <div>/api/blocks - Get all blocks</div>
                      <div>/api/blocks/:id - Get specific block</div>
                      <div>/api/transactions - Get pending transactions</div>
                      <div>/api/balance/:address - Get address balance</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlockchainDashboard;
