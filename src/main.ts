import { invoke } from "@tauri-apps/api/core";


interface Results {
    ldap_attrs: [string];
    ad_attrs: [string];
    ldap_res: [{}];
    ad_res: [{}];
}

let inputEl: HTMLInputElement | null;

async function search() {
    if (inputEl) {
      let results: Results = await invoke("search_results", { filter: inputEl.value, });
      console.log(results);
      displayResults(results);
    }
}


function displayResults(results: Results) {
    let resElem = document.querySelector('#resultats');
    if (resElem) {
        let resultsHtml = displayList(results.ldap_res) + displayList(results.ad_res);
        resElem.innerHTML = resultsHtml;      
    }
}

function displayList(data: [{}]): string {
    let listHtml = '<div>';
    // header


    listHtml = listHtml + '</div>';
    return listHtml;
}

window.addEventListener("DOMContentLoaded", () => {
    inputEl = document.querySelector("#input");
    inputEl?.addEventListener("change", (e) => { search(); });
});
