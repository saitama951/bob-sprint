/**
 * AI-Powered Patch Explainer
 * Analyzes code diffs and generates human-readable explanations
 */

class PatchExplainer {
  constructor(config) {
    this.config = config;
  }

  /**
   * Analyze a diff and generate explanation
   * @param {string} diff - The git diff
   * @param {Array} files - List of changed files
   * @param {string} commitMessage - The commit message
   * @returns {string} Human-readable explanation
   */
  explainPatch(diff, files, commitMessage) {
    const analysis = {
      filesChanged: files.length,
      additions: 0,
      deletions: 0,
      fileTypes: new Set(),
      changes: []
    };

    // Parse diff to understand changes
    const diffLines = diff.split('\n');
    let currentFile = null;
    let addedLines = [];
    let removedLines = [];

    diffLines.forEach(line => {
      // Track file being modified
      if (line.startsWith('diff --git')) {
        if (currentFile) {
          analysis.changes.push({
            file: currentFile,
            added: addedLines,
            removed: removedLines
          });
        }
        currentFile = line.split(' b/')[1];
        addedLines = [];
        removedLines = [];
        
        // Track file type
        const ext = currentFile.split('.').pop();
        analysis.fileTypes.add(ext);
      }
      
      // Count additions/deletions
      if (line.startsWith('+') && !line.startsWith('+++')) {
        analysis.additions++;
        addedLines.push(line.substring(1).trim());
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        analysis.deletions++;
        removedLines.push(line.substring(1).trim());
      }
    });

    // Add last file
    if (currentFile) {
      analysis.changes.push({
        file: currentFile,
        added: addedLines,
        removed: removedLines
      });
    }

    // Generate explanation
    return this.generateExplanation(analysis, commitMessage, files);
  }

  /**
   * Generate human-readable explanation
   */
  generateExplanation(analysis, commitMessage, files) {
    let explanation = '## 📝 What This Patch Does\n\n';

    // High-level summary
    explanation += this.generateSummary(analysis, commitMessage);
    explanation += '\n\n';

    // Detailed changes per file
    explanation += '## 🔍 Detailed Changes\n\n';
    
    files.forEach(file => {
      const fileAnalysis = analysis.changes.find(c => c.file === file.filename);
      if (fileAnalysis) {
        explanation += this.explainFileChanges(file, fileAnalysis);
        explanation += '\n';
      }
    });

    // Impact assessment
    explanation += this.assessImpact(analysis);

    return explanation;
  }

  /**
   * Generate high-level summary
   */
  generateSummary(analysis, commitMessage) {
    const { additions, deletions, filesChanged, fileTypes } = analysis;
    
    let summary = '';
    
    // Determine change type
    if (additions > deletions * 3) {
      summary += '**Type:** New feature/functionality added\n';
    } else if (deletions > additions * 3) {
      summary += '**Type:** Code cleanup/removal\n';
    } else if (additions > 0 && deletions > 0) {
      summary += '**Type:** Refactoring/modification\n';
    } else if (additions > 0) {
      summary += '**Type:** Addition\n';
    }

    // Scope
    summary += `**Scope:** Modified ${filesChanged} file${filesChanged > 1 ? 's' : ''} `;
    summary += `(${Array.from(fileTypes).join(', ')} files)\n`;
    
    // Size
    const totalChanges = additions + deletions;
    let size = 'Small';
    if (totalChanges > 200) size = 'Large';
    else if (totalChanges > 50) size = 'Medium';
    
    summary += `**Size:** ${size} change (+${additions}/-${deletions} lines)\n`;

    return summary;
  }

  /**
   * Explain changes in a specific file
   */
  explainFileChanges(file, fileAnalysis) {
    let explanation = `### \`${file.filename}\`\n\n`;

    // Determine what was done
    const { added, removed } = fileAnalysis;
    const hasAdditions = added.length > 0;
    const hasRemovals = removed.length > 0;

    if (hasAdditions && hasRemovals) {
      explanation += '**Modified:** ';
      explanation += this.describeModification(added, removed, file.filename);
    } else if (hasAdditions) {
      explanation += '**Added:** ';
      explanation += this.describeAddition(added, file.filename);
    } else if (hasRemovals) {
      explanation += '**Removed:** ';
      explanation += this.describeRemoval(removed, file.filename);
    }

    explanation += '\n';

    // Add specific insights
    const insights = this.extractInsights(added, removed, file.filename);
    if (insights.length > 0) {
      explanation += '\n**Key changes:**\n';
      insights.forEach(insight => {
        explanation += `- ${insight}\n`;
      });
    }

    return explanation;
  }

  /**
   * Describe what was modified
   */
  describeModification(added, removed, filename) {
    const ext = filename.split('.').pop();
    
    // Detect patterns
    const patterns = {
      hasNewFunction: added.some(l => /function|def |const \w+ = \(/.test(l)),
      hasNewClass: added.some(l => /class |interface /.test(l)),
      hasNewImport: added.some(l => /import |require\(|from /.test(l)),
      hasTestChanges: filename.includes('test') || filename.includes('spec'),
      hasConfigChanges: ['json', 'yml', 'yaml', 'toml', 'ini'].includes(ext),
      hasDocChanges: ['md', 'txt', 'rst'].includes(ext)
    };

    if (patterns.hasNewFunction) {
      return 'Refactored existing functions and added new ones';
    } else if (patterns.hasNewClass) {
      return 'Updated class definitions and structure';
    } else if (patterns.hasTestChanges) {
      return 'Updated test cases and assertions';
    } else if (patterns.hasConfigChanges) {
      return 'Modified configuration settings';
    } else if (patterns.hasDocChanges) {
      return 'Updated documentation';
    } else {
      return 'Refactored code logic and implementation';
    }
  }

  /**
   * Describe what was added
   */
  describeAddition(added, filename) {
    const ext = filename.split('.').pop();
    
    if (filename.includes('test') || filename.includes('spec')) {
      return 'New test cases added';
    } else if (['md', 'txt', 'rst'].includes(ext)) {
      return 'New documentation added';
    } else if (added.some(l => /function|def |const \w+ = \(/.test(l))) {
      return 'New functions/methods implemented';
    } else if (added.some(l => /class |interface /.test(l))) {
      return 'New classes/interfaces defined';
    } else {
      return 'New code implementation';
    }
  }

  /**
   * Describe what was removed
   */
  describeRemoval(removed, filename) {
    if (removed.some(l => /function|def |const \w+ = \(/.test(l))) {
      return 'Removed obsolete functions';
    } else if (removed.some(l => /console\.log|print\(|debug/.test(l))) {
      return 'Cleaned up debug statements';
    } else {
      return 'Removed unused code';
    }
  }

  /**
   * Extract specific insights from changes
   */
  extractInsights(added, removed, filename) {
    const insights = [];

    // Check for new dependencies
    const newImports = added.filter(l => /import |require\(|from /.test(l));
    if (newImports.length > 0) {
      insights.push(`Added ${newImports.length} new import${newImports.length > 1 ? 's' : ''}`);
    }

    // Check for new functions
    const newFunctions = added.filter(l => /function |def |const \w+ = \(/.test(l));
    if (newFunctions.length > 0) {
      insights.push(`Implemented ${newFunctions.length} new function${newFunctions.length > 1 ? 's' : ''}`);
    }

    // Check for error handling
    if (added.some(l => /try|catch|throw|error|exception/i.test(l))) {
      insights.push('Added error handling');
    }

    // Check for async operations
    if (added.some(l => /async|await|Promise|\.then\(/.test(l))) {
      insights.push('Introduced asynchronous operations');
    }

    // Check for type definitions
    if (added.some(l => /interface |type |: \w+/.test(l))) {
      insights.push('Added type definitions');
    }

    // Check for tests
    if (filename.includes('test') || filename.includes('spec')) {
      const testCases = added.filter(l => /it\(|test\(|describe\(/.test(l));
      if (testCases.length > 0) {
        insights.push(`Added ${testCases.length} test case${testCases.length > 1 ? 's' : ''}`);
      }
    }

    // Check for comments/documentation
    const comments = added.filter(l => /\/\/|\/\*|\*|#|"""/.test(l.trim()));
    if (comments.length > 3) {
      insights.push('Added inline documentation');
    }

    return insights;
  }

  /**
   * Assess the impact of changes
   */
  assessImpact(analysis) {
    let impact = '\n## 💡 Impact Assessment\n\n';

    const { additions, deletions, fileTypes } = analysis;
    const totalChanges = additions + deletions;

    // Risk level
    let risk = 'Low';
    if (totalChanges > 200 || fileTypes.has('config') || fileTypes.has('yml')) {
      risk = 'Medium';
    }
    if (totalChanges > 500) {
      risk = 'High';
    }

    impact += `**Risk Level:** ${risk}\n`;

    // Testing recommendation
    if (Array.from(fileTypes).some(t => ['test', 'spec'].some(s => t.includes(s)))) {
      impact += `**Testing:** ✅ Tests included in this patch\n`;
    } else {
      impact += `**Testing:** ⚠️ Consider adding tests for these changes\n`;
    }

    // Review recommendation
    if (risk === 'High' || totalChanges > 300) {
      impact += `**Review:** 👀 Thorough code review recommended\n`;
    } else {
      impact += `**Review:** Standard review process\n`;
    }

    return impact;
  }
}

module.exports = PatchExplainer;

// Made with Bob
