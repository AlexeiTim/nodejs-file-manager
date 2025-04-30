import fs from 'fs'
import { pipeline } from 'stream/promises'
import { ERRORS } from './errors.js'
import zlib from 'zlib'


export const zlibService = {
  compress: async (readPath, writePath) => {
    try {
      const readStream = fs.createReadStream(readPath)
      const writeStream = fs.createWriteStream(writePath)
      const compressor = zlib.createBrotliCompress()
      await pipeline(readStream, compressor, writeStream)
    } catch(e) {
      console.log(ERRORS.OPERATION_FAILED)
    }
  },
  decompress: async (readPath, writePath) => {
    try {
      const readStream = fs.createReadStream(readPath)
      const writeStream = fs.createWriteStream(writePath)
      const decompress = zlib.createBrotliDecompress()
      await pipeline(readStream, decompress, writeStream)
    } catch(e) {
      console.log(ERRORS.OPERATION_FAILED)
    }
  }
}