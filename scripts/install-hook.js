#!/usr/bin/env node

/**
 * Git Hook Installer
 * Installs the post-commit hook in a git repository
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class HookInstaller {
  constructor(hookType = 'post-push') {
    this.scriptDir = path.resolve(__dirname, '..');
    this.hookType = hookType;
    this.hookSource = path.join(__dirname, hookType);
  }

  /**
   * Find git repository root
   */
  findGitRoot(startPath = process.cwd()) {
    let currentPath = startPath;
    
    while (currentPath !== '/') {
      const gitPath = path.join(currentPath, '.git');
      if (fs.existsSync(gitPath)) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }
    
    return null;
  }

  /**
   * Install hook in a repository
   */
  installHook(repoPath) {
    const gitDir = path.join(repoPath, '.git');
    const hooksDir = path.join(gitDir, 'hooks');
    const hookDest = path.join(hooksDir, this.hookType);

    // Ensure hooks directory exists
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Read the hook template
    let hookContent = fs.readFileSync(this.hookSource, 'utf8');

    // Update the script directory path
    hookContent = hookContent.replace(
      'SCRIPT_DIR="$HOME/Desktop/bob-sprint-automation"',
      `SCRIPT_DIR="${this.scriptDir}"`
    );

    // Backup existing hook if present
    if (fs.existsSync(hookDest)) {
      const backupPath = `${hookDest}.backup.${Date.now()}`;
      fs.copyFileSync(hookDest, backupPath);
      console.log(`📦 Backed up existing hook to: ${backupPath}`);
    }

    // Write the hook
    fs.writeFileSync(hookDest, hookContent);
    
    // Make it executable
    fs.chmodSync(hookDest, '755');

    console.log(`✅ ${this.hookType} hook installed in: ${repoPath}`);
    console.log(`   Hook location: ${hookDest}`);
  }

  /**
   * Interactive installation
   */
  async run() {
    console.log('🤖 Bob Sprint Automation - Hook Installer');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if we're in a git repository
    const gitRoot = this.findGitRoot();
    
    if (!gitRoot) {
      console.error('❌ Not in a git repository!');
      console.error('   Please run this command from within a git repository.\n');
      process.exit(1);
    }

    console.log(`📂 Git repository found: ${gitRoot}\n`);

    // Check if config is set up
    const configPath = path.join(this.scriptDir, 'config.yml');
    const envPath = path.join(this.scriptDir, '.env');

    if (!fs.existsSync(envPath)) {
      console.warn('⚠️  Warning: .env file not found!');
      console.warn('   Please copy .env.example to .env and add your GitHub token.\n');
    }

    // Install the hook
    try {
      this.installHook(gitRoot);
      
      console.log('\n✨ Installation complete!\n');
      console.log('📝 Next steps:');
      console.log('   1. Ensure your .env file has a valid GITHUB_TOKEN');
      console.log('   2. Update config.yml with your GitHub username and repo');
      console.log('   3. Make a commit and push with the format:');
      console.log('      git commit -m "Your commit message');
      console.log('      issue: 123');
      console.log('      status: in-progress"');
      console.log('      git push\n');
      console.log(`🎉 The ${this.hookType} hook will automatically update your GitHub issues after push!\n`);
    } catch (error) {
      console.error('❌ Installation failed:', error.message);
      process.exit(1);
    }
  }
}

// Run installer
if (require.main === module) {
  const installer = new HookInstaller();
  installer.run();
}

module.exports = HookInstaller;

// Made with Bob
