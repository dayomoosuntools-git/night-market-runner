// 鍵盤輸入：isDown 持續按住，wasPressed 只在按下的那一幀為 true
(function () {
  const keyMap = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    Space: 'action',
    KeyQ: 'prev', KeyE: 'next', KeyF: 'magic',
    Escape: 'pause',
    Enter: 'confirm',
    Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4',
    Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8',
    Numpad1: '1', Numpad2: '2', Numpad3: '3', Numpad4: '4',
    Numpad5: '5', Numpad6: '6', Numpad7: '7', Numpad8: '8',
  };
  const down = new Set();
  const pressed = new Set();

  // 正在輸入框打字時不攔截按鍵
  const typing = (e) => e.target instanceof HTMLInputElement;

  addEventListener('keydown', (e) => {
    NM.audio.unlock(); // 第一次按鍵後才能出聲
    if (typing(e)) return;
    if (e.code === 'KeyM' && !e.repeat) NM.audio.toggleMute();
    const k = keyMap[e.code];
    if (!k) return;
    e.preventDefault();
    if (!down.has(k)) pressed.add(k);
    down.add(k);
  });
  addEventListener('keyup', (e) => {
    const k = keyMap[e.code];
    if (k) down.delete(k);
  });
  addEventListener('blur', () => down.clear());

  NM.input = {
    isDown: (k) => down.has(k),
    wasPressed: (k) => pressed.has(k),
    endFrame: () => pressed.clear(),
  };
})();
