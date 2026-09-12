// src/utils/reporter.ts
import type { AggregatedReport, ReviewFinding, Severity } from '../tasks/types.js'

/**
 * 将聚合报告格式化为人类可读的终端输出。
 */
export function formatReport(report: AggregatedReport): string {
  const lines: string[] = []

  // ━━━━ 头部 ━━━━
  lines.push('')
  lines.push('═'.repeat(60))
  lines.push('  MULTI-AGENT CODE REVIEW REPORT')
  lines.push('═'.repeat(60))
  lines.push('')
  lines.push(`  Project:    ${report.projectPath}`)
  lines.push(`  Timestamp:  ${report.timestamp}`)
  lines.push(`  Files:      ${report.totalFiles}`)
  lines.push(`  Workers:    ${report.executionStats.workersUsed}`)
  lines.push(`  Duration:   ${(report.executionStats.totalDurationMs / 1000).toFixed(1)}s`)
  lines.push(`  Tokens:     ${report.executionStats.totalTokens.toLocaleString()}`)
  lines.push('')

  // ━━━━ 判定 ━━━━
  const verdictSymbol = report.verdict === 'PASS' ? '[PASS]'
    : report.verdict === 'FAIL' ? '[FAIL]'
    : '[WARN]'
  lines.push(`  Verdict: ${verdictSymbol}`)
  lines.push('')

  // ━━━━ 发现统计 ━━━━
  lines.push('─'.repeat(60))
  lines.push('  FINDINGS SUMMARY')
  lines.push('─'.repeat(60))
  lines.push(`  Total:    ${report.totalFindings}`)
  if (report.criticalCount > 0) lines.push(`  Critical: ${report.criticalCount}`)
  if (report.highCount > 0) lines.push(`  High:     ${report.highCount}`)
  if (report.mediumCount > 0) lines.push(`  Medium:   ${report.mediumCount}`)
  if (report.lowCount > 0) lines.push(`  Low:      ${report.lowCount}`)
  if (report.infoCount > 0) lines.push(`  Info:     ${report.infoCount}`)
  lines.push('')

  // ━━━━ Worker 详情 ━━━━
  for (const result of report.workerResults) {
    lines.push('─'.repeat(60))
    lines.push(`  ${result.workerType.toUpperCase()} WORKER`)
    lines.push('─'.repeat(60))
    lines.push(`  Files analyzed: ${result.filesAnalyzed}`)
    lines.push(`  Findings:       ${result.findings.length}`)
    lines.push(`  Duration:       ${(result.durationMs / 1000).toFixed(1)}s`)
    lines.push(`  Tokens:         ${result.tokensUsed.toLocaleString()}`)
    lines.push(`  Summary:        ${result.summary}`)
    lines.push('')
  }

  // ━━━━ Top Findings ━━━━
  if (report.topFindings.length > 0) {
    lines.push('─'.repeat(60))
    lines.push('  TOP FINDINGS')
    lines.push('─'.repeat(60))
    lines.push('')

    for (let i = 0; i < report.topFindings.length; i++) {
      const f = report.topFindings[i]!
      lines.push(formatFinding(i + 1, f))
      lines.push('')
    }
  }

  lines.push('═'.repeat(60))
  lines.push('')

  return lines.join('\n')
}

function formatFinding(index: number, f: ReviewFinding): string {
  const severityTag = formatSeverity(f.severity)
  const location = f.line ? `${f.file}:${f.line}` : f.file
  const lines = [
    `  ${index}. ${severityTag} ${f.category}`,
    `     Location: ${location}`,
    `     ${f.description}`,
  ]
  if (f.suggestion) {
    lines.push(`     Fix: ${f.suggestion}`)
  }
  if (f.codeSnippet) {
    lines.push(`     Code: ${f.codeSnippet}`)
  }
  return lines.join('\n')
}

function formatSeverity(severity: Severity): string {
  const tags: Record<Severity, string> = {
    critical: '[CRITICAL]',
    high:     '[HIGH]    ',
    medium:   '[MEDIUM]  ',
    low:      '[LOW]     ',
    info:     '[INFO]    ',
  }
  return tags[severity]
}

/**
 * 生成 JSON 格式的报告（适合机器解析）。
 */
export function formatJsonReport(report: AggregatedReport): string {
  return JSON.stringify(report, null, 2)
}
