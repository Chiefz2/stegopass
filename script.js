document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") panicMode();
});

function checkCapsLock(event, warnId) {
    const warning = document.getElementById(warnId);
    if (event.getModifierState("CapsLock")) {
        warning.style.display = "block";
    } else {
        warning.style.display = "none";
    }
}

function toggleVisibility(id) {
    const el = document.getElementById(id);
    el.type = el.type === "password" ? "text" : "password";
}

function checkStrength(val) {
    const bar = document.getElementById('strength-bar');
    const txt = document.getElementById('strength-text');
    let s = 0;
    if (val.length > 7) s++;
    if (/[A-Z]/.test(val)) s++;
    if (/[0-9]/.test(val)) s++;
    if (/[^A-Za-z0-9]/.test(val)) s++;
    
    const colors = ["#444", "#ff4444", "#ffbb33", "#00ff88", "#00ff88"];
    const labels = ["Curta", "Fraca", "Média", "Forte", "Excelente"];
    
    bar.style.width = (s * 25) + "%";
    bar.style.backgroundColor = colors[s];
    txt.innerText = labels[s];
}

function openModal() { document.getElementById('welcomeModal').style.display = 'flex'; }
function closeModal() { document.getElementById('welcomeModal').style.display = 'none'; }

let credentials = [];
let imgEnc = null;
let imgDec = null;

function switchTab(t) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-section').classList.add('active');
    event.currentTarget.classList.add('active');
}

function addCredential() {
    const s = document.getElementById('service').value;
    const p = document.getElementById('password').value;
    if (!s || !p) return alert("Preencha todos os campos!");
    credentials.push({ s, p });
    document.getElementById('temp-list').innerHTML += `<div class="cred-item"><span>${s}</span> <span>••••</span></div>`;
    document.getElementById('service').value = '';
    document.getElementById('password').value = '';
    checkStrength('');
}

function panicMode() { location.reload(); }

const setup = (zoneId, inputId, type) => {
    const z = document.getElementById(zoneId);
    const i = document.getElementById(inputId);
    z.onclick = () => i.click();
    i.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'image/png') return alert("Erro: Apenas imagens PNG são aceitas!");
        
        const r = new FileReader();
        r.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                if (type === 'enc') {
                    imgEnc = img;
                    document.getElementById('preview-container-enc').style.display = 'block';
                } else { imgDec = img; }
            };
            img.src = ev.target.result;
        };
        r.readAsDataURL(file);
    };
};
setup('drop-zone-enc', 'imageInputEnc', 'enc');
setup('drop-zone-dec', 'imageInputDec', 'dec');

function xor(t, k) {
    let r = "";
    for (let i = 0; i < t.length; i++) {
        r += String.fromCharCode(t.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    }
    return r;
}

function processEncrypt() {
    const pin = document.getElementById('masterPinEnc').value;
    if (!imgEnc || credentials.length === 0 || !pin) return alert("Preencha tudo: Imagem, Senhas e PIN!");

    const safeJson = encodeURIComponent(JSON.stringify(credentials));
    const data = xor(safeJson, pin);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgEnc.width; 
    canvas.height = imgEnc.height;
    ctx.drawImage(imgEnc, 0, 0);

    const idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const p = idata.data;
    const len = data.length;

    p[2] = (len >> 24) & 0xFF; p[3] = 255;
    p[6] = (len >> 16) & 0xFF; p[7] = 255;
    p[10] = (len >> 8) & 0xFF; p[11] = 255;
    p[14] = len & 0xFF;        p[15] = 255;

    for (let i = 0; i < len; i++) {
        const idx = (i + 4) * 4;
        if (idx + 3 < p.length) {
            p[idx + 2] = data.charCodeAt(i);
            p[idx + 3] = 255;
        }
    }

    ctx.putImageData(idata, 0, 0);
    const a = document.createElement('a');
    a.download = 'vault.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
}

function processDecrypt() {
    const pin = document.getElementById('masterPinDec').value;
    if (!imgDec || !pin) return alert("Falta a imagem ou o PIN!");

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgDec.width; 
    canvas.height = imgDec.height;
    ctx.drawImage(imgDec, 0, 0);

    const p = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    let len = (p[2] << 24) | (p[6] << 16) | (p[10] << 8) | p[14];

    if (len <= 0 || len > p.length) {
        return alert("Erro: Esta imagem não parece ser um cofre StegoPass válido.");
    }

    let enc = "";
    for (let i = 0; i < len; i++) {
        const idx = (i + 4) * 4;
        if (idx + 2 < p.length) {
            enc += String.fromCharCode(p[idx + 2]);
        }
    }

    try {
        const decryptedSafe = xor(enc, pin);
        const jsonString = decodeURIComponent(decryptedSafe);
        const decoded = JSON.parse(jsonString);

        document.getElementById('decrypted-content').innerHTML = decoded.map(c => `
            <div class="cred-item">
                <strong style="color: #fff;">${c.s}</strong> 
                <code style="color: #00ff88; background: #000; padding: 2px 5px; border-radius: 3px;">${c.p}</code>
            </div>
        `).join('');
        
        document.getElementById('result-area').style.display = 'block';
    } catch(e) { 
        console.error(e);
        alert("PIN incorreto! Os dados não puderam ser lidos."); 
    }
}
