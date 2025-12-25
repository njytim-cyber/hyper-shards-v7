// Steam SDK stubs
// These will be replaced with actual Steamworks SDK calls when building for Steam release

#[tauri::command]
fn steam_is_available() -> bool {
    // TODO: Check if Steam client is running and game was launched through Steam
    // For now, return false (dev mode)
    cfg!(feature = "steam")
}

#[tauri::command]
fn steam_unlock_achievement(achievement_id: String) -> Result<(), String> {
    // TODO: Use steamworks-rs crate to unlock achievement
    println!("[Steam Stub] Unlock achievement: {}", achievement_id);
    Ok(())
}

#[tauri::command]
fn steam_get_unlocked() -> Vec<String> {
    // TODO: Query Steam for unlocked achievements
    Vec::new()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        steam_is_available,
        steam_unlock_achievement,
        steam_get_unlocked
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
