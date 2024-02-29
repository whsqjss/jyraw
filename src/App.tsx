import { Excalidraw, MainMenu, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { useRef, useState } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import './index.css';
import { Button } from "antd";
import AIGCModal from "./components/AIGCModal";
import AIGCApiKeyModal from "./components/AIGCApiKeyModal";

function App() {
  const [elements, setElements] = useState<any>(null)
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const aigcRef = useRef<any>()
  const aigcSettingsRef = useRef<any>()

  return (
    <>
      {/*<h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>*/}
      <div style={{ height: "100vh" }}>
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          langCode={'zh-CN'}
          initialData={{
            elements: elements
          }}
          renderTopRightUI={() => {
            return (
              <Button
                type="primary"
                onClick={() => {
                  aigcRef.current?.show()
                }}
              >
                AIGC
              </Button>
            );
          }}
        >
          <MainMenu>
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.SaveToActiveFile />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.Export />
            <MainMenu.Item onSelect={() =>{aigcSettingsRef.current?.show()}}>
              通义千问-apiKey
            </MainMenu.Item>
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
        </Excalidraw>
      </div>
      <AIGCApiKeyModal ref={aigcSettingsRef} />
      <AIGCModal
        ref={aigcRef}
        onFinish={(resText: string) => {
          if(resText?.length > 0) {
            parseMermaidToExcalidraw(resText).then(parseRes => {
              parseRes?.elements.forEach((element: any) => {
                console.log(element.label?.text)
                if(element.label && element.label.text) {
                  element.label.text = `"${element.label?.text}"`
                }
              })
              const elementIds: readonly string[] = parseRes?.elements.map(e => e.id as string)
              parseRes?.elements.push({
                "type": "frame",
                "children": elementIds,
                "name": "AIGC"
              })
              const excalidrawElements = convertToExcalidrawElements(parseRes.elements);
              setElements(excalidrawElements)
              excalidrawAPI?.updateScene({ elements: excalidrawElements });
            })
          }
        }}
      />
    </>
  );
}

export default App;
