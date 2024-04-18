import { invoke } from "@tauri-apps/api/core";

let inputEl: HTMLInputElement | null;

async function search() {
  if (inputEl) {
    let results = await invoke("search_results", { filter: inputEl.value, });
    console.log(results);
  }
}


function display(data) {

}


window.addEventListener("DOMContentLoaded", () => {
  inputEl = document.querySelector("#input");
  inputEl?.addEventListener("change", (e) => { search(); });
});
