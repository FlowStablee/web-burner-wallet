'use client';

import { useState, useEffect } from 'react';
import { Wallet, Send, Copy, Eye, EyeOff, RefreshCw, Plus, Download } from 'lucide-react';
import Button from '@/components/Button';
import Card, { CardHeader, CardBody, CardFooter } from '@/components/Card';
import Modal from '@/components/Modal';
import { generateWallet, importFromMnemonic, importFromPrivateKey, WalletData } from '@/lib/wallet';
import { getBalance, sendTransaction, NETWORKS } from '@/lib/provider';
import './page.css';

export default function Home() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('sepolia');
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showMnemonicModal, setShowMnemonicModal] = useState(false);

  // Form states
  const [importMethod, setImportMethod] = useState<'mnemonic' | 'privateKey'>('mnemonic');
  const [importValue, setImportValue] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  // UI states
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      setWalletData(JSON.parse(savedWallet));
    }
  }, []);

  // Fetch balance when wallet or network changes
  useEffect(() => {
    if (walletData?.address) {
      fetchBalance();
    }
  }, [walletData?.address, selectedNetwork]);

  const handleCreateWallet = () => {
    const newWallet = generateWallet();
    setWalletData(newWallet);
    localStorage.setItem('wallet', JSON.stringify(newWallet));
    setShowCreateModal(false);
    setShowMnemonicModal(true);
  };

  const handleImportWallet = () => {
    try {
      let imported: WalletData;
      if (importMethod === 'mnemonic') {
        imported = importFromMnemonic(importValue.trim());
      } else {
        imported = importFromPrivateKey(importValue.trim());
      }
      setWalletData(imported);
      localStorage.setItem('wallet', JSON.stringify(imported));
      setShowImportModal(false);
      setImportValue('');
    } catch (error) {
      alert('Invalid mnemonic or private key. Please try again.');
    }
  };

  const fetchBalance = async () => {
    if (!walletData?.address) return;

    setIsLoadingBalance(true);
    try {
      const bal = await getBalance(walletData.address, selectedNetwork);
      setBalance(bal);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('Error');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!walletData?.privateKey || !sendTo || !sendAmount) return;

    setIsSending(true);
    try {
      const txHash = await sendTransaction(
        walletData.privateKey,
        sendTo,
        sendAmount,
        selectedNetwork
      );
      alert(`Transaction sent! Hash: ${txHash}`);
      setShowSendModal(false);
      setSendTo('');
      setSendAmount('');
      fetchBalance();
    } catch (error: any) {
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to remove this wallet? Make sure you have saved your mnemonic phrase!')) {
      setWalletData(null);
      setBalance(null);
      localStorage.removeItem('wallet');
    }
  };

  return (
    <main className="main-container">
      <div className="header">
        <div className="header-content">
          <div className="logo">
            <Wallet size={32} />
            <h1>CryptoVault</h1>
          </div>
          {walletData && (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>

      <div className="content">
        {!walletData ? (
          <div className="welcome-section">
            <Card glow className="welcome-card">
              <CardBody>
                <div className="welcome-content">
                  <Wallet size={64} className="welcome-icon" />
                  <h2>Welcome to CryptoVault</h2>
                  <p className="welcome-text">
                    Your secure, non-custodial EVM wallet. Get started by creating a new wallet or importing an existing one.
                  </p>
                  <div className="welcome-actions">
                    <Button
                      variant="primary"
                      size="lg"
                      icon={<Plus size={20} />}
                      onClick={() => setShowCreateModal(true)}
                    >
                      Create New Wallet
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={<Download size={20} />}
                      onClick={() => setShowImportModal(true)}
                    >
                      Import Wallet
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="wallet-section">
            {/* Network Selector */}
            <Card className="network-card">
              <CardBody>
                <div className="network-selector">
                  <label htmlFor="network">Network:</label>
                  <select
                    id="network"
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="network-select"
                  >
                    {Object.entries(NETWORKS).map(([key, network]) => (
                      <option key={key} value={key}>
                        {network.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardBody>
            </Card>

            {/* Balance Card */}
            <Card glow className="balance-card">
              <CardHeader>
                <div className="balance-header">
                  <h3>Balance</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<RefreshCw size={16} />}
                    onClick={fetchBalance}
                    loading={isLoadingBalance}
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="balance-display">
                  <div className="balance-amount">
                    {isLoadingBalance ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      <>
                        <span className="balance-value">{balance || '0.0'}</span>
                        <span className="balance-symbol">{NETWORKS[selectedNetwork].symbol}</span>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <Button
                  variant="primary"
                  fullWidth
                  icon={<Send size={20} />}
                  onClick={() => setShowSendModal(true)}
                >
                  Send Transaction
                </Button>
              </CardFooter>
            </Card>

            {/* Wallet Info Card */}
            <Card className="wallet-info-card">
              <CardHeader>
                <h3>Wallet Information</h3>
              </CardHeader>
              <CardBody>
                <div className="info-group">
                  <label>Address</label>
                  <div className="info-value-group">
                    <code className="info-value">{walletData.address}</code>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(walletData.address, 'address')}
                    >
                      <Copy size={16} />
                      {copiedField === 'address' && <span className="copied-tooltip">Copied!</span>}
                    </button>
                  </div>
                </div>

                <div className="info-group">
                  <label>Private Key</label>
                  <div className="info-value-group">
                    <code className="info-value">
                      {showPrivateKey ? walletData.privateKey : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button
                      className="copy-btn"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {showPrivateKey && (
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(walletData.privateKey, 'privateKey')}
                      >
                        <Copy size={16} />
                        {copiedField === 'privateKey' && <span className="copied-tooltip">Copied!</span>}
                      </button>
                    )}
                  </div>
                </div>

                {walletData.mnemonic && (
                  <div className="info-group">
                    <label>Mnemonic Phrase</label>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowMnemonicModal(true)}
                    >
                      View Mnemonic
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Create Wallet Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Wallet"
        size="sm"
      >
        <div className="modal-content-inner">
          <p className="modal-description">
            A new wallet will be generated with a unique mnemonic phrase. Make sure to save it securely!
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateWallet}>
              Create Wallet
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Wallet Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Wallet"
        size="md"
      >
        <div className="modal-content-inner">
          <div className="import-method-selector">
            <button
              className={`method-btn ${importMethod === 'mnemonic' ? 'active' : ''}`}
              onClick={() => setImportMethod('mnemonic')}
            >
              Mnemonic Phrase
            </button>
            <button
              className={`method-btn ${importMethod === 'privateKey' ? 'active' : ''}`}
              onClick={() => setImportMethod('privateKey')}
            >
              Private Key
            </button>
          </div>
          <textarea
            className="import-textarea"
            placeholder={importMethod === 'mnemonic' ? 'Enter your 12 or 24 word mnemonic phrase' : 'Enter your private key'}
            value={importValue}
            onChange={(e) => setImportValue(e.target.value)}
            rows={4}
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImportWallet} disabled={!importValue.trim()}>
              Import Wallet
            </Button>
          </div>
        </div>
      </Modal>

      {/* Send Transaction Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Transaction"
        size="md"
      >
        <div className="modal-content-inner">
          <div className="form-group">
            <label htmlFor="sendTo">Recipient Address</label>
            <input
              id="sendTo"
              type="text"
              className="form-input"
              placeholder="0x..."
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sendAmount">Amount ({NETWORKS[selectedNetwork].symbol})</label>
            <input
              id="sendAmount"
              type="number"
              step="0.000001"
              className="form-input"
              placeholder="0.0"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendTransaction}
              loading={isSending}
              disabled={!sendTo || !sendAmount}
            >
              Send
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mnemonic Display Modal */}
      <Modal
        isOpen={showMnemonicModal}
        onClose={() => setShowMnemonicModal(false)}
        title="Your Mnemonic Phrase"
        size="md"
      >
        <div className="modal-content-inner">
          <div className="warning-box">
            <p>⚠️ Never share your mnemonic phrase with anyone! Store it securely offline.</p>
          </div>
          <div className="mnemonic-display">
            {walletData?.mnemonic.split(' ').map((word, index) => (
              <div key={index} className="mnemonic-word">
                <span className="word-number">{index + 1}</span>
                <span className="word-text">{word}</span>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            fullWidth
            icon={<Copy size={20} />}
            onClick={() => walletData && copyToClipboard(walletData.mnemonic, 'mnemonic')}
          >
            {copiedField === 'mnemonic' ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </Modal>
    </main>
  );
}
