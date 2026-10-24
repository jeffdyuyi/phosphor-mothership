import React, { useState } from "react";
import Phosphor from "./components/Phosphor";
import zhDemo from "./data/sample.zh-CN.json";
import enDemo from "./data/sample.json";
import zhStation from "./data/ypsilon14.zh-CN.json";
import enStation from "./data/ypsilon14.json";
function read(key: string, fallback: any) { try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch { return fallback; } }
function save(key: string, value: any) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
export default function App() {
 const [lang, setLang] = useState<string>(() => read("phosphor.language", "zh-CN"));
 const [scenario, setScenario] = useState<string>(() => read("phosphor.scenario", "station"));
 const [custom, setCustom] = useState<any>(() => read("phosphor.custom", null));
 const [revision, setRevision] = useState(0);
 const [error, setError] = useState("");
 const zh = lang === "zh-CN";
 document.documentElement.lang = lang;
 const data = scenario === "custom" && custom ? custom : scenario === "demo" ? (zh ? zhDemo : enDemo) : (zh ? zhStation : enStation);
 async function upload(file?: File) {
  if(!file) return;
  try { const data = JSON.parse(await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(file, "UTF-8"); })); validate(data); setCustom(data); save("phosphor.custom",data); setScenario("custom"); save("phosphor.scenario","custom"); setRevision(revision+1); setError(""); }
  catch { setError(zh ? "导入失败：请检查JSON格式、页面和跳转目标。" : "Import failed: check JSON, screens and targets."); }
 }
 return <><nav className="toolbar" aria-label={zh ? "终端设置" : "Terminal settings"}>
 <strong>PHOSPHOR</strong>
 <label>{zh ? "语言 " : "Language "}<select value={lang} onChange={e => {setLang(e.target.value);save("phosphor.language",e.target.value);}}><option value="zh-CN">简体中文</option><option value="en">English</option></select></label>
 <label>{zh ? "剧本 " : "Scenario "}<select value={scenario === "custom" && !custom ? "station" : scenario} onChange={e => {setScenario(e.target.value);save("phosphor.scenario",e.target.value);}}><option value="station">{zh ? "伊普西龙-14" : "Ypsilon-14"}</option><option value="demo">{zh ? "功能演示" : "Demo"}</option>{custom && <option value="custom">{(custom.config && custom.config.name) || (zh ? "本地剧本" : "Local scenario")}</option>}</select></label>
 <label className="upload">{zh ? "导入 JSON" : "Import JSON"}<input type="file" accept=".json,application/json" onChange={e => {upload(e.target.files && e.target.files[0]);e.target.value="";}} /></label>
 <button onClick={() => {const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="phosphor-"+lang+".json";a.click();URL.revokeObjectURL(url);}}>{zh ? "导出 JSON" : "Export JSON"}</button>
 <button onClick={() => setRevision(revision+1)}>{zh ? "重启终端" : "Restart terminal"}</button>
 <small>{zh ? "本地运行 · 切换将重启当前终端" : "Local · Switching restarts terminal"}</small>
 </nav>{error && <p role="alert">{error}</p>}<Phosphor key={lang+scenario+revision} data={JSON.parse(JSON.stringify(data))}/></>;
}
export function validate(data: any) {
 if(!data || !Array.isArray(data.screens) || !data.screens.length || (data.dialogs && !Array.isArray(data.dialogs))) throw Error("screens");
 const screens = new Set(data.screens.map((s: any) => s.id));
 const dialogs = new Set((data.dialogs || []).map((d: any) => d.id));
 if(screens.size !== data.screens.length) throw Error("duplicate");
 const target = (action: any) => {if(!action || !["link","dialog","console"].includes(action.type) || (action.type === "link" && !screens.has(action.target)) || (action.type === "dialog" && !dialogs.has(action.target))) throw Error("target");};
 data.screens.forEach((s: any) => {
  if(typeof s.id !== "string" || !s.id || s.type !== "screen" || !Array.isArray(s.content) || !s.content.length) throw Error("screen");
  s.content.forEach((e: any) => {
   if(typeof e === "string") return;
   if(!e || !["text","link","prompt","toggle","image","bitmap"].includes(e.type)) throw Error("element");
   if(["text","link"].includes(e.type) && typeof e.text !== "string") throw Error("text");
   if(e.type === "link") typeof e.target === "string" ? target({type:"link",target:e.target}) : Array.isArray(e.target) ? e.target.forEach(target) : target(null);
   if(e.type === "prompt") {if((e.prompt !== undefined && typeof e.prompt !== "string") || !Array.isArray(e.commands)) throw Error("prompt");e.commands.forEach((c: any) => {if(typeof c.command !== "string" || (c.aliases && (!Array.isArray(c.aliases) || c.aliases.some((a: any) => typeof a !== "string")))) throw Error("command");target(c.action);});}
   if(e.type === "toggle" && (!Array.isArray(e.states) || !e.states.length || e.states.filter((t: any) => t.active).length !== 1 || e.states.some((t: any) => typeof t.text !== "string"))) throw Error("toggle");
   if(["image","bitmap"].includes(e.type) && (typeof e.src !== "string" || !/^(images\/|data:image\/)/.test(e.src))) throw Error("offline image");
  });
 });
 (data.dialogs || []).forEach((d: any) => {if(typeof d.id !== "string" || d.type !== "alert" || !Array.isArray(d.content) || d.content.some((t: any) => typeof t !== "string")) throw Error("dialog");});
}
