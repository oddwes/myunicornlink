#!/usr/bin/env node
const pinataSDK = require('@pinata/sdk');

async function main() {
  const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

  const result = await pinata.pinFromFS('downloads/burlin');
  console.log('Directory added successfully!');
  console.log('Result:', result)
}

// Execute the script
main()
  .catch(error => {
    console.error('Error adding directory to IPFS:', error);
    process.exit(1);
  });
