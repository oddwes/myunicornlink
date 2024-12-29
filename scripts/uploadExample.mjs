#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import process from 'process'
import { fileURLToPath } from 'url'
import { createHelia } from 'helia'
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { unixfs } from '@helia/unixfs'

/**
 * Convert file:// URLs to file paths in ESM
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function createCustomHelia () {
  const libp2p = await createLibp2p({
    transports: [webSockets()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],

    // Disable NAT traversal
    config: {
      nat: {
        enabled: false
      }
    }
  })

  const helia = await createHelia({
    libp2p
  })

  return helia
}

/**
 * Recursively walk a directory and collect file entries.
 * Each entry has a `path` (relative path) and `content` (file Buffer).
 *
 * @param {string} dirPath   The directory to walk (absolute path).
 * @param {string} prefix    Prepended to each file’s path, so they’re under a folder.
 * @param {Array}  entries   Aggregated list of file entries.
 */
function walkDirectory(dirPath, prefix, entries) {
  const files = fs.readdirSync(dirPath)
  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    const stat = fs.statSync(fullPath)
    // Build a path relative to the “prefix” folder
    const relativePath = path.join(prefix, file)

    if (stat.isDirectory()) {
      // Recurse into subdirectories
      walkDirectory(fullPath, relativePath, entries)
    } else {
      // Push a file entry with path and file content
      entries.push({
        path: relativePath,
        content: fs.readFileSync(fullPath)
      })
    }
  }
}

/**
 * Recursively adds the given directory (and its subdirectories/files)
 * to Helia, wrapping everything in a single root folder.
 *
 * @param {string} directoryPath Absolute path of the directory to add.
 */
async function addDirectoryToHelia(ufs, directoryPath) {
  // 3. Prepare our file entries
  //    Use the directory’s base name as the top-level folder name.
  const dirName = path.basename(directoryPath)
  const entries = []
  console.log(`Collecting files from "${directoryPath}"...`)
  walkDirectory(directoryPath, dirName, entries)

  // 4. Add all entries, wrapping them in one root folder (dirName)
  console.log(`Adding ${entries.length} files (wrapped in “${dirName}”) to Helia...`)

  // We’ll collect the output so we can identify the final “root” directory.
  const imported = []
  for await (const file of ufs.addAll(entries)) {
    imported.push(file)
    console.log(`Added "${file.path}" with CID ${file.cid}`)
    console.log('file info: ', file)
  }

  // The last item in `imported` should be the root directory
  const rootDir = imported[imported.length - 1]
  console.log('\n----------------------------------------')
  console.log(`Root directory: "${rootDir.path}"`)
  console.log(`Root CID: ${rootDir.cid.toString()}`)
  console.log('----------------------------------------\n')

  return rootDir.cid.toString()
}

// Suppose you already have your Helia instance and the root CID
async function verifyDirectory(ufs, rootCid) {
  console.log(`Listing contents of ${rootCid}`)
  for await (const entry of ufs.ls(rootCid)) {
    // Each entry has info like "path", "cid", "size", etc.
    console.log(`- ${entry.cid.toString()}  ${entry.path}`)
  }
}

/**
 * CLI entry point
 */
async function main() {
  // 1. Create a new Helia node
  console.log('Starting Helia...')
  const helia = await createCustomHelia()

  // 2. Create a UnixFS interface
  const ufs = unixfs(helia)

  const directoryArg = process.argv[2]
  if (!directoryArg) {
    console.error(`Usage: node ${path.basename(__filename)} <directory-path>`)
    process.exit(1)
  }

  // Resolve to an absolute path
  const directoryPath = path.resolve(__dirname, directoryArg)

  try {
    const rootCid = await addDirectoryToHelia(ufs, directoryPath)
    await verifyDirectory(ufs, rootCid)
  } catch (error) {
    console.error('Error adding directory to Helia:', error)
    process.exit(1)
  }

  console.log('Stopping Helia...')
  await helia.stop()
  console.log('Helia stopped.')
}

main()
