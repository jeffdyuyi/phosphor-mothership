import React, { SFC, useState } from "react";
import "./style.scss";
export interface PromptProps { prompt?: string; commands?: any[]; className?: string; disabled?: boolean; onCommand?: (command: string, action: any) => void; onEscape?: () => void; onRendered?: () => void; }
export const PROMPT_DEFAULT = "$> ";
const Prompt: SFC<PromptProps> = ({ prompt, commands = [], className = "", disabled, onCommand }) => {
 const [value, setValue] = useState("");
 const [error, setError] = useState(false);
 const zh = document.documentElement.lang === "zh-CN";
 return <form className={"__prompt__ " + className} onSubmit={e => {
  e.preventDefault(); if(disabled) return;
  const command = commands.find(item => [item.command, ...(item.aliases || [])].some(name => name.toLocaleLowerCase() === value.trim().toLocaleLowerCase()));
  setError(!command); if(command && onCommand) { onCommand(value, command.action); setValue(""); }
 }}><label>{prompt}<input className="input" value={value} disabled={disabled} aria-label={zh ? "终端指令" : "Terminal command"} autoComplete="off" autoFocus
 onChange={e => {setValue(e.target.value); setError(false);}}
 onKeyDown={e => { if(((e.nativeEvent as any).isComposing || e.keyCode === 229) && e.key === "Enter") e.preventDefault(); }} /></label>
 {error && <div role="status">{zh ? "未知指令。可用指令：" : "Unknown command. Available: "}{commands.map(c => c.command).join(" / ")}</div>}</form>;
}; export default Prompt;
