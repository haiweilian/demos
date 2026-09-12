// src/aggregator/resultAggregator.ts
import type {
  AggregatedReport,
  ReviewFinding,
  ReviewResult,
  Severity,
} from '../tasks/types.js'

/**
 * 结果聚合器——将多个 Worker 的发现合并为统一报告。
 * 做四件事：
 * 1. 去重：不同 Worker 可能发现同一个问题
 * 2. 排序：按严重程度和文件位置排列
 * 3. 判定：根据发现情况给出 PASS/FAIL/WARN 判定
 * 4. 统计：汇总分析指标
 */
export class ResultAggregator {
  /**
   * 聚合所有 Worker 的结果。
   */
  aggregate(
    results: ReviewResult[],
    projectPath: string,
  ): AggregatedReport {
    const startTime = Date.now()

    // 收集所有发现
    const allFindings = results.flatMap(r => r.findings)

    // 去重
    const deduplicated = this.deduplicateFindings(allFindings)

    // 按严重程度排序
    const sorted = this.sortFindings(deduplicated)

    // 统计各严重程度的数量
    const counts = this.countBySeverity(sorted)

    // 判定
    const verdict = this.determineVerdict(counts)

    // 计算总执行时间和 token 消耗
    const totalDurationMs = results.reduce((sum, r) => sum + r.durationMs, 0)
    const totalTokens = results.reduce((sum, r) => sum + r.tokensUsed, 0)

    return {
      projectPath,
      timestamp: new Date().toISOString(),
      totalFiles: results.reduce((sum, r) => sum + r.filesAnalyzed, 0),
      totalFindings: sorted.length,
      ...counts,
      workerResults: results,
      topFindings: sorted.slice(0, 20),
      verdict,
      executionStats: {
        totalDurationMs,
        totalTokens,
        workersUsed: results.length,
      },
    }
  }

  /**
   * 去重——相同文件、相同行、相同类别的发现合并，保留严重程度更高的那个。
   */
  private deduplicateFindings(findings: ReviewFinding[]): ReviewFinding[] {
    const seen = new Map<string, ReviewFinding>()
    const severityOrder: Record<Severity, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      info: 1,
    }

    for (const finding of findings) {
      const key = `${finding.file}:${finding.line ?? 'none'}:${finding.category}`
      const existing = seen.get(key)

      if (!existing || severityOrder[finding.severity] > severityOrder[existing.severity]) {
        seen.set(key, finding)
      }
    }

    return Array.from(seen.values())
  }

  /**
   * 排序——critical 在前，同严重程度按文件路径排列。
   */
  private sortFindings(findings: ReviewFinding[]): ReviewFinding[] {
    const severityOrder: Record<Severity, number> = {
      critical: 0, high: 1, medium: 2, low: 3, info: 4,
    }

    return [...findings].sort((a, b) => {
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity]
      if (sevDiff !== 0) return sevDiff
      return a.file.localeCompare(b.file)
    })
  }

  /**
   * 统计各严重程度的数量。
   */
  private countBySeverity(findings: ReviewFinding[]): {
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
    infoCount: number
  } {
    return {
      criticalCount: findings.filter(f => f.severity === 'critical').length,
      highCount: findings.filter(f => f.severity === 'high').length,
      mediumCount: findings.filter(f => f.severity === 'medium').length,
      lowCount: findings.filter(f => f.severity === 'low').length,
      infoCount: findings.filter(f => f.severity === 'info').length,
    }
  }

  /**
   * 根据发现情况给出判定。
   * 对标 Claude Code 源码中 Verification Agent 的 VERDICT 机制。
   */
  private determineVerdict(counts: {
    criticalCount: number
    highCount: number
    mediumCount: number
  }): 'PASS' | 'FAIL' | 'WARN' {
    if (counts.criticalCount > 0) return 'FAIL'
    if (counts.highCount >= 3) return 'FAIL'
    if (counts.highCount > 0 || counts.mediumCount >= 5) return 'WARN'
    return 'PASS'
  }
}
