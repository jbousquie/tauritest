import { invoke } from "@tauri-apps/api/core";


interface Results {
    ldap_attrs: string[];
    ad_attrs: string[];
    ldap_res: [];
    ad_res: [];
}

let inputEl: HTMLInputElement | null;
let backButton: HTMLButtonElement | null;
let lastHtml: string;

async function search(inputEl: HTMLInputElement|null) {
    if (inputEl) {
      let results: Results = await invoke("search_results", { filter: inputEl.value, });
      displayResults(results);
    }
}

// cherche l'entrée précise dans l'annuaire demandé
async function searchEntry(directory: string, e: Event) {
    // l'élément cliqué est un <td>, on va donc chercher son parent pour trouver l'id sous la forme "+ldap+uid"
    if (e) {
        let td = e.target as HTMLElement;
        if (td) {
            let tr_id: string = td.parentElement?.id || '';
            let prefix: string = '+' + directory + '+';
            let uid: string = tr_id.replace(prefix, '').replace('"', '');      // on retire le préfixe "+ldap+" ou "+ad+"
            let result: Results = await invoke("search_entry", { directory: directory, filter: uid, });

            let attrs: string[];
            let entry;
            if (directory == "ad") {
                attrs = result.ad_attrs;
                entry = result.ad_res;
            }
            else {
                attrs = result.ldap_attrs;
                entry = result.ldap_res;
            }   
            displayEntry(directory, attrs, entry);
        }
    }
}

function displayEntry(directory: string, attrs: string[], entry: {}[]) {
    let resElem = document.querySelector('#resultats');
    if (resElem) {
        let entryHtml = displayAttrs(directory, attrs, entry[0]);
        lastHtml = resElem.innerHTML;
        resElem.innerHTML = entryHtml; 
    }
}

function displayResults(results: Results) {
    let resElem = document.querySelector('#resultats');
    if (resElem) {
        let resultsHtml = '<table><tr><td>';
        resultsHtml = resultsHtml + displayList("ldap", results.ldap_attrs, results.ldap_res) + '</td><td>' + displayList("ad", results.ad_attrs, results.ad_res);
        resultsHtml = resultsHtml + '</td></tr></table>';
        lastHtml = resElem.innerHTML;
        resElem.innerHTML = resultsHtml; 
        registerTableEvent('ldap');
        registerTableEvent('ad');
    }
}

// enregistre les listeners click sur la table voulue
function registerTableEvent(tableId: string) {
    let elemDiv = document.querySelector('#'+tableId);
    let elemTable = elemDiv?.childNodes[0];         // <table>
    let elemTBody = elemTable?.childNodes[1];       // <tbody>
    elemTBody?.addEventListener('click', (e) => { searchEntry(tableId, e); });
}

// si les attributs contiennent "*" alors on renvoie les attributs de la ligne de résultat à la place
function cleanAttrs(attrs: string[], resultLine: {}) {
    let cleaned = attrs;
    if (attrs.includes("*")) {
        cleaned = Object.keys(resultLine);
    }
    return cleaned
}

// Affiche les attributs/valeurs d'une entrée en lignes
// Renvoie un contenu html
function displayAttrs(className: String, attrs: string[], entry: { [key: string]: string[] }): string {
    if (backButton) {
        backButton.disabled = false;
    }
    attrs = cleanAttrs(attrs, entry);
    let entryHtml = '<div class="resultCol" id="' + className +'"><table class="' + className +'"><tbody>';
    for (let i = 0; i < attrs.length - 1; i++) {
        let attr = attrs[i];
        let val = entry[attr];
        entryHtml = entryHtml + '<tr><td>' + attr + '</td><td>' + val + '</td></tr>';
    }
    entryHtml = entryHtml + '</tbody></table></div>';
    return entryHtml
}

// Affiche une liste de résultats en colonne
// Renvoie un contenu html
function displayList(className: string, attrs: string[], data: {}[]): string {
    let listHtml = '<div class="resultCol" id="' + className +'"><table class="' + className +'">';
    if (data.length > 0) {
        attrs = cleanAttrs(attrs, data[0]);
    }
    
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
        let line: { [key: string]: string[] } = data[i];
        let val_uid = line[id_attr];
        let elem_id = '+' + className + '+' + val_uid;   // on ajoute devant l'uid "+ad+" ou "+ldap+"
        listHtml = listHtml + '<tr class="line" id="' + elem_id + '">';
        for (let iat = 0; iat < attrs.length - 1; iat++)  {
            let attr = attrs[iat];
            let vct: string[] = line[attr];
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

function back(backButton: HTMLButtonElement|null) {
    if (backButton) {
        let resElem = document.querySelector('#resultats');
        if (resElem) {
            resElem.innerHTML = lastHtml;
            backButton.disabled = true;
            registerTableEvent('ldap');
            registerTableEvent('ad');
        }       
    }
}

window.addEventListener("DOMContentLoaded", () => {
    inputEl = document.querySelector("#input");
    if (inputEl) {
        inputEl.addEventListener("change", () => { search(inputEl); });
    }
    backButton = document.querySelector("#back");
    if (backButton) {
        backButton.addEventListener("click", () => { back(backButton); })
    }
});
