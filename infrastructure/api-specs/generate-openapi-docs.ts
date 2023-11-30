import fs from 'fs'
import path from 'path'

// Function to recursively find all openapi.ts files
function findOpenApiFiles(dir: string, fileList: string[] = []): string[] {
  fs.readdirSync(dir, {withFileTypes: true}).forEach(dirent => {
    const filePath = path.join(dir, dirent.name)
    if (dirent.isDirectory()) {
      fileList = findOpenApiFiles(filePath, fileList)
    } else if (dirent.isFile() && dirent.name === 'openapi.ts') {
      fileList.push(filePath)
    }
  })
  return fileList
}

// Find all openapi.ts files in src/api-specs
const openApiFiles = findOpenApiFiles(__dirname)
console.log(openApiFiles)

// Import and execute each openapi.ts file to generate openapi.json
openApiFiles.forEach(file => {
  import(path.resolve(file))
    .then(() => console.log(`Generated OpenAPI document for ${file}`))
    .catch(err =>
      console.error(`Error generating OpenAPI document for ${file}:`, err),
    )
})
