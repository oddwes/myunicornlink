import { create, globSource } from 'kubo-rpc-client';

export const addDirectoryToIPFS = async (directoryPath: string) => {
  const ipfs = create({ url: 'http://127.0.0.1:5001/api/v0' });

  // Options for wrapping the entire directory
  const addOptions = {
    wrapWithDirectory: true
  };

  console.log(`Adding directory "${directoryPath}" to IPFS...`);
  const imported = []
  // Use globSource to recursively fetch all files from the directory
  for await (const file of ipfs.addAll(globSource(directoryPath, '**/*'), addOptions)) {
    imported.push(file.cid)
    console.log(`Added: ${file.path} | CID: ${file.cid}`);
  }

  console.log('Directory added successfully', JSON.stringify(imported));
  return imported[imported.length - 1].toString()
}
