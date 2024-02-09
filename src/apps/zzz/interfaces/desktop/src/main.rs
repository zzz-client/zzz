#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]

fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// This might be a way to run the HTTP server as well:
// https://github.com/tauri-apps/tauri/discussions/2751#discussioncomment-5622761
