import { invoke } from "@tauri-apps/api/core";

let inputEl: HTMLInputElement | null;

async function greet() {
  if (inputEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  inputEl = document.querySelector("#greet-input");
  document.querySelector("#input")?.addEventListener("change", (e) => {
    greet();
  });
});
