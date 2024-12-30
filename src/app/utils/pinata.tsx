import PinataClient from '@pinata/sdk';

export const addDirectoryToIPFS = async (directoryPath: string) => {
  const pinata = new PinataClient(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

  const result = await pinata.pinFromFS(directoryPath)
  return result.IpfsHash
}
