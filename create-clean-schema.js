const fs = require('fs');
const path = require('path');

// Read all schema files
const basePath = path.join(__dirname, 'packages', 'api', 'prisma');
const originalSchema = fs.readFileSync(path.join(basePath, 'schema.prisma.backup'), 'utf-8');
const schema56_65 = fs.readFileSync(path.join(basePath, 'schema-steps-56-65.prisma'), 'utf-8');

// Start with datasource and generator
const cleanSchema = [];
const lines = originalSchema.split('\n');
let i = 0;

// Copy datasource and generator sections
while (i < lines.length && !lines[i].startsWith('model ')) {
  cleanSchema.push(lines[i]);
  i++;
}

// Track what we've added
const models = new Map();
const enums = new Map();

// Helper function to extract a model or enum block
function extractBlock(lines, startIdx) {
  const block = [lines[startIdx]];
  let i = startIdx + 1;
  let braceCount = 1;
  
  while (i < lines.length && braceCount > 0) {
    const line = lines[i];
    block.push(line);
    if (line.includes('{')) braceCount++;
    if (line.includes('}')) braceCount--;
    i++;
  }
  
  return { block, endIdx: i };
}

// Process original schema
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.startsWith('model ')) {
    const match = line.match(/^model\s+(\w+)/);
    const name = match ? match[1] : '';
    
    if (!models.has(name)) {
      const { block, endIdx } = extractBlock(lines, i);
      models.set(name, block);
      i = endIdx - 1;
    }
  } else if (line.startsWith('enum ')) {
    const match = line.match(/^enum\s+(\w+)/);
    const name = match ? match[1] : '';
    
    if (!enums.has(name)) {
      const { block, endIdx } = extractBlock(lines, i);
      enums.set(name, block);
      i = endIdx - 1;
    }
  }
}

// Process schema 56-65
const lines56_65 = schema56_65.split('\n');
for (let i = 0; i < lines56_65.length; i++) {
  const line = lines56_65[i];
  
  if (line.startsWith('model ')) {
    const match = line.match(/^model\s+(\w+)/);
    const name = match ? match[1] : '';
    
    if (!models.has(name)) {
      const { block, endIdx } = extractBlock(lines56_65, i);
      models.set(name, block);
      i = endIdx - 1;
    }
  } else if (line.startsWith('enum ')) {
    const match = line.match(/^enum\s+(\w+)/);
    const name = match ? match[1] : '';
    
    if (!enums.has(name)) {
      const { block, endIdx } = extractBlock(lines56_65, i);
      enums.set(name, block);
      i = endIdx - 1;
    }
  }
}

// Fix duplicate field names in models
function fixDuplicateFields(modelBlock) {
  const fields = new Set();
  const fixedBlock = [];
  
  for (const line of modelBlock) {
    // Check if it's a field definition
    const fieldMatch = line.match(/^\s+(\w+)\s+/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      
      // Skip if we've already seen this field
      if (fields.has(fieldName)) {
        continue;
      }
      
      fields.add(fieldName);
    }
    
    fixedBlock.push(line);
  }
  
  return fixedBlock;
}

// Fix the Tenant model specifically
if (models.has('Tenant')) {
  let tenantBlock = models.get('Tenant');
  
  // Remove duplicate eventSessions
  const fixedTenant = [];
  const seenFields = new Set();
  
  for (const line of tenantBlock) {
    const fieldMatch = line.match(/^\s+(\w+)\s+/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      
      // Skip duplicates
      if (fieldName === 'eventSessions' && seenFields.has('eventSessions')) {
        continue;
      }
      
      seenFields.add(fieldName);
    }
    fixedTenant.push(line);
  }
  
  models.set('Tenant', fixedTenant);
}

// Fix the User model specifically
if (models.has('User')) {
  let userBlock = models.get('User');
  
  // Remove duplicate fields
  const fixedUser = [];
  const seenFields = new Set();
  
  for (const line of userBlock) {
    const fieldMatch = line.match(/^\s+(\w+)\s+/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      
      // Skip duplicates
      if ((fieldName === 'translations' && seenFields.has('translations')) ||
          (fieldName === 'uploadedMedia' && seenFields.has('uploadedMedia'))) {
        continue;
      }
      
      seenFields.add(fieldName);
    }
    fixedUser.push(line);
  }
  
  models.set('User', fixedUser);
}

// Build final schema
cleanSchema.push('');
cleanSchema.push('// ===== CORE MODELS =====');
cleanSchema.push('');

// Add models in a logical order
const coreModels = ['Tenant', 'User', 'Organization', 'Role', 'Permission'];
for (const modelName of coreModels) {
  if (models.has(modelName)) {
    cleanSchema.push(...models.get(modelName));
    cleanSchema.push('');
    models.delete(modelName);
  }
}

// Add remaining models
for (const [name, block] of models) {
  cleanSchema.push(...block);
  cleanSchema.push('');
}

// Add enums at the end
cleanSchema.push('// ===== ENUMS =====');
cleanSchema.push('');

for (const [name, block] of enums) {
  cleanSchema.push(...block);
  cleanSchema.push('');
}

// Fix enum value references (they should be lowercase)
let finalContent = cleanSchema.join('\n');

// Fix all enum default values to lowercase
const enumFixes = [
  ['@default(VALID)', '@default(valid)'],
  ['@default(PENDING)', '@default(pending)'],
  ['@default(INFO)', '@default(info)'],
  ['@default(RUNNING)', '@default(running)'],
  ['@default(MEDIUM)', '@default(medium)'],
  ['@default(LOCAL)', '@default(local)']
];

for (const [wrong, correct] of enumFixes) {
  finalContent = finalContent.replace(new RegExp(wrong.replace(/[()]/g, '\\$&'), 'g'), correct);
}

// Write the cleaned schema
fs.writeFileSync(path.join(basePath, 'schema.prisma'), finalContent);

console.log('Schema has been cleaned and rebuilt!');
console.log(`Total models: ${models.size + coreModels.length}`);
console.log(`Total enums: ${enums.size}`);