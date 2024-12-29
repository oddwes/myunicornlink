import { createHelia } from "helia";
import { unixfs } from '@helia/unixfs';
import { MemoryDatastore } from 'datastore-core/memory';
import fs from 'fs';
import path from 'path';

async function addDirectoryToIPFS(directoryPath) {
  try {
    // Create a Helia instance
    const helia = await createHelia({
      datastore: new MemoryDatastore(),
    });

    // Use UnixFS to interact with IPFS
    const fsUnix = unixfs(helia);

    // Helper function to recursively add files and directories
    async function addToIPFS(dir, prefix = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      const files = await Promise.all(
        entries.map(async (entry) => {
          const entryPath = path.join(dir, entry.name);
          const ipfsPath = path.join(prefix, entry.name);

          if (entry.isDirectory()) {
            // Recursively add subdirectory
            return addToIPFS(entryPath, ipfsPath);
          } else {
            // Add file to IPFS
            const content = fs.readFileSync(entryPath);
            const fileCid = await fsUnix.addFile({
              path: ipfsPath,
              content,
            });

            console.log(`Added file: ${ipfsPath} with CID: ${fileCid}`);
            return { path: ipfsPath, cid: fileCid };
          }
        })
      );

      // Add the directory itself
      const dirCid = await fsUnix.addFile({
        path: prefix,
        content: null,
      });

      console.log(`Added directory: ${prefix} with CID: ${dirCid}`);
      return { path: prefix, cid: dirCid, children: files };
    }

    // Add the directory to IPFS
    const result = await addToIPFS(directoryPath);
    console.log(`Root directory CID: ${result.cid}`);

    return result.cid;
  } catch (error) {
    console.error('Error adding directory to IPFS:', error);
  }
}

// Example usage
(async () => {
  const directoryPath = './example-directory'; // Replace with your directory path
  const cid = await addDirectoryToIPFS(directoryPath);
  console.log('Directory added with CID:', cid.toString());
})();
