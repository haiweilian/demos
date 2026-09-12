// src/tools/editFile.ts
// 对应 Claude Code: src/tools/FileEditTool/FileEditTool.ts

import * as fs from "fs/promises";
import * as path from "path";
import type { Tool, ToolResult } from "../types.js";

export const EditFileTool: Tool = {
  name: "Edit",
  description:
    "Replace an exact string in a file with a new string. " +
    "The old_string MUST appear exactly once in the file, unless " +
    "replace_all is true. Include enough surrounding context in " +
    "old_string to make the match unique. " +
    "You must read the file with ReadFile before editing it.",
  inputSchema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description:
          "The path to the file to edit. Can be absolute or relative to cwd.",
      },
      old_string: {
        type: "string",
        description:
          "The exact text to find and replace. Must match the file " +
          "byte-for-byte, including indentation and line breaks.",
      },
      new_string: {
        type: "string",
        description:
          "The text to replace old_string with. Must differ from old_string.",
      },
      replace_all: {
        type: "string",
        description:
          "Set to 'true' to replace every occurrence. " +
          "Default: replace exactly one unique occurrence.",
      },
    },
    required: ["file_path", "old_string", "new_string"],
  },
  isReadOnly: false,
  async execute(
    args: Record<string, unknown>,
    cwd: string,
  ): Promise<ToolResult> {
    const filePath = args.file_path as string;
    const oldString = args.old_string as string;
    const newString = args.new_string as string;
    const replaceAll = (args.replace_all as string) === "true";

    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(cwd, filePath);

    // 关卡 0：old 与 new 不能相同，否则是一次空操作
    if (oldString === newString) {
      return {
        content:
          "Error: old_string and new_string are identical. " +
          "Nothing to change.",
        isError: true,
      };
    }

    try {
      // 关卡 1：先读后写——文件必须存在且可读
      let fileContent: string;
      try {
        fileContent = await fs.readFile(resolvedPath, "utf-8");
      } catch {
        return {
          content:
            `Error: File not found or unreadable: ${resolvedPath}. ` +
            `Read the file with ReadFile before editing it.`,
          isError: true,
        };
      }

      // 关卡 2：唯一匹配校验
      const matches = fileContent.split(oldString).length - 1;

      if (matches === 0) {
        return {
          content:
            `Error: old_string not found in ${resolvedPath}. ` +
            `It must match the file exactly, including whitespace ` +
            `and indentation. Re-read the file to copy the exact text.`,
          isError: true,
        };
      }

      if (matches > 1 && !replaceAll) {
        return {
          content:
            `Error: Found ${matches} matches of old_string in ` +
            `${resolvedPath}, but replace_all is not set. ` +
            `Add more surrounding context to make the match unique, ` +
            `or set replace_all to "true" to replace all occurrences.`,
          isError: true,
        };
      }

      // 关卡 3：执行替换
      const updated = replaceAll
        ? fileContent.split(oldString).join(newString)
        : fileContent.replace(oldString, newString);

      await fs.writeFile(resolvedPath, updated, "utf-8");

      const replacedCount = replaceAll ? matches : 1;
      return {
        content:
          `Edited ${resolvedPath}: replaced ${replacedCount} ` +
          `occurrence${replacedCount > 1 ? "s" : ""}.`,
        isError: false,
      };
    } catch (err) {
      const error = err as Error;
      return {
        content: `Error editing file: ${error.message}`,
        isError: true,
      };
    }
  },
};
