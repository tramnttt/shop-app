#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the directory where this script is located (should be src/migrations)
const migrationsDir = __dirname;

// Function to get all migration files
function getMigrationFiles() {
    // Read all files in the migrations directory
    const files = fs.readdirSync(migrationsDir);

    // Filter for TypeScript migration files with the timestamp-Name.ts pattern
    // Exclude index.ts, helper scripts, and non-migration files
    return files.filter(file => {
        return /^\d+-[A-Za-z]+\.ts$/.test(file) &&
            file !== 'index.ts' &&
            !file.includes('updateMigrationIndex') &&
            !file.endsWith('.js') &&
            !file.endsWith('.sql');
    }).sort();
}

// Function to generate the index.ts content
function generateIndexContent(migrationFiles) {
    // Generate import statements
    const imports = migrationFiles.map(file => {
        const className = getClassName(file);
        const fileName = file.replace('.ts', '');
        return `import { ${className} } from './${fileName}';`;
    }).join('\n');

    // Generate the migrations array
    const migrationsList = migrationFiles.map(file => {
        return `    ${getClassName(file)}`;
    }).join(',\n');

    // Combine everything into the final content
    return `${imports}

// Export migrations in the order they should be executed
export const migrations = [
${migrationsList}
];
`;
}

// Helper function to convert filename to class name
function getClassName(filename) {
    // Remove the .ts extension
    const nameWithoutExtension = filename.replace('.ts', '');

    // Split by dash and extract the timestamp and name parts
    const parts = nameWithoutExtension.split('-');
    const timestamp = parts[0];

    // Convert the name part to PascalCase
    const namePart = parts.slice(1).join('-')
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert spaces between camelCase
        .split(/[^a-zA-Z0-9]+/) // Split on non-alphanumeric characters
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join('');

    // Combine the parts to form the class name
    return `${namePart}${timestamp}`;
}

// Main function
function updateMigrationIndex() {
    const migrationFiles = getMigrationFiles();
    const indexContent = generateIndexContent(migrationFiles);

    // Write the generated content to index.ts
    fs.writeFileSync(path.join(migrationsDir, 'index.ts'), indexContent);
    console.log(`Updated index.ts with ${migrationFiles.length} migrations`);
}

// Run the update
updateMigrationIndex(); 