import React from 'react';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import App, { validate } from './App';
import Prompt from './components/Prompt';
import zh from './data/ypsilon14.zh-CN.json';
import en from './data/ypsilon14.json';
import demo from './data/sample.zh-CN.json';
import enDemo from './data/sample.json';
afterEach(() => {cleanup();localStorage.clear();});
test('all bundled scenarios validate for offline use', () => { [zh,en,demo,enDemo].forEach(data => expect(() => validate(data)).not.toThrow()); });
test('invalid links, duplicate ids and network images are rejected', () => {
 const data:any=JSON.parse(JSON.stringify(demo));data.screens[0].content.push({type:'link',text:'broken',target:'missing'});expect(()=>validate(data)).toThrow();
 const duplicate:any=JSON.parse(JSON.stringify(demo));duplicate.screens.push(duplicate.screens[0]);expect(()=>validate(duplicate)).toThrow();
 const remote:any=JSON.parse(JSON.stringify(demo));remote.screens[0].content.push({type:'bitmap',src:'https://example.com/a.png'});expect(()=>validate(remote)).toThrow();
});
test('Chinese input and normalized English aliases dispatch the same action', () => {
 document.documentElement.lang='zh-CN';const onCommand=jest.fn();const action={type:'link',target:'home'};
 const view=render(<Prompt commands={[{command:'返回',aliases:['back'],action}]} onCommand={onCommand}/>);const input=view.getByLabelText('终端指令');
 fireEvent.change(input,{target:{value:'返回'}});fireEvent.submit(input.closest('form'));expect(onCommand).toHaveBeenLastCalledWith('返回',action);
 fireEvent.change(input,{target:{value:' BACK '}});fireEvent.submit(input.closest('form'));expect(onCommand).toHaveBeenLastCalledWith(' BACK ',action);
 fireEvent.change(input,{target:{value:'不存在'}});fireEvent.submit(input.closest('form'));expect(view.getByRole('status').textContent).toContain('返回');expect(onCommand).toHaveBeenCalledTimes(2);
});
test('language selection updates document and persists',()=>{
 const view=render(<App/>);fireEvent.change(view.getByDisplayValue('简体中文'),{target:{value:'en'}});expect(document.documentElement.lang).toBe('en');expect(localStorage.getItem('phosphor.language')).toBe('"en"');expect(view.getByText('Restart terminal')).toBeTruthy();
});

test('language switch preserves administrator page, toggle state and dialog', () => {
 jest.useFakeTimers();
 const view = render(<App/>);
 const finish = () => act(() => { jest.runAllTimers(); });
 finish();
 fireEvent.click(view.getByText('> 接受用户协议并登录')); finish();
 fireEvent.click(view.getByText('> 设施控制')); finish();
 fireEvent.click(view.getByText('> 气闸 [A]'));
 expect(view.getByText('错误！需要管理员授权。')).toBeTruthy();
 fireEvent.keyDown(document, {key:'Escape'});
 fireEvent.click(view.getByText('> 气闸 [A]'), {shiftKey:true}); finish();
 fireEvent.click(view.getByText('> 2号停靠舱 :: 已解锁'));
 expect(view.getByText('> 2号停靠舱 :: 已锁定')).toBeTruthy();
 fireEvent.change(view.getByDisplayValue('简体中文'), {target:{value:'en'}});
 expect(view.getByText('Airlocks')).toBeTruthy();
 expect(view.getByText('> DOCKING BAY 2 :: LOCKED')).toBeTruthy();
 fireEvent.click(view.getByText('> DOCKING BAY 1 :: LOCKED — ERROR'));
 expect(view.getByText('ERROR! Lock override in effect.')).toBeTruthy();
 fireEvent.change(view.getByDisplayValue('English'), {target:{value:'zh-CN'}});
 expect(view.getByText('气闸')).toBeTruthy();
 expect(view.getByText('> 2号停靠舱 :: 已锁定')).toBeTruthy();
 expect(view.getByText('错误！强制锁定已生效。')).toBeTruthy();
 fireEvent.keyDown(document, {key:'Escape'});
 fireEvent.click(view.getByText('重启终端')); finish();
 expect(view.getByText('> 接受用户协议并登录')).toBeTruthy();
 cleanup(); jest.useRealTimers();
});
