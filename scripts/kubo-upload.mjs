#!/usr/bin/env node

// add-directory.js
import { create, globSource } from 'kubo-rpc-client';

async function main() {
  // Create an IPFS client instance. By default, it will connect to the daemon
  // API at http://127.0.0.1:5001/api/v0. Adjust as needed.
  const ipfs = create({ url: 'http://127.0.0.1:5001/api/v0' });

  // Path to the local directory you want to add to IPFS
  const directoryPath = 'downloads/burlin';

  // Options for wrapping the entire directory
  const addOptions = {
    wrapWithDirectory: true
  };

  console.log(`Adding directory "${directoryPath}" to IPFS...`);

  // Use globSource to recursively fetch all files from the directory
  for await (const file of ipfs.addAll(globSource(directoryPath, '**/*'), addOptions)) {
    console.log(`Added: ${file.path} | CID: ${file.cid}`);
  }

  console.log('Directory added successfully!');
}

// Execute the script
main()
  .catch(error => {
    console.error('Error adding directory to IPFS:', error);
    process.exit(1);
  });
