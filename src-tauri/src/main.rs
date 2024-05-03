// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, vec};
use searchuser::ldap::Connexions;
use serde::Serialize;

#[derive(Serialize)]
pub struct Results {
    ldap_attrs: Vec<String>,
    ad_attrs: Vec<String>,
    ldap_res: Vec<HashMap<String, Vec<String>>>,
    ad_res: Vec<HashMap<String, Vec<String>>>,
}


#[tauri::command]
async fn search_results(filter: String) -> Results {
    let settings_filename = "../conf.toml";
    let  con = Connexions::new(settings_filename);
    let ldap_attrs = con.conf.ldap.attrs_search.clone();
    let ad_attrs = con.conf.ad.attrs_search.clone();
    let vec_res = con.search(filter).await;
    // search renvoie forcément un vec de deux résultats de recherche ldap et AD
    Results { 
        ldap_attrs,
        ad_attrs,
        ldap_res: vec_res[0].clone(),  
        ad_res: vec_res[1].clone()
    }
}

// #[tauri::command]
// async fn display_entry(directory: String, filter: String) -> HashMap<String<Vec<String>>> {
//     let settings_filename = "../conf.toml";
//     let  con = Connexions::new(settings_filename);
//     let attrs: Vec<String>;
//     match directory.as_str() {
//         "ldap" => attrs = con.conf.ldap.attrs_search.clone(),
//         "ad" => attrs = con.conf.ad.attrs_search.clone(),
//         _ =>  return HashMap::from(["a", ["a"]])
//     }
// }


fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![search_results])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
