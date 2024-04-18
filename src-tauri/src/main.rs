// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use searchuser::ldap::Connexions;
use serde::Serialize;

#[derive(Serialize)]
pub struct Results {
    ldap_res: Vec<Vec<String>>,
    ad_res: Vec<Vec<String>>,
}


#[tauri::command]
async fn search_results(filter: String) -> Results {
    let settings_filename = "../conf.toml";
    let  con = Connexions::new(settings_filename);
    let ldap_attrs = &con.conf.ldap.attrs_search;

    let (ldap_res, ad_res) = con.search(filter).await;
    let ad_attrs = &con.conf.ad.attrs_search;   
    let res_ldap = format_data(&ldap_attrs, ldap_res);
    let res_ad = format_data(&ad_attrs, ad_res);

    let res = Results {
        ldap_res: res_ldap,
        ad_res: res_ad,
    };
    res
}

fn format_data(attrs: &Vec<String>, res: Vec<HashMap<String, Vec<String>>>) -> Vec<Vec<String>> {
    let mut lines = Vec::new();
    lines.push(attrs.clone());
    if res.len() > 0 {
        for line in res.into_iter() {
            let mut values_line = vec!();
            for attr in attrs.into_iter() {
                if line.contains_key(attr) {
                    let vct = &line[attr];
                    let mut vals = vct[0].clone();
                    let l = vct.len();
                    if l > 1 {
                        for i in 1..l {
                            let val = &vct[i];
                            vals = vals + "\n" + val;
                        }
                    }
                    values_line.push(vals);
                } 
                else {
                    let empty = String::from("<vide>");
                    values_line.push(empty);
                } 
            }
            lines.push(values_line);
        }
    }
    lines
}


fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![search_results])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
