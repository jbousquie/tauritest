// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, vec};
use searchuser::ldap::Connexions;
use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct Results {
    ldap_attrs: Vec<String>,
    ad_attrs: Vec<String>,
    ldap_res: Vec<HashMap<String, Vec<String>>>,
    ad_res: Vec<HashMap<String, Vec<String>>>,
}


#[tauri::command]
async fn search_results(filter: String) -> Results {
    let settings_filename = "./conf.toml";
    let  con = Connexions::new(settings_filename);
    let ldap_attrs = con.conf.ldap.attrs_search.clone();
    let ad_attrs = con.conf.ad.attrs_search.clone();
    let vec_res: Vec<Vec<HashMap<String, Vec<String>>>> = con.search(filter).await;
    // search renvoie forcément un vec de deux résultats de recherche ldap et AD
    Results { 
        ldap_attrs,
        ad_attrs,
        ldap_res: vec_res[0].clone(),  
        ad_res: vec_res[1].clone()
    }
}

#[tauri::command]
async fn search_entry(directory: String, filter: String) -> Results {
    let settings_filename = "./conf.toml";
    let  con = Connexions::new(settings_filename);
    let vec_res: Vec<Vec<HashMap<String, Vec<String>>>>;
    let ldap_attrs;
    let ad_attrs;
    let ldap_res: Vec<HashMap<String, Vec<String>>>;
    let ad_res: Vec<HashMap<String, Vec<String>>>;
    let blank: Vec<HashMap<String, Vec<String>>> = vec![HashMap::new()];
    // recherche LDAP par défaut si directory non renseigné
    if directory.as_str() == "ad" {
        vec_res = con.display_ad(filter).await;
        ad_attrs = con.conf.ad.attrs_display.clone();
        ad_res = vec_res[0].clone();
        ldap_res = blank.clone();
        ldap_attrs = vec!["".to_string()];
    }
    else {
        vec_res = con.display_ldap(filter).await;
        ldap_attrs = con.conf.ldap.attrs_display.clone();
        ldap_res = vec_res[0].clone();
        ad_attrs = vec!["".to_string()];
        ad_res = blank.clone();
    }

    Results { 
        ldap_attrs,
        ad_attrs,
        ldap_res,
        ad_res,
    }
}


fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![search_results, search_entry])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
