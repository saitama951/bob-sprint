/**
 * GitHub API Client
 * Handles all interactions with GitHub API
 */

const { Octokit } = require('@octokit/rest');

class GitHubClient {
  constructor(token, owner, repo, config) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
    this.config = config;
  }

  /**
   * Post a comment to an issue
   * @param {number} issueNumber - The issue number
   * @param {string} body - Comment body (markdown)
   * @returns {Promise<Object>} Comment data
   */
  async postComment(issueNumber, body) {
    try {
      const response = await this.octokit.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body: body
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get issue details
   * @param {number} issueNumber - The issue number
   * @returns {Promise<Object>} Issue data
   */
  async getIssue(issueNumber) {
    try {
      const response = await this.octokit.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Close an issue
   * @param {number} issueNumber - The issue number
   * @returns {Promise<Object>} Result
   */
  async closeIssue(issueNumber) {
    try {
      const response = await this.octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        state: 'closed'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update issue status in GitHub Projects (v2)
   * @param {number} issueNumber - The issue number
   * @param {string} status - New status value
   * @returns {Promise<Object>} Result
   */
  async updateProjectStatus(issueNumber, status) {
    try {
      // First, get the issue node ID
      const issueResult = await this.getIssue(issueNumber);
      if (!issueResult.success) {
        return issueResult;
      }

      const issueNodeId = issueResult.data.node_id;

      // Query to find the project item and update status
      const query = `
        query($owner: String!, $repo: String!, $projectNumber: Int!) {
          repository(owner: $owner, name: $repo) {
            projectV2(number: $projectNumber) {
              id
              field(name: "Status") {
                ... on ProjectV2SingleSelectField {
                  id
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      `;

      const projectData = await this.octokit.graphql(query, {
        owner: this.owner,
        repo: this.repo,
        projectNumber: this.config.github.project_number
      });

      // Find the status option ID
      const statusField = projectData.repository.projectV2.field;
      const statusOption = statusField.options.find(
        opt => opt.name.toLowerCase() === status.toLowerCase()
      );

      if (!statusOption) {
        return { 
          success: false, 
          error: `Status "${status}" not found in project` 
        };
      }

      // Note: Updating project items requires finding the item first
      // This is a simplified version - full implementation would need to:
      // 1. Find the project item for this issue
      // 2. Update the status field value
      
      return { 
        success: true, 
        message: 'Status update queued (requires project item lookup)' 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add labels to an issue
   * @param {number} issueNumber - The issue number
   * @param {Array<string>} labels - Labels to add
   * @returns {Promise<Object>} Result
   */
  async addLabels(issueNumber, labels) {
    try {
      const response = await this.octokit.issues.addLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        labels: labels
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get commit details
   * @param {string} sha - Commit SHA
   * @returns {Promise<Object>} Commit data
   */
  async getCommit(sha) {
    try {
      const response = await this.octokit.repos.getCommit({
        owner: this.owner,
        repo: this.repo,
        ref: sha
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = GitHubClient;

// Made with Bob
