// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use reqwest::{Error, Response};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{Manager, Wry};
use tauri_plugin_store::{with_store, StoreCollection, JsonValue};

mod app;
use app::settings::AppSettings;
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

async fn model_call(prompt: String, api_key: String) -> Result<Response, Error> {
  let params: AIFlowChartParams = AIFlowChartParams {model: "qwen-max".to_string(), input: AIFlowChartInput{prompt: prompt}};
  let resp = reqwest::Client::new().post("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation")
    .header("Content-Type", "application/json")
    .header("Authorization", api_key)
    .json(&params)
    .send()
    .await;
  resp
}

#[tauri::command]
async fn generate_flow_chart(flow_content: &str, app: tauri::AppHandle)  -> Result<AIFlowChartResponse, ()> {
  println!("{:?}", flow_content);
  let app_settings = get_app_settings(app);
  match app_settings {
      Ok(settings) => {
        let prompt = format!("使用mermaid.js语法生成一张流程图，流程内容为{}", flow_content);
        println!("{:?}", prompt);
        let resp = model_call(prompt, settings.aigc_api_key).await;
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
      },
      Err(_) => {
        return Err(());
      }
  }
}

#[tauri::command]
async fn generate_mindmap(map_content: &str, app: tauri::AppHandle)  -> Result<AIFlowChartResponse, ()> {
  let app_settings = get_app_settings(app);
  match app_settings {
      Ok(settings) => {
        let prompt = format!("使用mermaid.js语法生成一张思维导图(mindmap)，思维导图的内容为{}，图的布局采用左右布局。", map_content);
        println!("{:?}", prompt);
        let resp = model_call(prompt, settings.aigc_api_key).await;
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
      },
      Err(_) => {
        return Err(());
      }
  }
}

#[tauri::command]
fn get_app_settings(app: tauri::AppHandle) -> Result<AppSettings, ()> {
  let stores = app.state::<StoreCollection<Wry>>();
  let path = PathBuf::from(".settings.json");
  let settings: Result<JsonValue, tauri_plugin_store::Error> = with_store(app.app_handle(), stores, path, |store| {
    println!("{:?}", store.get("settings".to_string()));
    let stored_settings: Option<&JsonValue> = store.get("settings".to_string());
    Ok(json!(stored_settings))
  });
  match settings {
      Ok(s) => {
        let app_settings = serde_json::from_value::<AppSettings>(s);
        match app_settings {
            Ok(s) => {
              return Ok(s);
            },
            Err(_) => return Err(())
        }
      },
      Err(_) => {
        return Err(())
      }
  }
}

#[tauri::command]
fn set_app_settings(settings: AppSettings, app: tauri::AppHandle) -> Result<(), ()> {
  let stores = app.state::<StoreCollection<Wry>>();
  let path = PathBuf::from(".settings.json");
  let _ = with_store(app.app_handle(), stores, path, |store| {
    println!("{:?}", store.get("settings".to_string()));
    let _ = store.insert("settings".to_string(), json!(settings));
    store.save();

    Ok(())
  });
  Ok(())
}


fn main() {
  tauri::Builder::default()
  .plugin(tauri_plugin_store::Builder::default().build())
  .setup(|app| {
    let stores = app.state::<StoreCollection<Wry>>();

    let path = PathBuf::from(".settings.json");

    let _ = with_store(app.app_handle(), stores, path, |store| {
      println!("setup defaultSettings,{:?}", store);
      // let default_settings = AppSettings { launch_at_login: false, theme: "dark".to_string(), aigc_api_key: "".to_string() };
      // store.insert("settings".to_string(), json!(default_settings));
      store.save()
    });
    Ok(())
  })
  .invoke_handler(tauri::generate_handler![generate_flow_chart, generate_mindmap, get_app_settings, set_app_settings])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}
