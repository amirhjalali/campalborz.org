const fs = require('fs');
const path = require('path');

// Read the current schema
const schemaPath = path.join(__dirname, 'packages', 'api', 'prisma', 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

// Read the additional schemas
const schema56_65 = fs.readFileSync(path.join(__dirname, 'packages', 'api', 'prisma', 'schema-steps-56-65.prisma'), 'utf-8');

// Split the schema into sections
const lines = schemaContent.split('\n');
const cleanedLines = [];
const seenModels = new Set();
const seenEnums = new Set();

let inModel = false;
let inEnum = false;
let currentBlock = [];
let blockName = '';
let blockType = '';

for (const line of lines) {
  // Check for model start
  if (line.startsWith('model ')) {
    if (inModel || inEnum) {
      // Process previous block
      if (blockType === 'model' && !seenModels.has(blockName)) {
        cleanedLines.push(...currentBlock);
        seenModels.add(blockName);
      } else if (blockType === 'enum' && !seenEnums.has(blockName)) {
        cleanedLines.push(...currentBlock);
        seenEnums.add(blockName);
      }
    }
    
    // Start new model
    const modelMatch = line.match(/^model\s+(\w+)/);
    blockName = modelMatch ? modelMatch[1] : '';
    blockType = 'model';
    inModel = true;
    inEnum = false;
    currentBlock = [line];
  } 
  // Check for enum start
  else if (line.startsWith('enum ')) {
    if (inModel || inEnum) {
      // Process previous block
      if (blockType === 'model' && !seenModels.has(blockName)) {
        cleanedLines.push(...currentBlock);
        seenModels.add(blockName);
      } else if (blockType === 'enum' && !seenEnums.has(blockName)) {
        cleanedLines.push(...currentBlock);
        seenEnums.add(blockName);
      }
    }
    
    // Start new enum
    const enumMatch = line.match(/^enum\s+(\w+)/);
    blockName = enumMatch ? enumMatch[1] : '';
    blockType = 'enum';
    inEnum = true;
    inModel = false;
    currentBlock = [line];
  }
  // Check for block end
  else if ((inModel || inEnum) && line === '}') {
    currentBlock.push(line);
    currentBlock.push(''); // Add blank line after block
    
    // Process block
    if (blockType === 'model' && !seenModels.has(blockName)) {
      cleanedLines.push(...currentBlock);
      seenModels.add(blockName);
    } else if (blockType === 'enum' && !seenEnums.has(blockName)) {
      cleanedLines.push(...currentBlock);
      seenEnums.add(blockName);
    }
    
    inModel = false;
    inEnum = false;
    currentBlock = [];
  }
  // Inside a block
  else if (inModel || inEnum) {
    currentBlock.push(line);
  }
  // Outside blocks (datasource, generator, comments)
  else {
    cleanedLines.push(line);
  }
}

// Check which models from 56-65 are missing
const missingModels = [
  'StreamingChannel', 'Stream', 'StreamingRecording',
  'VirtualEvent', 'EventAttendee', 'EventSession', 'EventSessionSpeaker',
  'ARExperience', 'ARMarker', 'ARInteraction',
  'MLPipeline', 'MLModel', 'MLExperiment', 'MLDeployment',
  'DataLakeResource', 'DataLakeQuery', 'DataLakeSchema',
  'BusinessProcess', 'ProcessInstance', 'ProcessActivity',
  'Contract', 'ContractRevision', 'ContractApproval',
  'Vendor', 'VendorContract', 'VendorEvaluation',
  'Project', 'ProjectTask', 'ProjectMilestone', 'ProjectResource',
  'TimeEntry', 'Timesheet', 'ProjectTimeReport'
];

console.log('Checking for missing models from steps 56-65...');
for (const model of missingModels) {
  if (!seenModels.has(model)) {
    console.log(`Missing model: ${model}`);
  }
}

// If models are missing, append the schema-steps-56-65 content
let needsAppending = missingModels.some(m => !seenModels.has(m));

if (needsAppending) {
  console.log('\nAppending missing models from steps 56-65...');
  cleanedLines.push('');
  cleanedLines.push('// ===== STEPS 56-65: ADVANCED FEATURES =====');
  cleanedLines.push('');
  
  // Parse and add models from schema-steps-56-65
  const lines56_65 = schema56_65.split('\n');
  let skipHeader = true;
  
  for (let i = 0; i < lines56_65.length; i++) {
    const line = lines56_65[i];
    
    // Skip header comments
    if (skipHeader && line.startsWith('//')) {
      continue;
    }
    skipHeader = false;
    
    // Add non-duplicate content
    if (line.startsWith('model ')) {
      const modelMatch = line.match(/^model\s+(\w+)/);
      const modelName = modelMatch ? modelMatch[1] : '';
      
      if (!seenModels.has(modelName)) {
        // Find the end of this model
        let modelLines = [line];
        let j = i + 1;
        while (j < lines56_65.length && !lines56_65[j].startsWith('model ') && !lines56_65[j].startsWith('enum ')) {
          modelLines.push(lines56_65[j]);
          if (lines56_65[j] === '}') break;
          j++;
        }
        cleanedLines.push(...modelLines);
        cleanedLines.push('');
        seenModels.add(modelName);
        i = j - 1; // Skip processed lines
      }
    } else if (line.startsWith('enum ')) {
      const enumMatch = line.match(/^enum\s+(\w+)/);
      const enumName = enumMatch ? enumMatch[1] : '';
      
      if (!seenEnums.has(enumName)) {
        // Find the end of this enum
        let enumLines = [line];
        let j = i + 1;
        while (j < lines56_65.length && !lines56_65[j].startsWith('model ') && !lines56_65[j].startsWith('enum ')) {
          enumLines.push(lines56_65[j]);
          if (lines56_65[j] === '}') break;
          j++;
        }
        cleanedLines.push(...enumLines);
        cleanedLines.push('');
        seenEnums.add(enumName);
        i = j - 1; // Skip processed lines
      }
    }
  }
}

// Fix enum value defaults
const finalContent = cleanedLines.join('\n')
  // Fix TicketStatus default
  .replace(/@default\(VALID\)/, '@default(valid)')
  // Fix BackupStatus defaults
  .replace(/@default\(PENDING\)/g, '@default(pending)')
  // Fix LogLevel default
  .replace(/@default\(INFO\)/g, '@default(info)')
  // Fix TrainingStatus default
  .replace(/@default\(RUNNING\)/g, '@default(running)')
  // Fix AlertSeverity default
  .replace(/@default\(MEDIUM\)/g, '@default(medium)');

// Write the cleaned schema
fs.writeFileSync(schemaPath, finalContent);

console.log('\nSchema file has been cleaned and fixed!');
console.log(`Total models: ${seenModels.size}`);
console.log(`Total enums: ${seenEnums.size}`);