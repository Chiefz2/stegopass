# 🔐 Stegopass

Ferramenta de Segurança da Informação que utiliza Esteganografia e Criptografia Simétrica (XOR) para ocultar credenciais dentro de imagens PNG. O processamento é 100% *Client-Side*, garantindo que os dados sensíveis nunca saem do navegador do utilizador.

## 🔗 Acesso à Aplicação
[https://chiefz2.github.io/stegopass/]

## 🚀 Funcionalidades
- **Esteganografia em PNG:** Ocultação de texto (palavras-passe, chaves, mensagens) nos bits de píxeis de uma imagem sem alterar a sua aparência visual.
- **Criptografia Simétrica (XOR):** Camada extra de segurança que cifra o texto com uma chave (PIN) antes de o injetar na imagem.
- **Privacidade por Design:** Não necessita de base de dados ou servidor (*backend*). Todo o processo de codificação e descodificação ocorre localmente no dispositivo.

## 🛠️ Tecnologias Utilizadas
- **HTML5** (Estrutura e Acessibilidade)
- **CSS3** (Estilização)
- **JavaScript Vanilla** (Lógica de manipulação da API de Canvas e *Arrays* de píxeis)

## 📦 Como executar localmente

1. Clone o repositório para a sua máquina:
```bash
git clone [https://github.com/Chiefz2/stegopass.git](https://github.com/Chiefz2/stegopass.git)
