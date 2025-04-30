import fs from 'fs'
import crypto from 'crypto'

export const hashService = {
  showHashFileByPath: (filePath) => {
    const newHash = crypto.createHash('SHA256')
    const readStream = fs.createReadStream(filePath)
    readStream.on('data', (chunk) => {
      newHash.update(chunk)
    })
    readStream.on('end', () => {
      const result = newHash.digest('hex')
      console.log(result)
    })
    readStream.on('error', () => {
      console.log(ERRORS.OPERATION_FAILED)
    })
  }
}