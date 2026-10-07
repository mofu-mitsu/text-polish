(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const input = $('#textInput');
  const thread = $('#thread-tools');
  if (!input || !thread) return;

  const brand = $('.brand');
  if (brand && !$('#headerHelp')) {
    const wrap = document.createElement('div');
    wrap.className = 'header-help-wrap';
    wrap.innerHTML = `<button id="headerHelp" class="header-help" type="button" aria-expanded="false" aria-label="Text Polishの使い方" title="このツールについて"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.8 9a2.4 2.4 0 1 1 4.1 1.7c-.9.8-1.9 1.2-1.9 2.6M12 16.8v.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button><div class="header-help-panel" id="headerHelpPanel"><strong>Text Polishって？</strong><p>文章を入力して、文字数を確認しながら整形・変換・置換・SNS分割までまとめて行える文章作業ツールです。</p><ul><li><b>文章</b>：入力とリアルタイム文字数チェック</li><li><b>範囲</b>：選択部分だけを加工</li><li><b>SNS投稿エディター</b>：投稿境界を決めてPOSTごとに編集</li><li><b>分割線</b>：<code>ーーーー</code> の行を投稿境界として利用</li></ul></div>`;
    brand.appendChild(wrap);
    const btn = $('#headerHelp');
    btn.addEventListener('click', () => { const open = wrap.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open)); });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) wrap.classList.remove('open'); });
  }

  const controls = $('.thread-controls', thread);
  if (controls && !$('#insertDivider')) {
    const b = document.createElement('button');
    b.id = 'insertDivider'; b.type = 'button'; b.className = 'secondary-button';
    b.textContent = '分割線を挿入'; b.title = 'カーソル位置に「ーーーー」を入れます';
    controls.appendChild(b);
    b.addEventListener('click', () => {
      const start = input.selectionStart, end = input.selectionEnd, value = input.value;
      const before = value.slice(0, start), after = value.slice(end);
      const prefix = before && !before.endsWith('\n') ? '\n' : '';
      const suffix = after && !after.startsWith('\n') ? '\n' : '';
      const next = before + prefix + 'ーーーー' + suffix + after;
      const caret = (before + prefix + 'ーーーー').length;
      if (typeof window.setText === 'function') window.setText(next, '分割線を挿入しました');
      else { input.value = next; input.dispatchEvent(new Event('input', {bubbles:true})); }
      input.focus(); input.setSelectionRange(caret, caret);
    });
  }

  if (controls && !$('#splitDividerButton')) {
    const b = document.createElement('button');
    b.id = 'splitDividerButton'; b.type = 'button'; b.className = 'secondary-button';
    b.textContent = '分割線で投稿を作る'; b.title = 'ーーーー の行を投稿境界として分割します';
    controls.appendChild(b);
    b.addEventListener('click', () => {
      if (!/^\s*ー{2,}\s*$/mu.test(input.value)) return window.showMessage?.('分割線「ーーーー」がありません');
      const original = input.value;
      const posts = original.split(/\r?\n/).map(line => /^\s*ー{2,}\s*$/u.test(line) ? '__TP_DIVIDER__' : line).join(' ').split('__TP_DIVIDER__').map(part => part.trim()).filter(Boolean);
      const old = input.value;
      input.value = posts.join('\n');
      const method = $('#splitMethod'), previous = method?.value;
      if (method) method.value = 'manual';
      $('#splitButton')?.click();
      if (method) method.value = previous || 'smart';
      input.value = old;
      if (typeof window.render === 'function') window.render();
      window.showMessage?.('分割線を投稿境界として反映しました');
    });
  }

  const title = $('.option-title', thread);
  if (title && !$('#threadClear')) {
    const b = document.createElement('button');
    b.id = 'threadClear'; b.type = 'button'; b.className = 'thread-clear secondary-button';
    b.textContent = 'クリア'; b.title = 'SNS投稿エディターをクリアします';
    title.appendChild(b);
    b.addEventListener('click', () => {
      const preview = $('#threadPreview');
      const remove = () => {
        const del = $('.thread-delete', preview);
        if (del) { del.click(); requestAnimationFrame(remove); return; }
        $('#addThreadPost')?.click();
        window.showMessage?.('SNS投稿エディターをクリアしました');
      };
      remove();
    });
  }

  requestAnimationFrame(() => {
    const preview = $('#threadPreview');
    if (preview && !$('.thread-edit', preview)) $('#addThreadPost')?.click();
  });

  if (controls && !$('#threadLiveSync')) {
    const label = document.createElement('label');
    label.className = 'check-row thread-live-sync';
    label.innerHTML = '<input id="threadLiveSync" type="checkbox"> 入力欄とPOST 1を同期';
    controls.appendChild(label);
    const sync = () => {
      if (!$('#threadLiveSync')?.checked) return;
      const first = $('.thread-edit', $('#threadPreview'));
      if (first && first.value !== input.value) {
        first.value = input.value;
        first.dispatchEvent(new Event('input', {bubbles:true}));
      }
    };
    input.addEventListener('input', sync);
    label.addEventListener('change', () => { if ($('#threadLiveSync').checked) sync(); });
  }
})();