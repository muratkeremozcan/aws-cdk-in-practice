import fs from 'fs'
import path from 'path'

// Function to recursively delete all .json files
function deleteJsonFiles(dir: string): void {
  fs.readdirSync(dir, {withFileTypes: true}).forEach(dirent => {
    const fullPath = path.join(dir, dirent.name)
    if (dirent.isDirectory()) {
      // Recursively delete .json files in subdirectories
      deleteJsonFiles(fullPath)
    } else if (dirent.isFile() && dirent.name.endsWith('.json')) {
      // Delete the file if it's a .json file
      fs.unlinkSync(fullPath)
      console.log(`Deleted file: ${fullPath}`)
    }
  })
}

const apiSpecsDir = path.join(__dirname)
deleteJsonFiles(apiSpecsDir)
