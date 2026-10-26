'use strict';
(() => {
  let completed=false;
  let timer;
  const status=() => document.getElementById('status');
  function send(message) {
    if(completed) return;
    completed=true;
    clearTimeout(timer);
    const bridge=window.meinSchultagCaptcha;
    if(!bridge || typeof bridge.postMessage!=='function') {
      status().textContent='Bitte starte diese Prüfung aus der App.';
      return;
    }
    bridge.postMessage(JSON.stringify(message));
  }
  function fail() {
    status().textContent='Die Prüfung konnte nicht abgeschlossen werden. Bitte versuche es in der App erneut.';
    send({type:'error'});
  }
  window.onTurnstileReady=() => {
    try {
      const query=new URLSearchParams(location.search);
      const key=query.get('sitekey');
      if(location.protocol!=='https:' || Array.from(query.keys()).length!==1 || !/^[A-Za-z0-9_-]{16,100}$/.test(key || '')) { fail(); return; }
      window.turnstile.render('#challenge',{
        sitekey:key,
        action:'supabase_auth',
        language:'de',
        theme:'auto',
        retry:'never',
        'refresh-expired':'never',
        'refresh-timeout':'never',
        callback:(token) => {
          if(typeof token!=='string' || !/^[\x21-\x7e]{1,2048}$/.test(token)) { fail(); return; }
          status().textContent='Prüfung abgeschlossen. Zurück zur App …';
          send({type:'success',token});
        },
        'error-callback':fail,
        'expired-callback':fail,
        'timeout-callback':fail,
        'unsupported-callback':fail
      });
    } catch { fail(); }
  };
  timer=setTimeout(fail,120000);
})();
