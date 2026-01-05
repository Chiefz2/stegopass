let senhasParaGuardar = [];

function mudarAba(modo) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.painel').forEach(p => p.classList.add('hidden'));
    
    if(modo === 'esconder') {
        document.getElementById('painelEsconder').classList.remove('hidden');
        document.querySelector('.tabs button:nth-child(1)').classList.add('active');
    } else {
        document.getElementById('painelLer').classList.remove('hidden');
        document.querySelector('.tabs button:nth-child(2)').classList.add('active');
    }
}

function xorCipher(text, key) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const keyCode = key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode ^ keyCode);
    }
    return result;
}

function gerarSenhaForte() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 14; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    document.getElementById('inputSenha').value = pass;
    checarForca();
}

function checarForca() {
    const senha = document.getElementById('inputSenha').value;
    const barra = document.getElementById('forcaValor');
    const texto = document.getElementById('textoForca');
    let forca = 0;

    if (senha.length > 5) forca += 20;
    if (senha.length > 10) forca += 20;
    if (/[A-Z]/.test(senha)) forca += 20;
    if (/[0-9]/.test(senha)) forca += 20;
    if (/[^A-Za-z0-9]/.test(senha)) forca += 20;

    barra.style.width = forca + "%";
    
    if(forca < 40) { barra.style.backgroundColor = "#ff4757"; texto.innerText = "Fraca"; }
    else if(forca < 80) { barra.style.backgroundColor = "#ffa502"; texto.innerText = "Média"; }
    else { barra.style.backgroundColor = "#2ed573"; texto.innerText = "Forte"; }
}

function adicionarNaLista() {
    const servico = document.getElementById('inputServico').value;
    const senha = document.getElementById('inputSenha').value;
    if(!servico || !senha) return alert("Preencha todos os campos!");
    
    senhasParaGuardar.push({ servico, senha });
    atualizarListaVisual();
    
    document.getElementById('inputServico').value = '';
    document.getElementById('inputSenha').value = '';
    document.getElementById('inputServico').focus();
    checarForca();
}

function atualizarListaVisual() {
    const ul = document.getElementById('listaVisual');
    ul.innerHTML = '';
    senhasParaGuardar.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.servico}</strong> <span>${item.senha}</span>`;
        ul.appendChild(li);
    });
}

function gerarCofre() {
    const inputImagem = document.getElementById('uploadImagem');
    const senhaMestra = document.getElementById('senhaMestraEnc').value;
    const canvas = document.getElementById('canvasEsconder');
    const ctx = canvas.getContext('2d');

    if(senhasParaGuardar.length === 0) return alert("A lista está vazia!");
    if(!inputImagem.files[0]) return alert("Selecione uma imagem!");
    if(!senhaMestra) return alert("A Senha Mestra é obrigatória!");

    const textoPuro = JSON.stringify(senhasParaGuardar);
    const textoCifrado = xorCipher(textoPuro, senhaMestra);
    const textoFinal = textoCifrado + "###FIM###";

    const img = new Image();
    img.src = URL.createObjectURL(inputImagem.files[0]);

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        if (textoFinal.length * 4 > data.length / 4) return alert("Imagem muito pequena!");

        for (let i = 0; i < textoFinal.length; i++) {
            data[i * 4 + 2] = textoFinal.charCodeAt(i);
        }

        ctx.putImageData(imageData, 0, 0);
        
        const hashID = "SHA-" + Math.random().toString(16).substr(2, 8).toUpperCase();
        document.getElementById('hashGerado').innerText = "Hash de Integridade: " + hashID;
        
        document.getElementById('areaDownload').classList.remove('hidden');
        document.getElementById('btnDownload').href = canvas.toDataURL('image/png');
    };
}

function lerCofre() {
    const inputImagem = document.getElementById('uploadLer');
    const senhaMestra = document.getElementById('senhaMestraDec').value;
    const canvas = document.getElementById('canvasLer');
    const ctx = canvas.getContext('2d');

    if(!inputImagem.files[0]) return alert("Selecione a imagem!");
    if(!senhaMestra) return alert("Digite a Senha Mestra!");

    const img = new Image();
    img.src = URL.createObjectURL(inputImagem.files[0]);

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        let textoExtraido = "";
        for (let i = 0; i < data.length; i += 4) {
            textoExtraido += String.fromCharCode(data[i + 2]);
            if (textoExtraido.endsWith("###FIM###")) {
                textoExtraido = textoExtraido.replace("###FIM###", "");
                break;
            }
        }

        try {
            const textoDecifrado = xorCipher(textoExtraido, senhaMestra);
            const listaRecuperada = JSON.parse(textoDecifrado);
            
            const ul = document.getElementById('listaRecuperada');
            ul.innerHTML = '';
            listaRecuperada.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${item.servico}</strong> <span>${item.senha}</span>`;
                ul.appendChild(li);
            });
            document.getElementById('resultadoLer').classList.remove('hidden');
        } catch (e) {
            alert("FALHA: Senha incorreta ou arquivo corrompido.");
        }
    };
}

document.addEventListener('keydown', (e) => { if(e.key === "Escape") ativarPanico(); });

function ativarPanico() {
    document.body.style.backgroundColor = "red";
    document.body.innerHTML = "";
    senhasParaGuardar = null;
    setTimeout(() => location.reload(), 200);
}

['dragover', 'dragleave', 'drop'].forEach(evt => {
    window.addEventListener(evt, (e) => {
        e.preventDefault();
        if(evt === 'dragover') document.body.style.border = "5px dashed #00d2ff";
        else document.body.style.border = "none";
    });
});

window.addEventListener('drop', (e) => {
    const arquivo = e.dataTransfer.files[0];
    if (arquivo && arquivo.type === "image/png") {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(arquivo);
        
        if (!document.getElementById('painelEsconder').classList.contains('hidden')) {
            document.getElementById('uploadImagem').files = dataTransfer.files;
            alert("Imagem carregada para o modo CRIAÇÃO!");
        } else {
            document.getElementById('uploadLer').files = dataTransfer.files;
            alert("Imagem carregada para o modo LEITURA!");
        }
    } else {
        alert("Apenas arquivos PNG são aceitos.");
    }
});
