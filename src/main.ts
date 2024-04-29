import { invoke } from "@tauri-apps/api/core";


interface Results {
    ldap_attrs: [string];
    ad_attrs: [string];
    ldap_res: [];
    ad_res: [];
}

let inputEl: HTMLInputElement | null;

async function search() {
    if (inputEl) {
      let results: Results = await invoke("search_results", { filter: inputEl.value, });
      //console.log(results);
      displayResults(results);
    }
}


function displayResults(results: Results) {
    let resElem = document.querySelector('#resultats');
    if (resElem) {
        let resultsHtml = displayList(results.ldap_attrs, results.ldap_res) + displayList(results.ad_attrs, results.ad_res);
        resElem.innerHTML = resultsHtml;      
    }
}

function displayList(attrs: [string], data: []): string {
    let listHtml = '<div>';
    // header
    listHtml = listHtml + '<div class="header">';
    for (let h = 0; h < attrs.length; h++) {
        listHtml = listHtml + '<span>' + attrs[h] + '</span>';
    }
    listHtml = listHtml + '</div><br/><div>';
    // data
    for (let i = 0;  i < data.length; i++) {
        let line = data[i];
        attrs.forEach(attr => {
            let vct: [string] = line[attr];
            let val: string = '';
            if (vct && vct.length > 0) {
                val = vct[0];
                for (let i = 1; i < vct.length; i++) {
                    val = "\n" + vct[i];
                }
            }
            listHtml = listHtml + '<span>' + val + '</span>';
        });
        listHtml = listHtml + '</div><br/>';
    }
    listHtml = listHtml + '</div>';
    return listHtml;
}

window.addEventListener("DOMContentLoaded", () => {
    inputEl = document.querySelector("#input");
    inputEl?.addEventListener("change", (e) => { search(); });
});
