const r = await fetch("https://chatkit-uii.onrender.com/chatkit/start", {
  method: "POST",
});
const { client_secret } = await r.json();
return client_secret;
