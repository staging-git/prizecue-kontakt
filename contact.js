'use strict';
const endpoint='https://prizecue.christenleben.at/prizecue-contact.php';
const form=document.querySelector('#contact'),button=document.querySelector('#send'),status=document.querySelector('#status');
let challenge=null,challengeReadyAt=0,requestID=crypto.randomUUID();
const fetchChallenge=async()=>{const r=await fetch(endpoint,{mode:'cors',credentials:'omit',cache:'no-store',redirect:'error'});if(!r.ok)throw Error('unavailable');const v=await r.json();if(typeof v.challenge!=='string')throw Error('unavailable');challenge=v.challenge;challengeReadyAt=Date.now()+3100;};
fetchChallenge().catch(()=>{});
form.addEventListener('submit',async event=>{
 event.preventDefault();status.className='';status.textContent='';if(!form.reportValidity())return;
 const data=Object.fromEntries(new FormData(form));if(data.message.trim().length<10){status.textContent='Bitte beschreibe dein Anliegen mit mindestens zehn Zeichen.';return;}
 button.disabled=true;button.textContent='Wird gesendet …';
 try{
  if(!challenge)await fetchChallenge();
  if(Date.now()<challengeReadyAt)await new Promise(r=>setTimeout(r,challengeReadyAt-Date.now()));
  const r=await fetch(endpoint,{method:'POST',mode:'cors',credentials:'omit',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,challenge,id:requestID})});
  const result=await r.json();if(r.status===429)throw Error('rate_limit');
  if(r.status!==202||result.accepted!==true||result.id!==requestID){if(r.status===503&&result.error==='mail_unavailable')requestID=crypto.randomUUID();throw Error('unavailable');}
  status.textContent='Danke! Deine Nachricht wurde zum E-Mail-Versand an den PrizeCue-Support übergeben.';
  form.reset();requestID=crypto.randomUUID();challenge=null;fetchChallenge().catch(()=>{});
 }catch(error){status.className='error';status.textContent=error.message==='rate_limit'?'Bitte warte etwas, bevor du eine weitere Nachricht sendest.':'Deine Nachricht konnte nicht versendet werden. Dein Text bleibt erhalten. Bitte versuche es später erneut.';}
 finally{button.disabled=false;button.textContent='Nachricht senden ↗';}
});
