const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob')
const { v4: uuidv4 } = require('uuid')

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)

const getAccountInfo = () => {
  const parts = {}
  connectionString.split(';').forEach(part => {
    const [key, ...val] = part.split('=')
    parts[key] = val.join('=')
  })
  return { accountName: parts.AccountName, accountKey: parts.AccountKey }
}

const uploadFile = async (buffer, originalName, mimeType) => {
  const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_STORAGE_CONTAINER
  )
  const blobName = `${uuidv4()}-${originalName}`
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType }
  })

  const { accountName, accountKey } = getAccountInfo()
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)

  const sasToken = generateBlobSASQueryParameters({
    containerName: process.env.AZURE_STORAGE_CONTAINER,
    blobName,
    permissions: BlobSASPermissions.parse('r'),
    expiresOn: new Date(Date.now() + 60 * 60 * 1000)
  }, sharedKeyCredential).toString()

  const sasUrl = `${blockBlobClient.url}?${sasToken}`

  return { url: blockBlobClient.url, sasUrl, blobName }
}

const generateSasUrl = async (blobName) => {
  const { accountName, accountKey } = getAccountInfo()
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)
  const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  const sasToken = generateBlobSASQueryParameters({
    containerName: process.env.AZURE_STORAGE_CONTAINER,
    blobName,
    permissions: BlobSASPermissions.parse('r'),
    expiresOn: new Date(Date.now() + 60 * 60 * 1000)
  }, sharedKeyCredential).toString()

  return `${blockBlobClient.url}?${sasToken}`
}

module.exports = { uploadFile, generateSasUrl }