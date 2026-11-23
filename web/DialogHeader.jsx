import React, { useEffect, useRef } from 'react';

export default function DialogHeader({ children }) {
  const header = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    const form = header.current.closest('form');
    function recenter() {
      drag.current = null;
      form.style.translate = '';
    }
    window.addEventListener('resize', recenter);
    return () => window.removeEventListener('resize', recenter);
  }, []);

  function start(event) {
    if (event.button !== 0 || event.pointerType !== 'mouse' || event.target.closest('button')) return;
    const form = event.currentTarget.closest('form');
    const rect = form.getBoundingClientRect();
    const [x = 0, y = 0] = (form.style.translate || '').split(' ').map(value => parseFloat(value) || 0);
    drag.current = { form, rect, x, y, startX: event.clientX, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event) {
    if (!drag.current) return;
    const { form, rect, x, y, startX, startY } = drag.current;
    const dx = Math.max(-rect.left, Math.min(event.clientX - startX, document.documentElement.clientWidth - rect.right));
    const dy = Math.max(-rect.top, Math.min(event.clientY - startY, document.documentElement.clientHeight - rect.bottom));
    form.style.translate = (x + dx) + 'px ' + (y + dy) + 'px';
  }

  return <div ref={header} className="dialog-head" onPointerDown={start} onPointerMove={move}
    onLostPointerCapture={() => { drag.current = null; }}>
    {children}
  </div>;
}
