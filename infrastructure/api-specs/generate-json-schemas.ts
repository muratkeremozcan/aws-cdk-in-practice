import * as tsj from 'ts-json-schema-generator'
import * as fs from 'fs'
import * as path from 'path'

// Function to recursively find all .ts files in subdirectories and exclude 'openapi.ts'
function findTsSchemaFiles(
  dir: string,
  fileList: string[] = [],
  isRoot = true,
): string[] {
  fs.readdirSync(dir, {withFileTypes: true}).forEach(dirent => {
    const fullPath = path.join(dir, dirent.name)
    if (dirent.isDirectory()) {
      // Process subdirectories; skip processing the api-specs folder root
      if (!isRoot) {
        fileList = findTsSchemaFiles(fullPath, fileList, false)
      }
    } else if (
      dirent.isFile() &&
      dirent.name.endsWith('.ts') &&
      dirent.name !== 'openapi.ts'
    ) {
      // Add only .ts files that are not named 'openapi.ts', and only if it's not in the root directory
      if (!isRoot) {
        fileList.push(fullPath)
      }
    }
  })

  // If it's the root directory, proceed to its subdirectories
  if (isRoot) {
    fs.readdirSync(dir, {withFileTypes: true}).forEach(dirent => {
      if (dirent.isDirectory()) {
        fileList = findTsSchemaFiles(
          path.join(dir, dirent.name),
          fileList,
          false,
        )
      }
    })
  }

  return fileList
}

// Function to generate JSON schema from a TypeScript file
function generateSchema(tsFilePath: string): void {
  const schemaFilePath = tsFilePath.replace('.ts', '.schema.json')
  const config = {
    path: tsFilePath,
    tsconfig: path.join(__dirname, '../tsconfig.json'),
    noTypeCheck: true,
    // generate schema for all types; RequestBody, ResponseBody and all the imported types they need
    type: '*',
    // avoid creating shared $ref definitions (which is not valid in OpenAPI)
    // this e results in JSON schema files that directly embed the type definitions, instead of referring to them via $ref
    expose: 'none' as const,
  }

  try {
    const schema = tsj.createGenerator(config).createSchema(config.type)
    fs.writeFileSync(schemaFilePath, JSON.stringify(schema, null, 2))
    console.log(`Generated JSON schema for ${tsFilePath}`)
  } catch (error) {
    console.error(`Error generating JSON schema for ${tsFilePath}:`, error)
  }
}

// Main execution
const openApiFiles = findTsSchemaFiles(__dirname)
openApiFiles.forEach(generateSchema)
