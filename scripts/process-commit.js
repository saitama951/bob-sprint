#!/usr/bin/env node

/**
 * Main Commit Processor
 * Processes commits and updates GitHub issues/projects
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CommitParser = require('./parser');
const GitHubClient = require('./github-client');
const PatchExplainer = require('./patch-explainer');
const BobAIExplainer = require('./bob-ai-explainer');

class CommitProcessor {
  constructor() {
    this.loadConfig();
    this.initializeClients();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '..', 'config.yml');
      this.config = yaml.load(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('❌ Error loading config:', error.message);
      process.exit(1);
    }
  }

  initializeClients() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('❌ GITHUB_TOKEN not found in environment variables');
      console.error('   Please create a .env file with your GitHub token');
      process.exit(1);
    }

    this.parser = new CommitParser(this.config);
    this.github = new GitHubClient(
      token,
      this.config.github.owner,
      this.config.github.repo,
      this.config
    );
    this.explainer = new PatchExplainer(this.config);
    this.bobAI = new BobAIExplainer(this.config);
  }

  /**
   * Get GitHub username from commit SHA
   */
  async getGitHubUsername(sha) {
    try {
      const commitResult = await this.github.getCommit(sha);
      if (commitResult.success && commitResult.data.author) {
        return commitResult.data.author.login;
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch GitHub username, using git author');
    }
    return 'unknown';
  }

  /**
   * Generate commit summary for issue comment
   */
  async generateCommitSummary(commitData, params) {
    const statusEmoji = params.status === 'done' ? '✅' : '🚧';
    const statusText = params.status === 'done' ? 'Completed' : 'In Progress';
    
    let summary = `${statusEmoji} **Commit Update** - ${statusText}\n\n`;
    summary += `**Description:** ${params.description}\n\n`;
    summary += `**Commit:** [\`${commitData.sha.substring(0, 7)}\`](${commitData.url})\n`;
    
    // Get GitHub username from commit
    const githubUsername = await this.getGitHubUsername(commitData.sha);
    summary += `**Author:** @${githubUsername}\n`;
    
    summary += `**Date:** ${new Date(commitData.date).toLocaleString('en-US', {
      timeZone: process.env.TZ || 'UTC',
      dateStyle: 'medium',
      timeStyle: 'short'
    })}\n\n`;

    // Add AI-powered patch explanation using Bob CLI
    if (commitData.diff && commitData.files && commitData.files.length > 0) {
      console.log('🤖 Generating AI explanation of the patch...');
      
      try {
        // Try Bob AI - will throw if it fails
        const explanation = await this.bobAI.explainWithBob(
          commitData.diff,
          commitData.files,
          params.description
        );
        
        summary += explanation + '\n\n';
      } catch (error) {
        console.error('❌ Bob AI failed:', error.message);
        console.log('⚠️  Skipping AI explanation, posting basic comment');
        // Continue without AI explanation rather than failing completely
      }
    }

    // Add files changed if available
    if (commitData.files && commitData.files.length > 0) {
      summary += `## 📂 Files Changed\n\n`;
      commitData.files.forEach(file => {
        const status = file.status === 'added' ? '➕' :
                      file.status === 'removed' ? '➖' :
                      file.status === 'modified' ? '📝' : '📄';
        summary += `- ${status} \`${file.filename}\``;
        if (file.additions || file.deletions) {
          summary += ` (+${file.additions || 0}/-${file.deletions || 0})`;
        }
        summary += '\n';
      });
      summary += '\n';
    }

    // Add raw diff if configured
    if (this.config.automation.comment.include_diff && commitData.diff) {
      const diffLines = commitData.diff.split('\n');
      const maxLines = this.config.automation.comment.max_diff_lines || 50;
      
      summary += `<details>\n<summary>📋 View Raw Diff</summary>\n\n`;
      if (diffLines.length > maxLines) {
        summary += '```diff\n';
        summary += diffLines.slice(0, maxLines).join('\n');
        summary += '\n... (truncated)\n```\n';
      } else {
        summary += '```diff\n';
        summary += commitData.diff;
        summary += '\n```\n';
      }
      summary += '</details>\n\n';
    }

    summary += '---\n';
    summary += '*🤖 Automated by Bob Sprint Assistant*';

    return summary;
  }

  /**
   * Process a single commit
   */
  async processCommit(commitData) {
    console.log('\n🔍 Processing commit:', commitData.sha.substring(0, 7));
    console.log('📝 Message:', commitData.message.split('\n')[0]);

    // Parse commit message
    const params = this.parser.parseCommitMessage(commitData.message);
    
    // Validate parameters
    const validation = this.parser.validate(params);
    if (!validation.valid) {
      console.log('⏭️  Skipping commit - validation failed:');
      validation.errors.forEach(err => console.log('   -', err));
      return { success: false, skipped: true, errors: validation.errors };
    }

    console.log(`✓ Parsed: issue=#${params.issue}, status=${params.status}`);

    // Check if issue exists
    console.log(`\n🔎 Fetching issue #${params.issue}...`);
    const issueResult = await this.github.getIssue(params.issue);
    if (!issueResult.success) {
      console.error(`❌ Failed to fetch issue #${params.issue}:`, issueResult.error);
      return { success: false, error: issueResult.error };
    }

    console.log(`✓ Issue found: "${issueResult.data.title}"`);

    // Generate commit summary (now async to fetch GitHub username)
    const summary = await this.generateCommitSummary(commitData, params);

    // Post comment to issue
    console.log(`\n💬 Posting comment to issue #${params.issue}...`);
    const commentResult = await this.github.postComment(params.issue, summary);
    if (!commentResult.success) {
      console.error('❌ Failed to post comment:', commentResult.error);
      return { success: false, error: commentResult.error };
    }

    console.log('✓ Comment posted successfully');

    // Handle status-specific actions
    if (params.status === 'done') {
      console.log('\n🎯 Status is "done" - performing completion actions...');

      // Close issue if configured
      if (this.config.automation.projects.close_issue_on_done) {
        console.log(`🔒 Closing issue #${params.issue}...`);
        const closeResult = await this.github.closeIssue(params.issue);
        if (closeResult.success) {
          console.log('✓ Issue closed');
        } else {
          console.error('⚠️  Failed to close issue:', closeResult.error);
        }
      }

      // Add "done" label
      console.log('🏷️  Adding "done" label...');
      const labelResult = await this.github.addLabels(params.issue, ['done']);
      if (labelResult.success) {
        console.log('✓ Label added');
      } else {
        console.error('⚠️  Failed to add label:', labelResult.error);
      }
    } else if (params.status === 'in-progress') {
      console.log('\n🚧 Status is "in-progress" - adding label...');
      const labelResult = await this.github.addLabels(params.issue, ['in-progress']);
      if (labelResult.success) {
        console.log('✓ Label added');
      } else {
        console.error('⚠️  Failed to add label:', labelResult.error);
      }
    }

    console.log('\n✅ Commit processed successfully!');
    console.log(`   View comment: ${commentResult.data.html_url}`);

    return { 
      success: true, 
      issue: params.issue, 
      status: params.status,
      commentUrl: commentResult.data.html_url
    };
  }

  /**
   * Log to file if enabled
   */
  log(message) {
    if (!this.config.logging.enabled) return;

    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'automation.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const commitData = {
    sha: '',
    message: '',
    author: '',
    date: '',
    files: [],
    diff: '',
    url: ''
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'files') {
      // Parse files from git diff-tree output
      commitData.files = value.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [status, filename] = line.split('\t');
          return { status, filename, additions: 0, deletions: 0 };
        });
    } else {
      commitData[key] = value;
    }
  }

  // Generate commit URL
  const processor = new CommitProcessor();
  commitData.url = `https://github.com/${processor.config.github.owner}/${processor.config.github.repo}/commit/${commitData.sha}`;

  // Process the commit
  try {
    const result = await processor.processCommit(commitData);
    processor.log(`Processed commit ${commitData.sha}: ${JSON.stringify(result)}`);
    
    if (result.success) {
      process.exit(0);
    } else if (result.skipped) {
      process.exit(0); // Not an error, just skipped
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    processor.log(`Error processing commit ${commitData.sha}: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CommitProcessor;

// Made with Bob
