// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use reqwest::{Error};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct AIFlowChartInput {
  pub prompt: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AIFlowChartParams {
  pub model: String,
  pub input: AIFlowChartInput
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AIFlowChartResponse {
  pub data: String
}

#[tauri::command]
async fn generate_flow_chart(flow_content: &str)  -> Result<AIFlowChartResponse, ()> {
  println!("{:?}", flow_content);
  let params = AIFlowChartParams {model: "qwen-max".to_string(), input: AIFlowChartInput{prompt: format!("使用mermaid.js语法生成一张流程图，不能出现中文符号，流程内容为{}", flow_content)}};
  let resp = reqwest::Client::new().post("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation")
    .header("Content-Type", "application/json")
    .header("Authorization", "sk-6930f34d8cb449da8b6007297dfea203")
    .json(&params)
    .send()
    .await;
  match resp {
    Ok(res) => {
      // println!("{:?}", res.text().await);
      match res.text().await {
        Ok(data) => {
          println!("{:?}", data);
          return Ok(AIFlowChartResponse {data: data})
        },
        Err(_) => {
          return Err(());
        }
      };
    },
    Err(_) => {
      return Err(());
    }
  };
}

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![generate_flow_chart])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}
