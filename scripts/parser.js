/**
 * Commit Message Parser
 * Extracts issue number and status from commit messages
 */

class CommitParser {
  constructor(config) {
    this.config = config;
  }

  /**
   * Parse commit message to extract parameters
   * @param {string} message - The commit message
   * @returns {Object} Parsed parameters
   */
  parseCommitMessage(message) {
    const params = {
      issue: null,
      status: null,
      description: '',
      isValid: false,
      rawStatus: null
    };

    // Extract issue number (supports: issue: 123, issue: #123, issue:#123)
    const issueMatch = message.match(/issue:\s*#?(\d+)/i);
    if (issueMatch) {
      params.issue = parseInt(issueMatch[1], 10);
    }

    // Extract status (supports: status: done, status:done)
    const statusMatch = message.match(/status:\s*(\S+)/i);
    if (statusMatch) {
      params.rawStatus = statusMatch[1];
      params.status = this.normalizeStatus(statusMatch[1]);
    }

    // Extract description (everything before parameters)
    const descMatch = message.match(/^([\s\S]*?)(?=issue:|status:|$)/i);
    if (descMatch) {
      params.description = descMatch[1].trim();
    }

    // Validate that we have both required parameters
    params.isValid = params.issue !== null && params.status !== null;

    return params;
  }

  /**
   * Normalize status to standard values
   * @param {string} status - Raw status from commit message
   * @returns {string} Normalized status ('in-progress' or 'done')
   */
  normalizeStatus(status) {
    const statusLower = status.toLowerCase();

    // Check in-progress synonyms
    const inProgressKeywords = this.config?.automation?.status_keywords?.in_progress || [
      'in-progress', 'ongoing', 'wip', 'working', 'progress'
    ];
    
    if (inProgressKeywords.includes(statusLower)) {
      return 'in-progress';
    }

    // Check done synonyms
    const doneKeywords = this.config?.automation?.status_keywords?.done || [
      'done', 'completed', 'finished', 'resolved', 'fixed', 'complete'
    ];
    
    if (doneKeywords.includes(statusLower)) {
      return 'done';
    }

    // Return original if no match (will be handled as invalid)
    return statusLower;
  }

  /**
   * Validate parsed parameters
   * @param {Object} params - Parsed parameters
   * @returns {Object} Validation result
   */
  validate(params) {
    const errors = [];

    if (!params.issue) {
      errors.push('Missing or invalid issue number');
    }

    if (!params.status) {
      errors.push('Missing status');
    } else if (!['in-progress', 'done'].includes(params.status)) {
      errors.push(`Invalid status: "${params.rawStatus}". Use: in-progress, ongoing, wip, done, completed, finished`);
    }

    if (!params.description) {
      errors.push('Missing commit description');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = CommitParser;

// Made with Bob
