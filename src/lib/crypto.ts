
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

export interface Transaction {
  id: string;
  fromAddress: string | null;
  toAddress: string;
  amount: number;
  timestamp: number;
  signature?: string;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
}

export class Wallet {
  public keyPair: any;
  public publicKey: string;
  public privateKey: string;

  constructor() {
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic('hex');
    this.privateKey = this.keyPair.getPrivate('hex');
  }

  signTransaction(transaction: Transaction): string {
    const hashTx = CryptoJS.SHA256(transaction.fromAddress + transaction.toAddress + transaction.amount).toString();
    const signature = this.keyPair.sign(hashTx, 'base64');
    return signature.toDER('hex');
  }
}

export class Blockchain {
  public chain: Block[];
  public difficulty: number;
  public pendingTransactions: Transaction[];
  public miningReward: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock(): Block {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: '',
      nonce: 0,
      difficulty: this.difficulty
    };
    genesisBlock.hash = this.calculateHash(genesisBlock);
    return genesisBlock;
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  calculateHash(block: Block): string {
    return CryptoJS.SHA256(
      block.index +
      block.previousHash +
      block.timestamp +
      JSON.stringify(block.transactions) +
      block.nonce
    ).toString();
  }

  mineBlock(block: Block): Promise<Block> {
    return new Promise((resolve) => {
      const target = Array(this.difficulty + 1).join('0');
      
      const mine = () => {
        block.hash = this.calculateHash(block);
        
        if (block.hash.substring(0, this.difficulty) !== target) {
          block.nonce++;
          // Use setTimeout to prevent blocking the UI
          setTimeout(mine, 1);
        } else {
          console.log(`Block mined: ${block.hash}`);
          resolve(block);
        }
      };
      
      mine();
    });
  }

  async addBlock(transactions: Transaction[]): Promise<Block> {
    const block: Block = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions,
      previousHash: this.getLatestBlock().hash,
      hash: '',
      nonce: 0,
      difficulty: this.difficulty
    };

    const minedBlock = await this.mineBlock(block);
    this.chain.push(minedBlock);
    return minedBlock;
  }

  createTransaction(transaction: Transaction): void {
    this.pendingTransactions.push(transaction);
  }

  async minePendingTransactions(miningRewardAddress: string): Promise<Block | null> {
    if (this.pendingTransactions.length === 0) return null;

    const rewardTransaction: Transaction = {
      id: CryptoJS.SHA256(Date.now().toString()).toString(),
      fromAddress: null,
      toAddress: miningRewardAddress,
      amount: this.miningReward,
      timestamp: Date.now()
    };

    this.pendingTransactions.push(rewardTransaction);
    const block = await this.addBlock(this.pendingTransactions);
    this.pendingTransactions = [];
    return block;
  }

  getBalance(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

export function generateTransactionId(): string {
  return CryptoJS.SHA256(Date.now().toString() + Math.random().toString()).toString();
}

export function verifyTransaction(transaction: Transaction): boolean {
  if (transaction.fromAddress === null) return true;

  if (!transaction.signature || transaction.signature.length === 0) {
    throw new Error('No signature in this transaction');
  }

  const publicKey = ec.keyFromPublic(transaction.fromAddress, 'hex');
  const hashTx = CryptoJS.SHA256(transaction.fromAddress + transaction.toAddress + transaction.amount).toString();
  
  return publicKey.verify(hashTx, transaction.signature);
}
