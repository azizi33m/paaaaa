const express = require('express');
const { ethers } = require('ethers');
const app = express();
const port = process.env.PORT || 3000; // استفاده از متغیر محیطی PORT، اگه نبود از 3000 استفاده می‌کنه

// اطلاعات قرارداد
const tokenAddress = '0x0439F02056CB6acB0C809015a14797006ee2A614'; // آدرس قرارداد توکنت
const contractABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// اتصال به شبکه Mainnet
const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth'); // یه RPC URL عمومی برای Mainnet
const contract = new ethers.Contract(tokenAddress, contractABI, provider);

app.get('/supply', async (req, res) => {
  try {
    // گرفتن عرضه کل از قرارداد
    let totalSupply;
    try {
      totalSupply = await contract.totalSupply();
      totalSupply = ethers.formatUnits(totalSupply, 6); // تبدیل به واحد خوانا (با 6 اعشار)
    } catch (error) {
      console.error('Error fetching totalSupply:', error.message);
      totalSupply = 1000000000; // اگه متد totalSupply وجود نداشت، مقدار پیش‌فرض
    }

    // گرفتن توکن‌های سوزونده‌شده (موجودی آدرس صفر)
    const burnAddress = '0x0000000000000000000000000000000000000000';
    let burnedTokens;
    try {
      burnedTokens = await contract.balanceOf(burnAddress);
      burnedTokens = ethers.formatUnits(burnedTokens, 6); // تبدیل به واحد خوانا (با 6 اعشار)
    } catch (error) {
      console.error('Error fetching burned tokens:', error.message);
      burnedTokens = 0; // اگه خطایی رخ داد، فرض می‌کنیم توکنی سوزونده نشده
    }

    // محاسبه عرضه در گردش
    const circulatingSupply = totalSupply - burnedTokens;

    res.json({
      total_supply: parseFloat(totalSupply),
      circulating_supply: parseFloat(circulatingSupply)
    });
  } catch (error) {
    console.error('Error in /supply endpoint:', error.message);
    res.status(500).json({ error: 'Failed to fetch supply data' });
  }
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});