// src/main.ts
import { resolve } from 'path'
import { Coordinator } from './coordinator.js'
import { formatReport, formatJsonReport } from './utils/reporter.js'

/**
 * 多代理代码审查系统入口。
 *
 * 使用方式：
 *   ANTHROPIC_API_KEY=xxx npx tsx src/main.ts <repo-path>
 *   ANTHROPIC_API_KEY=xxx npx tsx src/main.ts . --json
 *   ANTHROPIC_API_KEY=xxx npx tsx src/main.ts ./my-project --model claude-haiku-4-5-20251001
 */
async function main(): Promise<void> {
  // 解析命令行参数
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage()
    process.exit(0)
  }

  const projectPath = resolve(args[0]!)
  const jsonOutput = args.includes('--json')
  const modelFlag = args.indexOf('--model')
  const model = modelFlag >= 0 ? args[modelFlag + 1] : undefined

  // 检查 API Key
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required')
    console.error('')
    console.error('Usage:')
    console.error('  ANTHROPIC_API_KEY=sk-ant-... npx tsx src/main.ts <path>')
    process.exit(1)
  }

  // 创建 Coordinator 并执行审查
  const coordinator = new Coordinator(apiKey, { model })

  try {
    const report = await coordinator.review(projectPath)

    // 输出报告
    if (jsonOutput) {
      console.log(formatJsonReport(report))
    } else {
      console.log(formatReport(report))
    }

    // 用退出码表示审查结果
    if (report.verdict === 'FAIL') {
      process.exit(1)
    } else if (report.verdict === 'WARN') {
      process.exit(0) // WARN 不阻塞 CI
    } else {
      process.exit(0)
    }
  } catch (error) {
    console.error('\nReview failed:', error instanceof Error ? error.message : error)
    process.exit(2)
  }
}

function printUsage(): void {
  console.log(`
  Multi-Agent Code Review System
  ===============================

  Usage:
    ANTHROPIC_API_KEY=xxx npx tsx src/main.ts <project-path> [options]

  Options:
    --json        Output report as JSON (default: formatted text)
    --model <m>   Claude model to use (default: claude-sonnet-4-20250514)
    --help, -h    Show this help message

  Examples:
    ANTHROPIC_API_KEY=sk-ant-... npx tsx src/main.ts .
    ANTHROPIC_API_KEY=sk-ant-... npx tsx src/main.ts ./my-app --json
    ANTHROPIC_API_KEY=sk-ant-... npx tsx src/main.ts . --model claude-haiku-4-5-20251001

  Exit Codes:
    0 - PASS or WARN (no critical/high-severity issues)
    1 - FAIL (critical or multiple high-severity issues found)
    2 - System error (scan failed, API error, etc.)
`)
}

main()
