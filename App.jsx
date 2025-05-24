import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x2c0E02877B3E99320C7862edDc70529b93c49C7a';
const RECIPIENT_ADDRESS = '0x33DEe5B1aE0F3938f0babC85d3bb3527e760628F';
const ABI = [
  {"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [roiInput, setRoiInput] = useState('');
  const [roiPercent, setRoiPercent] = useState(10);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
    }
  }, []);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const signer = await provider.getSigner();
      setSigner(signer);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateROI = () => {
    const roi = parseFloat(roiInput) * (roiPercent / 100);
    setResult(roi);
  };

  const sendTokens = async () => {
    try {
      if (!signer) return;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const decimals = await contract.decimals();
      const amount = ethers.parseUnits(roiInput, decimals);
      const tx = await contract.transfer(RECIPIENT_ADDRESS, amount);
      setStatus('Transaction sent. Waiting for confirmation...');
      await tx.wait();
      setStatus('✅ Deposit successful!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Transaction failed.');
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '0 auto' }}>
      <h1>MORSEL Web3 dApp</h1>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account.slice(0, 6)}...` : 'Connect Wallet'}
      </button>

      <div style={{ marginTop: 20 }}>
        <h2>ROI Calculator</h2>
        <input
          type="number"
          placeholder="Enter amount"
          value={roiInput}
          onChange={(e) => setRoiInput(e.target.value)}
        /><br />
        <input
          type="number"
          placeholder="Enter % return"
          value={roiPercent}
          onChange={(e) => setRoiPercent(e.target.value)}
        /><br />
        <button onClick={calculateROI}>Calculate ROI</button>
        {result !== null && <p>Projected ROI: {result}</p>}
      </div>

      <div style={{ marginTop: 20 }}>
        <h2>Deposit Tokens</h2>
        <button onClick={sendTokens}>Deposit</button>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
}

export default App;