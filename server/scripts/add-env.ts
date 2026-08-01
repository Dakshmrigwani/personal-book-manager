import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: <KEY> [VALUE]');
  process.exit(1);
}

const key = args[0].toUpperCase();
const value = args[1] || '';
const projectRoot = process.cwd();

function toCamelCase(str: string) {
  return str.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * @param {string} checkString - Specific string to check for duplication (to avoid false positives)
 */
function inject(filePath: string, find: string, insert: string, checkString: string, position = 'after') {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');

  // FIX: Check for the specific string we care about, not the global key
  if (content.includes(checkString)) {
    console.log(`⚠️ "${checkString}" already exists in ${path.basename(filePath)}`);
    return false;
  }

  const index = content.indexOf(find);
  if (index === -1) {
    console.warn(`⚠️ Could not find anchor "${find}" in ${path.basename(filePath)}`);
    return false;
  }

  let newContent;
  if (position === 'after') {
    const splitPos = index + find.length;
    newContent = content.slice(0, splitPos) + '\n' + insert + content.slice(splitPos);
  } else {
    newContent = content.slice(0, index) + insert + '\n' + content.slice(index);
  }

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ Updated ${path.basename(filePath)}`);
  return true;
}

function appendToEnv(fileName: string) {
  const filePath = path.join(projectRoot, fileName);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(`${key}=`)) {
      fs.appendFileSync(filePath, fileName === '.env.example' ? `\n${key}=''` : `\n${key}=${value}`);
      console.log(`✅ Added to ${fileName}`);
    } else {
      console.log(`⚠️  ${key} already in ${fileName}`);
    }
  }
}

async function main() {
  appendToEnv('.env');
  appendToEnv('.env.example');

  const camelKey = toCamelCase(key);
  const configPath = 'src/config/env.ts';

  inject(configPath, 'z.object({', `  ${key}: z.string().min(1, '${key} is required'),`, `${key}:`, 'after');
  inject(configPath, 'export const env = {', `  ${camelKey}: envVars.${key},`, `${camelKey}:`, 'after');

  console.log("\nDone! Don't forget to restart your server.");
}

main();
