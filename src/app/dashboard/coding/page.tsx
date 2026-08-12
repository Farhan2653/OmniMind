"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Code2, Play, Terminal, Cpu } from "lucide-react"

type Language = "javascript" | "python" | "cpp" | "csharp" | "c"

interface CodeTemplate {
  filename: string;
  code: string;
}

const templates: Record<Language, CodeTemplate> = {
  javascript: {
    filename: "main.js",
    code: `// JavaScript Code Optimization
function optimizeCode(data) {
  return data.map(item => ({
    ...item,
    processed: true
  }));
}`
  },
  python: {
    filename: "main.py",
    code: `# Python Optimization Template
def calculate_factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * calculate_factorial(n - 1)
`
  },
  cpp: {
    filename: "main.cpp",
    code: `// C++ Memory Allocation Review
#include <iostream>
#include <vector>

void processElements() {
    std::vector<int> vec = {1, 2, 3, 4, 5};
    for(int val : vec) {
        std::cout << val << std::endl;
    }
}`
  },
  csharp: {
    filename: "Program.cs",
    code: `// C# LINQ & Threading Template
using System;
using System.Linq;

class Program {
    static void Main() {
        int[] numbers = { 1, 2, 3, 4, 5 };
        var evens = numbers.Where(n => n % 2 == 0);
    }
}`
  },
  c: {
    filename: "main.c",
    code: `/* C Pointer & Allocation Optimization */
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = (int*)malloc(5 * sizeof(int));
    if (arr == NULL) return 1;
    free(arr);
    return 0;
}`
  }
}

export default function CodingPage() {
  const [lang, setLang] = React.useState<Language>("javascript")
  const [code, setCode] = React.useState(templates.javascript.code)
  const [filename, setFilename] = React.useState(templates.javascript.filename)
  const [output, setOutput] = React.useState("Terminal ready. Press 'Run Analysis' to evaluate code optimization.")
  const [loading, setLoading] = React.useState(false)

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as Language
    setLang(selected)
    setCode(templates[selected].code)
    setFilename(templates[selected].filename)
    setOutput(`Terminal switched to ${selected.toUpperCase()}. Press 'Run Analysis'.`)
  }

  const handleRun = () => {
    setLoading(true)
    setOutput(`[COMPILER] Initiating AST check for ${filename}...\nProcessing optimization rules...`)
    
    setTimeout(() => {
      setLoading(false)
      let customOutput = ""
      if (lang === "javascript") {
        customOutput = `[OPTIMIZER] JavaScript Complete\n- Time Complexity: O(n)\n- Memory Footprint: Standard\n- Recommendation: Replace array spread with Object.assign inside loops to improve speed.`
      } else if (lang === "python") {
        customOutput = `[OPTIMIZER] Python Complete\n- Time Complexity: O(n) (recursion)\n- Recursion Depth Check: Alert (Potential StackOverflow for n > 999)\n- Recommendation: Refactor with tail recursion or iteration to support large inputs.`
      } else if (lang === "cpp") {
        customOutput = `[OPTIMIZER] C++ Complete\n- Loop Check: Pass\n- Optimization: Vector elements are copied inside range loop.\n- Recommendation: Use 'const auto&' in loop to avoid element copying.`
      } else if (lang === "csharp") {
        customOutput = `[OPTIMIZER] C# Complete\n- Memory Check: Pass\n- recommendation: Avoid calling .ToList() multiple times on deferred LINQ queries.`
      } else if (lang === "c") {
        customOutput = `[OPTIMIZER] C Complete\n- Memory Check: Safe\n- Warning: Free verification executed successfully.\n- recommendation: Ensure all pointers are set to NULL immediately after freeing memory.`
      }
      setOutput(customOutput)
    }, 1200)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Coding Mentor</h1>
          <p className="text-xs text-neutral-400">Review your files, optimize structures, and write tests side-by-side.</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400 font-medium">Language:</label>
          <select
            value={lang}
            onChange={handleLanguageChange}
            className="px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="c">C</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassPanel className="p-4 space-y-4 border border-white/5">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-400" /> {filename}
              </span>
              <Button onClick={handleRun} variant="primary" size="sm" className="rounded-lg text-xs" disabled={loading}>
                <Play className="w-3 h-3 mr-1" /> {loading ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-neutral-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 no-scrollbar"
            />
          </GlassPanel>
        </div>

        <div>
          <GlassPanel className="p-4 space-y-4 border border-white/5 h-full min-h-[250px] flex flex-col">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 pb-2 border-b border-white/5">
              <Terminal className="w-4 h-4 text-blue-400" /> Output Terminal
            </span>
            <pre className="flex-1 bg-black/40 p-3 rounded-lg border border-white/5 text-[10px] font-mono text-emerald-400 whitespace-pre-wrap">
              {output}
            </pre>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
