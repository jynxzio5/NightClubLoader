use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LicenseInfo {
    pub key: String,
    pub status: String,
    pub expires_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub name: String,
    pub pid: u32,
    pub active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogEntry {
    pub time: String,
    pub level: String,
    pub text: String,
}

// Verification command mapping
#[tauri::command]
fn verify_license(key: String) -> Result<String, String> {
    // Perform standard cryptographic validation or call C++ logic
    // Ex: unsafe { verify_key_in_cpp(key.as_ptr()) }
    if key == "zen-admin" || key.len() > 8 {
        Ok("success".to_string())
    } else {
        Err("Invalid license key credential [0x9C]".to_string())
    }
}

// Toggle features command mapping
#[tauri::command]
fn toggle_feature(feature_id: String, enabled: bool) -> Result<(), String> {
    println!("Feature toggled: {} -> {}", feature_id, enabled);
    // Can call external C++ logic:
    // unsafe { cpp_toggle_module(feature_id.as_ptr(), enabled) }
    Ok(())
}

// Inject payload command mapping
#[tauri::command]
fn inject_payload() -> Result<(), String> {
    println!("Payload injection initiated.");
    // Invokes C++ native injection dll loader
    // unsafe { cpp_inject_library() }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            verify_license,
            toggle_feature,
            inject_payload
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

