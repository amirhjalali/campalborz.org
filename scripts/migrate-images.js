#!/usr/bin/env node

/**
 * Image Migration Script
 * Copies and organizes images from OLD directory to new structure
 */

const fs = require('fs');
const path = require('path');

const OLD_DIR = path.join(__dirname, '../OLD');
const NEW_IMAGES_DIR = path.join(__dirname, '../packages/web/public/images/migrated');

// Mapping of old directories to new directories
const DIRECTORY_MAPPING = {
  'ALBORZ': 'alborz',
  'ART': 'art',
  'DAMAVAND': 'damavand',
  'DONATE': 'donate',
  'EVENTS': 'events',
  'HOMA': 'homa',
  'MEMBERS': 'members',
  'APPLY': 'apply',
  'THANKS': 'thanks',
};

/**
 * Copy images from old structure to new structure
 */
function migrateImages() {
  // Ensure new directory exists
  if (!fs.existsSync(NEW_IMAGES_DIR)) {
    fs.mkdirSync(NEW_IMAGES_DIR, { recursive: true });
  }

  const migrated = [];
  const errors = [];

  // Process each directory
  Object.entries(DIRECTORY_MAPPING).forEach(([oldDir, newDir]) => {
    const oldPath = path.join(OLD_DIR, oldDir);
    const newPath = path.join(NEW_IMAGES_DIR, newDir);

    if (fs.existsSync(oldPath) && fs.statSync(oldPath).isDirectory()) {
      // Create new directory
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true });
      }

      // Copy all images
      const files = fs.readdirSync(oldPath);
      files.forEach(file => {
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
          const oldFile = path.join(oldPath, file);
          const newFile = path.join(newPath, file);

          try {
            fs.copyFileSync(oldFile, newFile);
            migrated.push({
              from: `OLD/${oldDir}/${file}`,
              to: `images/migrated/${newDir}/${file}`,
            });
            console.log(`  ✓ Copied ${oldDir}/${file}`);
          } catch (error) {
            errors.push({ file, error: error.message });
            console.error(`  ✗ Error copying ${oldDir}/${file}: ${error.message}`);
          }
        }
      });
    }
  });

  // Copy root-level images
  const rootFiles = fs.readdirSync(OLD_DIR);
  rootFiles.forEach(file => {
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
      const oldFile = path.join(OLD_DIR, file);
      const newFile = path.join(NEW_IMAGES_DIR, file);

      try {
        fs.copyFileSync(oldFile, newFile);
        migrated.push({
          from: `OLD/${file}`,
          to: `images/migrated/${file}`,
        });
        console.log(`  ✓ Copied root image ${file}`);
      } catch (error) {
        errors.push({ file, error: error.message });
        console.error(`  ✗ Error copying ${file}: ${error.message}`);
      }
    }
  });

  // Save migration report
  const report = {
    migrated: migrated.length,
    errors: errors.length,
    files: migrated,
    errors_list: errors,
  };

  const reportPath = path.join(__dirname, '../migration-data/image-migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n✓ Image migration complete!`);
  console.log(`  Migrated: ${migrated.length} images`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Report: migration-data/image-migration-report.json`);

  return report;
}

// Run migration
migrateImages();

