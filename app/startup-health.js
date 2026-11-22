(function(){
  'use strict';
  let shown = false;

  // Filter out non-fatal or visual warnings so the entire app is never blocked
  function isFatal(msg) {
    if (!msg) return false;
    const str = String(msg).toLowerCase();
    if (str.includes('resizeobserver') || str.includes('mutationobserver') || str.includes('hex.slice')) return false;
    if (str.includes('audio') || str.includes('font') || str.includes('image')) return false;
    return true;
  }

  function fail(message) {
    window.__startupError = String(message);
    console.warn('[StartupHealth Captured]:', message);
    
    // Only show modal if fatal and not already shown
    if (!isFatal(message) || shown) return;
    shown = true;

    const show = () => {
      const box = document.createElement('div');
      box.id = 'alhamd-recovery-box';
      box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:white;overflow:auto;padding:32px;font-family:system-ui,-apple-system,sans-serif;direction:rtl';
      
      const card = document.createElement('div');
      card.style.cssText = 'max-width:720px;margin:30px auto;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);';

      const h = document.createElement('h2');
      h.style.cssText = 'color:#38bdf8;font-size:22px;font-weight:bold;margin-bottom:12px;display:flex;align-items:center;gap:10px;';
      h.innerHTML = '<span>🛠️</span> مركز التشخيص الذاتي والتعافي التلقائي (الحمد برنت)';

      const p = document.createElement('p');
      p.style.cssText = 'color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:18px;';
      p.textContent = 'تعذر إكمال عملية في البرنامج. احتفظ بملفات البيانات والنسخ الاحتياطية ولا تحذفها. تفاصيل الخطأ التالية تساعد في التشخيص:';

      const pre = document.createElement('pre');
      pre.style.cssText = 'background:#090d16;color:#f87171;padding:14px;border-radius:10px;border:1px solid #27354a;font-size:12px;white-space:pre-wrap;direction:ltr;max-height:160px;overflow:auto;margin-bottom:20px;';
      pre.textContent = String(message);

      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;';

      const safeBtn = document.createElement('button');
      safeBtn.textContent = 'إغلاق رسالة التشخيص';
      safeBtn.style.cssText = 'background:#0d9488;color:white;border:none;padding:10px 18px;border-radius:10px;font-weight:bold;cursor:pointer;font-size:13px;';
      safeBtn.onclick = () => {
        box.remove();
        shown = false;
        try { if (typeof window.applyUi === 'function') window.applyUi(); } catch(_) {}
      };

      const reloadBtn = document.createElement('button');
      reloadBtn.textContent = '🔄 إعادة تشغيل الواجهة';
      reloadBtn.style.cssText = 'background:#334155;color:white;border:none;padding:10px 18px;border-radius:10px;font-weight:bold;cursor:pointer;font-size:13px;';
      reloadBtn.onclick = () => location.reload();

      if (window.__stateReady) actions.append(safeBtn);
      actions.append(reloadBtn);
      card.append(h, p, pre, actions);
      box.append(card);
      document.body.append(box);
    };

    if (document.body) show();
    else addEventListener('DOMContentLoaded', show, { once: true });
  }

  addEventListener('error', e => {
    if (e.error) fail(e.error.stack || e.error.message || e.message);
  });

  window.showStartupFailure = fail;
})();
