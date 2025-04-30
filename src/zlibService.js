export const zlibService = {
  compress: async (readPath, writePath) => {
    const readStream = fs.createReadStream(readPath)
    const writeStream = fs.createWriteStream(writePath)
    const compressor = zlib.createBrotliCompress()
    await pipeline(readStream, compressor, writeStream)
  },
  decompress: async (readPath, writePath) => {
    const readStream = fs.createReadStream(readPath)
    const writeStream = fs.createWriteStream(writePath)
    const decompress = zlib.createBrotliDecompress()
    await pipeline(readStream, decompress, writeStream)
  }
}