const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command) {
  try {
    return execSync(command).toString().trim();
  } catch (e) {
    return null;
  }
}

async function release() {
  const pkgPath = path.join(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const currentVersion = `v${pkg.version}`;

  console.log(`🚀 Starting release process for ${currentVersion}...`);

  // 1. Get the last tag
  let lastTag = run('git describe --tags --abbrev=0');
  let comparisonBase = lastTag;

  if (lastTag === currentVersion) {
    comparisonBase = run(`git describe --tags --abbrev=0 ${lastTag}^`);
  }

  let logCommand = '';
  if (comparisonBase) {
    console.log(`📦 Comparing with base version: ${comparisonBase}`);
    logCommand = `git log ${comparisonBase}..HEAD --oneline --pretty=format:"- %s (%h)"`;
  } else {
    console.log('📦 No previous tags found. Collecting all commits...');
    logCommand = `git log --oneline --pretty=format:"- %s (%h)"`;
  }

  // 2. Collect changes
  const changes = run(logCommand);

  if (!changes) {
    console.log('✨ No new changes found since the last release.');
    return;
  }

  console.log('\n📝 Changes since last release:');
  console.log('----------------------------');
  console.log(changes);
  console.log('----------------------------\n');

  // 3. Create tag
  try {
    console.log(`🏷️ Creating tag ${currentVersion}...`);
    // Check if tag already exists
    const tagExists = run(`git tag -l "${currentVersion}"`);
    if (tagExists) {
      console.log(`⚠️ Tag ${currentVersion} already exists. Skipping creation.`);
    } else {
      execSync(`git tag -a ${currentVersion} -m "Release ${currentVersion}\n\n${changes}"`);
      console.log(`✅ Tag ${currentVersion} created locally.`);
    }

    // 4. Push tag
    console.log(`📤 Pushing tag ${currentVersion} to origin...`);
    execSync(`git push origin ${currentVersion}`);
    console.log('🚀 Release complete! GitHub Action should start shortly.');
  } catch (error) {
    console.error('❌ Error during release:', error.message);
  }
}

release();
