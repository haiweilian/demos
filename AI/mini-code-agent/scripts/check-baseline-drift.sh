#!/usr/bin/env bash
#
# mini-agent-full/ 是 mini-agent/ 的完整整合版，两者共享一批"本该逐字相同"的文件
# （五个工具、权限、类型、入口与四个基线测试）。这个脚本盯住它们：
# 只要有人只改了一边，就在这里失败，而不是等读者发现书和代码对不上。
#
# 有意分叉、不在检查范围内的四个文件：
#   src/context.ts    第 7 章加了 MicroCompact
#   src/registry.ts   第 19 章加了 flags 参数与 webFetch 灰度
#   src/agentLoop.ts  第 5/7/8/12/19 章的分区调度、成本、记忆、钩子、埋点
#   src/cli.ts        第 9/16/19 章的命令扩展与 bootstrap 接线
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SHARED=(
  src/permissions.ts
  src/types.ts
  src/index.ts
  src/tools/readFile.ts
  src/tools/writeFile.ts
  src/tools/editFile.ts
  src/tools/runCommand.ts
  src/tools/search.ts
  test/context.test.ts
  test/permissions.test.ts
  test/registry.test.ts
  test/tools.test.ts
)

failed=0
for file in "${SHARED[@]}"; do
  if ! diff -u "$ROOT/mini-agent/$file" "$ROOT/mini-agent-full/$file"; then
    echo "!! drift: $file"
    failed=1
  fi
done

if [ "$failed" -ne 0 ]; then
  echo ""
  echo "mini-agent/ 与 mini-agent-full/ 的共享文件出现分叉。"
  echo "改动应当同步到两边；若这次分叉是有意的，请把该文件从本脚本的 SHARED 列表里移除并说明原因。"
  exit 1
fi

echo "Baseline files are in sync between mini-agent/ and mini-agent-full/."
