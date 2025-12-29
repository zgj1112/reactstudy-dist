import React, { useEffect, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { Card, Button } from "antd";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
  },
});

interface CodeEditorProps {
  initialCode?: string;
  language?: "javascript" | "rust";
  title?: string;
  onRun?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = "console.log('1111');\n\n\n\n\n\n\n",
  language = "javascript",
  title = "代码编辑器",
  onRun,
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [editHeight, setEditHeight] = useState("250px");
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code);
      return;
    }

    if (language === "javascript") {
      try {
        // 清空之前的输出
        setOutput("");

        // 创建输出缓冲区
        const outputBuffer: string[] = [];

        // 保存原始的console.log
        const originalConsoleLog = console.log;

        // 重写console.log来捕捉输出
        console.log = (...args: any[]) => {
          const formattedArgs = args
            .map((arg) => {
              if (typeof arg === "object") {
                return JSON.stringify(arg, null, 2);
              }
              return String(arg);
            })
            .join(" ");
          outputBuffer.push(formattedArgs);
          // 实时更新输出
          setOutput(outputBuffer.join("\n"));
          // 同时调用原始的console.log
          originalConsoleLog.apply(console, args);
        };

        // 尝试执行代码
        const result = eval(code);
        // 如果代码有返回值，也显示出来
        if (result !== undefined) {
          outputBuffer.push(
            `返回值: ${
              typeof result === "object"
                ? JSON.stringify(result, null, 2)
                : String(result)
            }`
          );
          setOutput(outputBuffer.join("\n"));
        }

        // 恢复原始的console.log
        console.log = originalConsoleLog;
      } catch (e: any) {
        setOutput(`执行错误: ${e.message}`);
        console.error("执行错误:", e);
      }
    } else {
      alert("Rust 运行需要后端或 WASM 支持");
    }
  };
  // 1. 无依赖项的 useEffect
  useEffect(() => {
    handleRun();
  }, []);

  return (
    <Card title="代码测试" style={{ maxWidth: 800, margin: "40px auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Button onClick={handleRun} style={{ width: "200px", height: "40px" }}>
          运行 {language === "javascript" ? "JavaScript" : "Rust"}
        </Button>
        <div style={{ border: "1px solid #EEEEEE" }}>
          <Editor
            height="250px"
            language={language}
            value={code}
            onChange={(v) => {
              setCode(v || "");
              setEditHeight(editorRef.current.scrollHeight + "px");
            }}
            onMount={handleEditorDidMount}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              theme: "vs",
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>
        <h3 style={{ margin: "0px" }}>运行结果</h3>
        <div
          style={{
            border: "1px solid #EEEEEE",
            overflow: "auto",
            height: "250px",
            padding: "10px",
            backgroundColor: "#fafafa",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
          }}
        >
          {output || " "}
        </div>
      </div>
    </Card>
  );
};

export default CodeEditor;
