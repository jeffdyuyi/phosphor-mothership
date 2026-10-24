import React, { useEffect, useRef, useState } from "react";
import "./style.scss";

export default function AdminPassword({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const form = useRef<HTMLFormElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const zh = document.documentElement.lang === "zh-CN";
    useEffect(() => {
        const previous = document.activeElement as HTMLElement;
        document.body.classList.add("static");
        input.current && input.current.focus();
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") { event.preventDefault(); onClose(); }
            if (event.key === "Tab" && form.current) {
                const fields = form.current.querySelectorAll<HTMLElement>("input, button");
                const first = fields[0], last = fields[fields.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => { document.removeEventListener("keydown", handleKey); document.body.classList.remove("static"); previous && previous.focus(); };
    }, [onClose]);
    return <section className="__modal__ admin-password" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        <form ref={form} className="content" role="dialog" aria-modal="true" aria-labelledby="admin-title" onSubmit={event => {
            event.preventDefault();
            if (password === "YPCL44414.") { onUnlock(); }
            else { setError(true); input.current && input.current.focus(); }
        }}>
            <h2 id="admin-title">{zh ? "管理员身份验证" : "Administrator authentication"}</h2>
            <p>{zh ? "受限操作。请输入管理员密码。" : "Restricted operation. Enter the administrator password."}</p>
            <label htmlFor="admin-password">{zh ? "管理员密码" : "Administrator password"}</label>
            <input id="admin-password" ref={input} type="password" value={password} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                aria-invalid={error} aria-describedby={error ? "admin-error" : undefined}
                onChange={event => { setPassword(event.target.value); setError(false); }}
                onKeyDown={event => { if (((event.nativeEvent as any).isComposing || event.keyCode === 229) && event.key === "Enter") event.preventDefault(); }} />
            {error && <p id="admin-error" role="alert">{zh ? "密码错误，访问被拒绝。请重试。" : "Incorrect password. Access denied. Try again."}</p>}
            <div className="actions"><button type="button" onClick={onClose}>{zh ? "取消" : "Cancel"}</button><button type="submit">{zh ? "验证并进入" : "Verify and enter"}</button></div>
        </form>
    </section>;
}
