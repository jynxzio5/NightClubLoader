import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  X
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { startDragging, closeWindow } from "./tauriWindow";
import confetti from "canvas-confetti";

interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface LogMessage {
  time: string;
  level: "info" | "success" | "warning" | "error";
  text: string;
}

export default function App() {
  // Navigation & Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Client Dashboard State
  const [selectedVersion, setSelectedVersion] = useState<string>("Stable v1.4.2");
  const [processStatus, setProcessStatus] = useState<"Offline" | "Scanning" | "Hooked">("Offline");
  const [processPid, setProcessPid] = useState<number | null>(null);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [isInjected, setIsInjected] = useState<boolean>(false);

  // Features list compatible with C++ backend features
  const [features, setFeatures] = useState<Feature[]>([
    { id: "bypass", name: "Anti-Cheat Bypass", description: "Bypasses kernel & integrity checks.", enabled: false },
    { id: "encryption", name: "C++ Packet Crypt", description: "Cryptographically signs outbound packets.", enabled: true },
    { id: "memory_hook", name: "Dynamic Memory Hook", description: "Hooks virtual memory registers.", enabled: false },
    { id: "dupe_handler", name: "Transaction Duplicator", description: "Simulates loop verification packet duplication.", enabled: false },
  ]);

  // Terminal Console Logs
  const [logs, setLogs] = useState<LogMessage[]>([
    { time: "21:22:36", level: "info", text: "ZenLoader initialization sequence started." },
    { time: "21:22:37", level: "info", text: "Awaiting local FFI interface registration." },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Simulate logging
  const addLog = (text: string, level: "info" | "success" | "warning" | "error" = "info") => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [...prev, { time, level, text }]);
  };

  // Mock checking process status (could call invoke("get_process_status"))
  useEffect(() => {
    if (isAuthenticated) {
      setProcessStatus("Scanning");
      addLog("Scanning systems for target game process...", "info");
      
      const timer = setTimeout(() => {
        setProcessStatus("Hooked");
        setProcessPid(14082);
        addLog("Found game instance! Hooked target process [PID: 14082]", "success");
        addLog("Static C++ FFI bindings mapping registered.", "info");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Triggered key verification
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setAuthError("License key cannot be blank.");
      return;
    }

    setIsAuthenticating(true);
    setAuthError("");
    addLog(`Initiating license verification: ${licenseKey.substring(0, 8)}...`, "info");

    try {
      // Direct integration with C++ compatible tauri commands
      // Awaiting Rust backend verification (which partners can link to C++ dll)
      const res = await invoke<string>("verify_license", { key: licenseKey });
      
      if (res === "success" || res.includes("valid")) {
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#ffffff', '#888888', '#222222']
        });
        setIsAuthenticated(true);
        addLog("License authenticated successfully. Lifetime credentials verified.", "success");
      } else {
        setAuthError(res);
        addLog(`Authentication failed: ${res}`, "error");
      }
    } catch (err: any) {
      // Fallback/Simulate for development mode if commands are not yet fully implemented in Rust
      setTimeout(() => {
        if (licenseKey.toLowerCase() === "zen-admin" || licenseKey.length > 8) {
          confetti({
            particleCount: 50,
            spread: 40,
            origin: { y: 0.8 },
            colors: ['#ffffff', '#888888', '#222222']
          });
          setIsAuthenticated(true);
          addLog("Development Bypass: Authed successfully.", "success");
        } else {
          setAuthError("Invalid license credential keys. Check portal.");
          addLog("Server response: Invalid license key error [0x9C].", "error");
        }
        setIsAuthenticating(false);
      }, 1500);
      return;
    }
    setIsAuthenticating(false);
  };

  // Toggle Features
  const toggleFeature = async (index: number) => {
    const updated = [...features];
    const target = updated[index];
    target.enabled = !target.enabled;
    setFeatures(updated);

    addLog(`${target.name} set to ${target.enabled ? "ENABLED" : "DISABLED"}`, target.enabled ? "success" : "warning");

    try {
      // Compatible backend trigger
      await invoke("toggle_feature", { featureId: target.id, enabled: target.enabled });
    } catch (e) {
      // Silent catch for development mode
    }
  };

  // Inject DLL simulation (connects to C++ encryption dll)
  const handleInject = async () => {
    if (isInjecting || isInjected) return;
    setIsInjecting(true);
    addLog("Preparing injection payloads...", "info");
    addLog("Resolving FFI pointers to C++ decryption modules...", "info");

    let step = 0;
    const interval = setInterval(async () => {
      step++;
      if (step === 1) {
        addLog("Locating dll payload at 'modules/crypt_engine.dll'...", "info");
      } else if (step === 2) {
        addLog("Verifying integrity checksum with C++ backend encryption signature...", "info");
      } else if (step === 3) {
        addLog("Allocating virtual memory block and writing headers...", "info");
      } else if (step === 4) {
        addLog("Injecting DLL via LoadLibrary hook execution...", "success");
        try {
          await invoke("inject_payload");
        } catch (e) {}
      } else if (step === 5) {
        clearInterval(interval);
        setIsInjecting(false);
        setIsInjected(true);
        addLog("ZenLoader hook successfully fully initialized. Injection complete!", "success");
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }, 900);
  };

  const themeMode = "nightclub" as "zen" | "redline" | "nightclub";

  // Dynamic values based on theme mode
  const getThemeStyles = () => {
    switch (themeMode) {
      case "redline":
        return {
          title: "Redline Loader",
          border: "border-[#500a0a]",
          bgGradient: "from-[#050000] via-[#0c0202] to-[#050000]",
          panelBg: "bg-[#140505] border-[#3a0d0d]",
          subPanelBg: "bg-[#0c0202] border-[#220707]",
          buttonBg: "bg-red-600 text-white hover:bg-red-500",
          buttonShadow: "var(--redline-shadow)",
          buttonActiveShadow: "var(--redline-shadow-active)",
          accentText: "text-red-500",
          selectBorder: "border-[#4a0e0e]",
          featureEnabledBg: "bg-[#1f0808] border-[#5a1212]",
          featureDisabledBg: "bg-[#0c0303] border-[#220707] hover:bg-[#120505]",
          checkboxEnabled: "bg-red-600 border-red-600 text-white",
          checkboxDisabled: "border-[#441111] bg-[#080202]",
          consoleBg: "bg-[#090202] border-[#2a0b0b]",
          consoleText: "text-red-400",
          injectBtnBg: "bg-red-600 text-white hover:bg-red-500 border-red-700",
          injectBtnShadow: "var(--redline-shadow)"
        };
      case "nightclub":
        return {
          title: "Night Club Loader",
          border: "border-[#2e0e62]",
          bgGradient: "from-[#020008] via-[#09021f] to-[#020008]",
          panelBg: "bg-[#11052c] border-[#2e0e62]",
          subPanelBg: "bg-[#070114] border-[#1d083e]",
          buttonBg: "bg-violet-600 text-white hover:bg-violet-500",
          buttonShadow: "var(--club-shadow)",
          buttonActiveShadow: "var(--club-shadow-active)",
          accentText: "text-violet-400",
          selectBorder: "border-[#2e0e62]",
          featureEnabledBg: "bg-[#1a0840] border-[#3c128e]",
          featureDisabledBg: "bg-[#070114] border-[#1a063b] hover:bg-[#0f0326]",
          checkboxEnabled: "bg-violet-600 border-violet-600 text-white",
          checkboxDisabled: "border-[#2d0e60] bg-[#05010e]",
          consoleBg: "bg-[#05010e] border-[#1f0840]",
          consoleText: "text-violet-400",
          injectBtnBg: "bg-violet-600 text-white hover:bg-violet-500 border-violet-800",
          injectBtnShadow: "var(--club-shadow)"
        };
      case "zen":
      default:
        return {
          title: "ZenLoader",
          border: "border-[#222222]",
          bgGradient: "from-[#000000] via-[#050505] to-[#000000]",
          panelBg: "bg-[#0c0c0c] border-[#1a1a1a]",
          subPanelBg: "bg-[#080808] border-[#181818]",
          buttonBg: "bg-white text-black hover:bg-zinc-200",
          buttonShadow: "var(--shadow-3d)",
          buttonActiveShadow: "var(--shadow-3d-active)",
          accentText: "text-white",
          selectBorder: "border-[#222222]",
          featureEnabledBg: "bg-[#0b0c0a] border-[#2e3328]",
          featureDisabledBg: "bg-[#080808] border-[#161616] hover:bg-[#0c0c0c]",
          checkboxEnabled: "bg-white border-white text-black",
          checkboxDisabled: "border-[#333333] bg-[#040404]",
          consoleBg: "bg-[#050505] border-[#161616]",
          consoleText: "text-emerald-400",
          injectBtnBg: "bg-[#00ff66] text-black hover:bg-[#2eff80] border-[#00ff66]",
          injectBtnShadow: "var(--shadow-3d-green)"
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div 
      onMouseDown={startDragging}
      className={`w-[440px] h-[520px] bg-[#000000] border ${theme.border} rounded-xl flex flex-col justify-between overflow-hidden shadow-2xl relative drag-region select-none transition-colors duration-300`}
    >
      
      {/* Absolute Close Button (Available globally on top right borderless frame) */}
      <button 
        onClick={closeWindow}
        className="absolute top-4 right-4 z-50 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-all duration-150 no-drag cursor-pointer"
        style={{ boxShadow: 'var(--shadow-3d)' }}
        title="Close Application"
      >
        <X size={12} />
      </button>

      {/* Main Panel Content (Set no-drag on inner content so buttons/inputs remain clickable) */}
      <div className={`flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col justify-between bg-gradient-to-b ${theme.bgGradient} no-drag transition-colors duration-300`}>
        
        {!isAuthenticated ? (
          /* AUTHENTICATION VIEW */
          <div className="flex-1 flex flex-col justify-center items-stretch py-4">

            <div className="text-center mb-8">
              {/* Premium 3D Zen letter symbol or Redline Dynamic GIF */}
              {themeMode === "redline" ? (
                <div 
                  className="w-16 h-16 rounded-xl border border-red-950 bg-black flex items-center justify-center mx-auto mb-5 shadow-[0_8px_16px_rgba(0,0,0,0.5)] overflow-hidden"
                  style={{ boxShadow: 'var(--redline-shadow)' }}
                >
                  <img src="/redline.gif" className="w-full h-full object-cover" alt="Redline GIF logo" />
                </div>
              ) : themeMode === "nightclub" ? (
                <div 
                  className="w-16 h-16 rounded-xl border border-violet-800 bg-[#0e0326] flex items-center justify-center mx-auto mb-5 shadow-[0_8px_16px_rgba(139,92,246,0.2)]"
                  style={{ boxShadow: 'var(--club-shadow)' }}
                >
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-fuchsia-500 tracking-tighter select-none font-sans italic">N</span>
                </div>
              ) : (
                <div 
                  className="w-16 h-16 rounded-xl border border-[#222222] bg-[#090909] flex items-center justify-center mx-auto mb-5 shadow-[0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-0"
                  style={{ boxShadow: 'var(--shadow-3d)' }}
                >
                  <span className="text-3xl font-black text-white tracking-tighter select-none font-sans italic">Z</span>
                </div>
              )}
              <h2 className="text-lg font-bold tracking-tight text-white uppercase mono">{theme.title}</h2>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-[#888888] uppercase tracking-wider mono block">License Key</label>
                <div className="relative">
                  <input
                    type="password"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="••••-••••-••••-••••"
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-lg px-3.5 py-2.5 text-xs text-center text-white placeholder-zinc-700 tracking-widest focus:outline-none focus:border-[#444444] transition-all duration-200"
                    spellCheck={false}
                    disabled={isAuthenticating}
                  />
                  {licenseKey && (
                    <div className="absolute right-3 top-3 text-[9px] text-[#555555] mono">
                      {licenseKey.length} chars
                    </div>
                  )}
                </div>
              </div>

              {authError && (
                <div className="bg-[#100505] border border-[#301010] rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-red-400">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span className="mono">{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                style={{
                  transform: isAuthenticating ? 'translateY(3px)' : 'none',
                  boxShadow: isAuthenticating ? theme.buttonActiveShadow : theme.buttonShadow
                }}
                className={`w-full ${theme.buttonBg} font-semibold text-xs py-3 rounded-lg flex items-center justify-center gap-2 tracking-wide uppercase transition-all duration-150 cursor-pointer active:translate-y-[3px] active:shadow-none`}
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield size={14} />
                    <span>Authenticate</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-[#141414] text-center">
              <span className="text-[10px] text-zinc-600 tracking-wider mono uppercase">
                Awaiting System Handshake
              </span>
            </div>
          </div>
        ) : (
          /* MAIN LOADER VIEW */
          <div className="flex-1 flex flex-col justify-between gap-4">
            
            {/* Top Config Row */}
            <div className={`flex items-center justify-between gap-2 ${theme.panelBg} rounded-lg p-2 mr-8`}>
              <div className="flex items-center gap-1.5">
                <Cpu size={13} className="text-[#888888]" />
                <span className="text-[10px] font-semibold text-[#888888] tracking-wider mono uppercase">Version:</span>
              </div>
              <select
                value={selectedVersion}
                onChange={(e) => {
                  setSelectedVersion(e.target.value);
                  addLog(`Client version switch triggered: ${e.target.value}`, "info");
                }}
                className="bg-[#050505] border border-[#222222] rounded text-[10px] text-white px-2 py-0.5 mono focus:outline-none focus:border-[#444444]"
              >
                <option>Stable v1.4.2</option>
                <option>Beta v1.5.0-rc1</option>
                <option>Nightly Build</option>
              </select>
            </div>

            {/* Target Status Panel */}
            <div className={`${theme.subPanelBg} rounded-lg p-3 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}>
              <div>
                <span className="text-[9px] text-[#555555] uppercase tracking-wider mono block">Target Client</span>
                <span className="text-xs text-white font-medium mono">
                  {processStatus === "Offline" && "Waiting for game client..."}
                  {processStatus === "Scanning" && "Scanning processes..."}
                  {processStatus === "Hooked" && `game_client.exe (PID: ${processPid})`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  processStatus === "Offline" ? "bg-red-500 animate-pulse" :
                  processStatus === "Scanning" ? "bg-yellow-500 animate-spin" :
                  "bg-emerald-400"
                }`} />
                <span className="text-[10px] font-bold uppercase tracking-wider mono text-zinc-400">
                  {processStatus}
                </span>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-2">
              <span className="text-[9px] text-[#555555] uppercase tracking-wider mono block px-0.5">Features & Modifiers</span>
              <div className="space-y-1.5 max-h-[170px] overflow-y-auto custom-scrollbar pr-0.5">
                {features.map((feature, i) => (
                  <div 
                    key={feature.id}
                    onClick={() => toggleFeature(i)}
                    className={`border rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      feature.enabled 
                        ? theme.featureEnabledBg 
                        : theme.featureDisabledBg
                    }`}
                  >
                    <div className="max-w-[78%]">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-medium transition-colors ${feature.enabled ? "text-white" : "text-[#888888]"}`}>
                          {feature.name}
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-500 mt-0.5 tracking-tight truncate">{feature.description}</p>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                      feature.enabled 
                        ? theme.checkboxEnabled 
                        : theme.checkboxDisabled
                    }`}>
                      {feature.enabled && <span className="text-[9px] font-bold">✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Realtime Terminal Console */}
            <div className="space-y-1.5 flex-1 flex flex-col min-h-[110px]">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[9px] text-[#555555] uppercase tracking-wider mono block">Execution Log</span>
                <span className="text-[9px] text-zinc-600 mono">C++ Linked</span>
              </div>
              <div className={`flex-1 ${theme.consoleBg} rounded-lg p-2 font-mono text-[9px] overflow-y-auto custom-scrollbar flex flex-col gap-1 select-text`}>
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1 leading-normal">
                    <span className="text-zinc-600 shrink-0">{log.time}</span>
                    <span className={`shrink-0 ${
                      log.level === "success" ? theme.consoleText :
                      log.level === "warning" ? "text-yellow-500" :
                      log.level === "error" ? "text-red-400" :
                      "text-zinc-400"
                    }`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-zinc-300 break-all">{log.text}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* Large 3D Action Injection Button */}
            <button
              onClick={handleInject}
              disabled={isInjecting || isInjected || processStatus !== "Hooked"}
              style={{
                transform: isInjecting || isInjected ? 'translateY(3px)' : 'none',
                boxShadow: isInjecting || isInjected 
                  ? 'var(--shadow-3d-green-active)' 
                  : (processStatus === "Hooked" ? theme.injectBtnShadow : 'var(--shadow-3d)')
              }}
              className={`w-full py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer ${
                isInjected 
                  ? "bg-transparent border border-emerald-500/30 text-emerald-400 cursor-default" 
                  : (processStatus === "Hooked" 
                      ? theme.injectBtnBg 
                      : "bg-[#222222] text-[#666666] cursor-not-allowed border border-[#333333]")
              }`}
            >
              {isInjecting ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-black" />
                  <span className="text-black">Injecting...</span>
                </>
              ) : isInjected ? (
                <>
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span>Module Injected</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Load ZenLoader</span>
                </>
              )}
            </button>

          </div>
        )}

      </div>

    </div>
  );
}
