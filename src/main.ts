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

// cherche l'entrée précise dans l'annuaire demandé
async function searchEntry(annuary: string, e: Event) {
    console.log(annuary, e);
}


function displayResults(results: Results) {
    let resElem = document.querySelector('#resultats');
    if (resElem) {
        let resultsHtml = '<table><tr><td>';
        resultsHtml = resultsHtml + displayList("ldap", results.ldap_attrs, results.ldap_res) + '</td><td>' + displayList("ad", results.ad_attrs, results.ad_res);
        resultsHtml = resultsHtml + '</td></tr></table>'
        resElem.innerHTML = resultsHtml; 
        let elemListLdap = document.querySelector('#ldap');  // on associe un callback onclick
        elemListLdap?.addEventListener('click', (e) => { searchEntry('ldap', e);});     
        let elemListAd = document.querySelector('#ad');     // on associe un callback onclick
        elemListAd?.addEventListener('click', (e) => { searchEntry('ad', e);});  
    }
}

function displayList(className: string, attrs: [string], data: []): string {
    let listHtml = '<div class="resultCol" id="' + className +'"><table class="' + className +'">';
    // chaque ligne de résultat aura un id = className+uid
    let id_attr = attrs[attrs.length - 1]; // le dernier attribut est l'identifiant

    // on ne prend pas en compte le dernier attribut identifiant (non affiché)
    // header
    listHtml = listHtml + '<thead><tr class="header">';
    for (let h = 0; h < attrs.length - 1; h++) {
        listHtml = listHtml + '<th>' + attrs[h] + '</th>';
    }
    listHtml = listHtml + '</tr></thead>';
    // data
    listHtml = listHtml + '<tbody>';
    for (let i = 0;  i < data.length; i++) {
        let line = data[i];
        let val_uid = line[id_attr];
        let elem_id = className + '+' + val_uid;
        listHtml = listHtml + '<tr class="line" id="' + elem_id + '">';
        for (let iat = 0; iat < attrs.length - 1; iat++)  {
            let attr = attrs[iat];
            let vct: [string] = line[attr];
            let val: string = '';
            if (vct && vct.length > 0) {
                val = vct[0];
                for (let i = 1; i < vct.length; i++) {
                    val = "\n" + vct[i];
                }
            }
            listHtml = listHtml + '<td>' + val + '</td>';
        };
        listHtml = listHtml + '</tr>';
    }
    listHtml = listHtml + '</tbody></table></div>';
    return listHtml;
}

window.addEventListener("DOMContentLoaded", () => {
    inputEl = document.querySelector("#input");
    inputEl?.addEventListener("change", (e) => { search(); });
});
