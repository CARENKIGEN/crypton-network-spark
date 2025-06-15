
import { Blockchain, Transaction, Block, Wallet } from './crypto';

// Simulated REST API for blockchain node communication
export class BlockchainAPI {
  private blockchain: Blockchain;

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
  }

  // GET /api/blocks
  async getBlocks(): Promise<Block[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.blockchain.chain);
      }, 100);
    });
  }

  // GET /api/blocks/:id
  async getBlock(id: number): Promise<Block | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const block = this.blockchain.chain.find(b => b.index === id);
        resolve(block || null);
      }, 100);
    });
  }

  // GET /api/transactions
  async getPendingTransactions(): Promise<Transaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.blockchain.pendingTransactions);
      }, 100);
    });
  }

  // GET /api/balance/:address
  async getBalance(address: string): Promise<{ address: string; balance: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const balance = this.blockchain.getBalance(address);
        resolve({ address, balance });
      }, 100);
    });
  }

  // POST /api/transactions
  async submitTransaction(transaction: Transaction): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          this.blockchain.createTransaction(transaction);
          resolve({ success: true, message: 'Transaction added to pending pool' });
        } catch (error) {
          resolve({ success: false, message: 'Failed to submit transaction' });
        }
      }, 100);
    });
  }

  // POST /api/mine
  async mineBlock(minerAddress: string): Promise<{ success: boolean; block?: Block; message: string }> {
    return new Promise(async (resolve) => {
      try {
        const block = await this.blockchain.minePendingTransactions(minerAddress);
        if (block) {
          resolve({ success: true, block, message: 'Block mined successfully' });
        } else {
          resolve({ success: false, message: 'No pending transactions to mine' });
        }
      } catch (error) {
        resolve({ success: false, message: 'Mining failed' });
      }
    });
  }

  // GET /api/chain/validate
  async validateChain(): Promise<{ valid: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = this.blockchain.isChainValid();
        resolve({
          valid: isValid,
          message: isValid ? 'Blockchain is valid' : 'Blockchain is corrupted'
        });
      }, 100);
    });
  }

  // GET /api/stats
  async getNetworkStats(): Promise<{
    totalBlocks: number;
    totalTransactions: number;
    pendingTransactions: number;
    difficulty: number;
    isValid: boolean;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalTransactions = this.blockchain.chain.reduce(
          (total, block) => total + block.transactions.length, 0
        );
        
        resolve({
          totalBlocks: this.blockchain.chain.length,
          totalTransactions,
          pendingTransactions: this.blockchain.pendingTransactions.length,
          difficulty: this.blockchain.difficulty,
          isValid: this.blockchain.isChainValid()
        });
      }, 100);
    });
  }
}

// Network simulation for multiple nodes
export class NetworkSimulator {
  private nodes: Map<string, BlockchainAPI>;

  constructor() {
    this.nodes = new Map();
  }

  addNode(nodeId: string, blockchain: Blockchain): void {
    this.nodes.set(nodeId, new BlockchainAPI(blockchain));
  }

  getNode(nodeId: string): BlockchainAPI | undefined {
    return this.nodes.get(nodeId);
  }

  getAllNodes(): string[] {
    return Array.from(this.nodes.keys());
  }

  // Simulate network broadcast
  async broadcastTransaction(transaction: Transaction): Promise<void> {
    const promises = Array.from(this.nodes.values()).map(node => 
      node.submitTransaction(transaction)
    );
    await Promise.all(promises);
  }

  // Simulate consensus mechanism
  async syncNodes(): Promise<void> {
    // In a real implementation, this would handle chain synchronization
    // For now, we'll just log the action
    console.log('Syncing nodes across network...');
  }
}
