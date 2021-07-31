const ethers = require('ethers');
const providerRPC = {
   xchain: {
      name: 'xchain',
      rpc: 'https://rpc.xchain.asia',
      chainId: 35,
   },
};
const provider = new ethers.providers.StaticJsonRpcProvider(
   providerRPC.xchain.rpc,
   {
      chainId: providerRPC.xchain.chainId,
      name: providerRPC.xchain.name,
   }
); 

// Variables
const account_from = {
   privateKey: '0xf79eaddb80efedfc2e51f6ae00a421af464070be1c0454c6e16b49a0cb55132c',
};
const addressTo = '0xC4d648a31863Ad77Ca385F1Df623bd838c28CEA3';

// Create Wallet
let wallet = new ethers.Wallet(account_from.privateKey, provider);

/*
   -- Create and Deploy Transaction --
*/
const send = async () => {
   const tx = {
      to: addressTo,
      value: ethers.utils.parseEther('0.01'),
   };
   const createReceipt = await wallet.sendTransaction(tx);
   await createReceipt.wait();
   console.log(`Transaction successful with hash: ${createReceipt.hash}`);
};

send();
