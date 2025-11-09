#!/usr/bin/env node

/**
 * Content Extraction Script
 * Extracts text content from old HTML files
 */

const fs = require('fs');
const path = require('path');

const OLD_DIR = path.join(__dirname, '../OLD');
const OUTPUT_DIR = path.join(__dirname, '../migration-data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Extract text content from HTML file
 * Since these are Google Sites HTML, we'll use regex to extract visible text
 */
function extractContent(htmlContent, filename) {
  const content = {
    filename,
    title: '',
    paragraphs: [],
    headings: [],
    images: [],
    links: [],
    videos: [],
  };

  // Extract title
  const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    content.title = titleMatch[1].trim();
  }

  // Extract visible text from paragraphs (Google Sites uses specific classes)
  const paragraphRegex = /<p[^>]*class="[^"]*"[^>]*>([^<]+)<\/p>/gi;
  let match;
  while ((match = paragraphRegex.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 10) {
      content.paragraphs.push(text);
    }
  }

  // Extract headings
  const headingRegex = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi;
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    if (text) {
      content.headings.push(text);
    }
  }

  // Extract images
  const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  while ((match = imageRegex.exec(htmlContent)) !== null) {
    const src = match[1];
    if (src && !src.startsWith('data:')) {
      content.images.push(src);
    }
  }

  // Extract links
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi;
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    content.links.push({
      url: match[1],
      text: match[2].trim(),
    });
  }

  // Extract video embeds (Vimeo, YouTube)
  const vimeoRegex = /vimeo\.com\/video\/(\d+)/i;
  const youtubeRegex = /youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^?&]+)/i;
  
  if (vimeoRegex.test(htmlContent)) {
    const vimeoMatch = htmlContent.match(vimeoRegex);
    if (vimeoMatch) {
      content.videos.push({
        type: 'vimeo',
        id: vimeoMatch[1],
        url: `https://vimeo.com/${vimeoMatch[1]}`,
      });
    }
  }
  
  if (youtubeRegex.test(htmlContent)) {
    const youtubeMatch = htmlContent.match(youtubeRegex);
    if (youtubeMatch) {
      content.videos.push({
        type: 'youtube',
        id: youtubeMatch[1] || youtubeMatch[2],
        url: `https://youtube.com/watch?v=${youtubeMatch[1] || youtubeMatch[2]}`,
      });
    }
  }

  // Try to extract text from Google Sites specific structure
  // Look for text in common Google Sites classes
  const textContentRegex = /<span[^>]*class="[^"]*"[^>]*>([^<]+)<\/span>/gi;
  const extractedText = [];
  while ((match = textContentRegex.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 20 && !text.match(/^\d+$/)) {
      extractedText.push(text);
    }
  }

  // Add unique extracted text to paragraphs
  extractedText.forEach(text => {
    if (!content.paragraphs.includes(text)) {
      content.paragraphs.push(text);
    }
  });

  return content;
}

/**
 * Process all HTML files
 */
function processAllFiles() {
  const htmlFiles = fs.readdirSync(OLD_DIR).filter(f => f.endsWith('.html'));
  const extracted = {};

  console.log(`Found ${htmlFiles.length} HTML files to process...`);

  htmlFiles.forEach(filename => {
    console.log(`Processing ${filename}...`);
    const filePath = path.join(OLD_DIR, filename);
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const content = extractContent(htmlContent, filename);
    extracted[filename] = content;

    // Save individual file
    const outputFile = path.join(OUTPUT_DIR, `${filename.replace('.html', '')}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));
    console.log(`  ✓ Extracted ${content.paragraphs.length} paragraphs, ${content.images.length} images`);
  });

  // Save combined output
  const combinedOutput = path.join(OUTPUT_DIR, 'all-content.json');
  fs.writeFileSync(combinedOutput, JSON.stringify(extracted, null, 2));

  console.log(`\n✓ Extraction complete!`);
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log(`  Individual files: ${htmlFiles.length}`);
  console.log(`  Combined file: all-content.json`);
}

// Run extraction
processAllFiles();

