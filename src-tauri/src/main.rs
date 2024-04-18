// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
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
    let (ldap_res, ad_res) = con.search(filter).await;
    Results { 
        ldap_attrs,
        ad_attrs,
        ldap_res,  
        ad_res
    }
}


fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![search_results])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
