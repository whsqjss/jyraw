import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import {invoke} from "@tauri-apps/api/tauri";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import {useState} from "react";

const generateFlowchart = async (flowDefine: string) => {
    const res = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'sk-6930f34d8cb449da8b6007297dfea203',
        },
        body: JSON.stringify({
            "model": "qwen-max",
            "input": {
                "prompt": `使用mermaid.js语法生成一张流程图，不能出现中文符号，流程内容为${flowDefine}`
            }
        })
    })
    const data = await res.json()
    console.log(data)
}

function App() {
  const [elements, setElements] = useState<any>(null)
  return (
      <>
        {/*<h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>*/}
        <div style={{ height: "100vh" }}>
          <Excalidraw
              excalidrawAPI={}
              langCode={'zh-CN'}
              initialData={{
                  elements: elements
              }}
              renderTopRightUI={() => {
                  return (
                      <button
                          style={{
                              background: "#70b1ec",
                              border: "none",
                              color: "#fff",
                              width: "max-content",
                              fontWeight: "bold",
                          }}
                          onClick={() => {
                              invoke('generate_flow_chart', {flowContent: '外贸服饰报关'}).then(res => {
                                  const resJson = JSON.parse((res as any).data)
                                  console.log(resJson)
                                  if(resJson?.output?.text) {
                                      const resText = resJson?.output?.text as string
                                      const mermaidJS = resText.split("```mermaid")[1].split("```")[0]
                                      parseMermaidToExcalidraw(mermaidJS).then(parseRes => {
                                          const excalidrawElements = convertToExcalidrawElements(parseRes.elements);
                                          setElements(excalidrawElements)
                                      })
                                  }
                              })
                          }}
                      >
                          Click me
                      </button>
                  );
              }}
          />
        </div>
      </>
  );
}

export default App;
