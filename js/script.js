
/* ==========================================
   GK ARTESANATOS
   SISTEMA PRINCIPAL
========================================== */

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/M92SN4Vy1/";
const WHATSAPP_NUMERO = "5512996625667";

let modelo = null;
let carregamentoModelo = null;

document.addEventListener("DOMContentLoaded", function() {
    iniciarCarrinho();
    iniciarDarkMode();
    iniciarChat();
    iniciarReconhecimentoDeImagem();
    iniciarJanelaCarrinho();
});


/* ==========================================
   CARRINHO DE COMPRAS
========================================== */

let total = 0;
let produtosCarrinho = [];

let etapaFrete = null;
let enderecoEntrega = "";
let distanciaEntrega = null;
let valorFreteCalculado = null;

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function limparCalculoFrete() {
    etapaFrete = null;
    enderecoEntrega = "";
    distanciaEntrega = null;
    valorFreteCalculado = null;
}


/* ATUALIZAR VALORES E LISTA DO CARRINHO */

function atualizarCarrinho() {
    const valorTotal = document.getElementById("total");
    const listaCarrinho = document.getElementById("listaCarrinho");
    const quantidadeCarrinho = document.getElementById("quantidadeCarrinho");

    if (valorTotal) {
        valorTotal.textContent = formatarMoeda(total);
    }

    if (quantidadeCarrinho) {
        quantidadeCarrinho.textContent = produtosCarrinho.length;
    }

    if (!listaCarrinho) return;

    listaCarrinho.innerHTML = "";

    if (produtosCarrinho.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "carrinho-vazio";
        vazio.textContent = "Seu carrinho está vazio.";
        listaCarrinho.appendChild(vazio);
        return;
    }

    const itensAgrupados = {};

    produtosCarrinho.forEach(function(produto) {
        const chave = produto.nome + "|" + produto.preco;

        if (!itensAgrupados[chave]) {
            itensAgrupados[chave] = {
                nome: produto.nome,
                preco: produto.preco,
                quantidade: 0
            };
        }

        itensAgrupados[chave].quantidade++;
    });

    Object.values(itensAgrupados).forEach(function(produto) {
        const item = document.createElement("div");
        item.className = "item-carrinho";

        const nome = document.createElement("span");
        nome.textContent = produto.quantidade + "x " + produto.nome;

        const preco = document.createElement("span");
        preco.textContent = formatarMoeda(produto.preco * produto.quantidade);

        item.appendChild(nome);
        item.appendChild(preco);
        listaCarrinho.appendChild(item);
    });
}


/* ADICIONAR PRODUTO */

function adicionarAoCarrinho(preco, nome) {
    preco = Number(preco);

    if (!Number.isFinite(preco) || preco <= 0) {
        alert("Preço do produto inválido!");
        return;
    }

    produtosCarrinho.push({
        nome: nome || "Produto artesanal",
        preco: preco
    });

    total += preco;

    limparCalculoFrete();
    atualizarCarrinho();
}


/* INICIAR CARRINHO */

function iniciarCarrinho() {
    const vitrine = document.getElementById("vitrine");
    const btnRetirar = document.getElementById("btnRetirar");

    /*
       UM ÚNICO EVENTO NA VITRINE.

       Assim, os botões Comprar dos produtos originais
       e dos produtos carregados do Firebase funcionam.
       Isso também evita compras duplicadas.
    */

    if (vitrine) {
        vitrine.addEventListener("click", function(event) {

            const botao = event.target.closest(".comprar");

            if (!botao || !vitrine.contains(botao)) return;

            const caixaProduto = botao.closest(".produto");

            if (!caixaProduto) return;

            const titulo = caixaProduto.querySelector("h2, h3");

            const nome = titulo
                ? titulo.textContent.trim()
                : "Produto artesanal";

            const preco = Number(botao.getAttribute("data-preco"));

            adicionarAoCarrinho(preco, nome);
        });
    }

    if (btnRetirar) {
        btnRetirar.addEventListener("click", function() {
            if (produtosCarrinho.length > 0) {
                const produtoRetirado = produtosCarrinho.pop();

                total -= produtoRetirado.preco;

                limparCalculoFrete();
                atualizarCarrinho();

            } else {
                alert("Seu carrinho está vazio!");
            }
        });
    }

    atualizarCarrinho();
}


/* ==========================================
   ABRIR E FECHAR A JANELA DO CARRINHO
========================================== */

function iniciarJanelaCarrinho() {
    const btnCarrinho = document.getElementById("btnCarrinho");
    const janelaCarrinho = document.getElementById("janelaCarrinho");
    const fecharCarrinho = document.getElementById("fecharCarrinho");
    const btnFinalizarCompraCarrinho =
        document.getElementById("btnFinalizarCompraCarrinho");

    if (!btnCarrinho || !janelaCarrinho || !fecharCarrinho) {
        return;
    }

    btnCarrinho.addEventListener("click", function() {
        janelaCarrinho.classList.toggle("aberto");
    });

    fecharCarrinho.addEventListener("click", function() {
        janelaCarrinho.classList.remove("aberto");
    });

    if (btnFinalizarCompraCarrinho) {
        btnFinalizarCompraCarrinho.addEventListener("click", function() {

            if (produtosCarrinho.length === 0 || total <= 0) {
                alert("Seu carrinho está vazio! Escolha um produto antes de finalizar.");
                return;
            }

            const chat = document.getElementById("chat-container");
            const botaoAbrirChat = document.getElementById("btn-Abrir-Chat");
            const campoMensagem = document.getElementById("mensagem");
            const botaoEnviar = document.getElementById("btnEnviar");

            if (!chat || !campoMensagem || !botaoEnviar) {
                alert("Não foi possível abrir o atendimento. Atualize a página e tente novamente.");
                return;
            }

            janelaCarrinho.classList.remove("aberto");

            chat.style.display = "flex";

            if (botaoAbrirChat) {
                botaoAbrirChat.style.display = "none";
            }

            campoMensagem.value = "finalizar pedido";
            botaoEnviar.click();
        });
    }

    document.addEventListener("click", function(event) {
        const clicouNoCarrinho =
            janelaCarrinho.contains(event.target) ||
            btnCarrinho.contains(event.target);

        if (!clicouNoCarrinho) {
            janelaCarrinho.classList.remove("aberto");
        }
    });
}


/* ==========================================
   MODO ESCURO
========================================== */

function iniciarDarkMode() {
    const btnDark = document.getElementById("btnDark");

    if (!btnDark) return;

    btnDark.addEventListener("click", function() {
        document.body.classList.toggle("dark");

        const modoEscuro = document.body.classList.contains("dark");

        btnDark.textContent = modoEscuro
            ? "☀️ Modo Claro"
            : "🌙 Dark Mode";
    });
}


/* ==========================================
   ABRIR E FECHAR O CHAT
========================================== */

function alternarChat() {
    const chat = document.getElementById("chat-container");
    const btnChat = document.getElementById("btn-Abrir-Chat");

    if (!chat || !btnChat) return;

    const chatAberto = getComputedStyle(chat).display !== "none";

    if (chatAberto) {
        chat.style.display = "none";
        btnChat.style.display = "block";
    } else {
        chat.style.display = "flex";
        btnChat.style.display = "none";
    }
}

window.alternarChat = alternarChat;


/* ==========================================
   CHAT DE ATENDIMENTO
========================================== */

function iniciarChat() {
    const campoMensagem = document.getElementById("mensagem");
    const btnEnviar = document.getElementById("btnEnviar");
    const areaMensagens = document.querySelector(".chat-mensagem");

    if (!campoMensagem || !btnEnviar || !areaMensagens) return;

    function mostrarMensagem(texto, tipo) {
        const mensagem = document.createElement("p");

        mensagem.textContent = texto;
        mensagem.style.padding = "8px";
        mensagem.style.margin = "5px";
        mensagem.style.borderRadius = "8px";
        mensagem.style.whiteSpace = "pre-line";

        if (tipo === "cliente") {
            mensagem.style.textAlign = "right";
            mensagem.style.color = "#128C7E";
        } else {
            mensagem.style.textAlign = "left";
            mensagem.style.color = "#222";
        }

        areaMensagens.appendChild(mensagem);
        areaMensagens.scrollTop = areaMensagens.scrollHeight;
    }

    function mostrarFotoNaConversa(imagem) {
        const caixa = document.createElement("div");

        caixa.style.textAlign = "right";
        caixa.style.margin = "10px";

        const foto = document.createElement("img");

        foto.src = imagem;
        foto.alt = "Imagem enviada pelo cliente";
        foto.style.maxWidth = "160px";
        foto.style.maxHeight = "160px";
        foto.style.objectFit = "contain";
        foto.style.borderRadius = "10px";

        caixa.appendChild(foto);
        areaMensagens.appendChild(caixa);

        areaMensagens.scrollTop = areaMensagens.scrollHeight;
    }

    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }


    /* MONTAR MENSAGEM PARA O WHATSAPP */

    function montarMensagemWhatsApp() {
        const itensAgrupados = {};

        produtosCarrinho.forEach(function(produto) {
            const chave = produto.nome + "|" + produto.preco;

            if (!itensAgrupados[chave]) {
                itensAgrupados[chave] = {
                    nome: produto.nome,
                    preco: produto.preco,
                    quantidade: 0
                };
            }

            itensAgrupados[chave].quantidade++;
        });

        let listaProdutos = "";

        Object.values(itensAgrupados).forEach(function(produto) {
            listaProdutos +=
                "- " + produto.quantidade + "x " +
                produto.nome + " - " +
                formatarMoeda(produto.preco * produto.quantidade) +
                "\n";
        });

        const subtotal = total;
        const frete = valorFreteCalculado;
        const totalPedido = subtotal + frete;

        return (
            "Olá! Vim pelo site GK Artesanatos e gostaria de concluir minha compra. 💚\n\n" +
            "🛍️ *MEU PEDIDO*\n\n" +
            "Produtos:\n" +
            listaProdutos + "\n" +
            "📦 *ENDEREÇO DE ENTREGA*\n" +
            enderecoEntrega + "\n\n" +
            "📍 Distância informada: " +
            distanciaEntrega.toLocaleString("pt-BR", {
                maximumFractionDigits: 3
            }) + " km\n\n" +
            "💰 *RESUMO DOS VALORES*\n" +
            "Produtos: " + formatarMoeda(subtotal) + "\n" +
            "Frete: " + formatarMoeda(frete) + "\n" +
            "*TOTAL: " + formatarMoeda(totalPedido) + "*\n\n" +
            "Por favor, gostaria de confirmar meu pedido. Obrigado(a)! 💚"
        );
    }


    /* BOTÃO DE CONCLUIR PELO WHATSAPP */

    function mostrarBotaoWhatsApp() {
        const botaoAnterior = document.getElementById("botaoWhatsAppPedido");

        if (botaoAnterior) {
            botaoAnterior.parentElement.remove();
        }

        const caixa = document.createElement("div");
        caixa.style.textAlign = "center";
        caixa.style.margin = "12px 5px";
        caixa.style.padding = "10px";

        const botao = document.createElement("button");

        botao.id = "botaoWhatsAppPedido";
        botao.textContent = "📲 Concluir compra pelo WhatsApp";

        botao.style.backgroundColor = "#25D366";
        botao.style.color = "#ffffff";
        botao.style.border = "none";
        botao.style.padding = "13px 16px";
        botao.style.borderRadius = "10px";
        botao.style.fontSize = "14px";
        botao.style.fontWeight = "bold";
        botao.style.cursor = "pointer";
        botao.style.width = "100%";

        botao.addEventListener("click", function() {
            if (
                produtosCarrinho.length === 0 ||
                valorFreteCalculado === null
            ) {
                alert("Não encontrei um pedido completo para encaminhar.");
                return;
            }

            const mensagem = montarMensagemWhatsApp();

            const linkWhatsApp =
                "https://wa.me/" +
                WHATSAPP_NUMERO +
                "?text=" +
                encodeURIComponent(mensagem);

            window.open(linkWhatsApp, "_blank");
        });

        caixa.appendChild(botao);

        const explicacao = document.createElement("p");
        explicacao.textContent =
            "Clique no botão para abrir nossa conversa e enviar seu pedido.";

        explicacao.style.fontSize = "12px";
        explicacao.style.color = "#555";
        explicacao.style.marginTop = "8px";

        caixa.appendChild(explicacao);

        areaMensagens.appendChild(caixa);
        areaMensagens.scrollTop = areaMensagens.scrollHeight;
    }


    /* RESPOSTAS DO ROBÔ */

    function responderCliente(pergunta) {
        const textoOriginal = pergunta.trim();
        pergunta = normalizarTexto(pergunta);

        /* PEDIDO JÁ CALCULADO */

        if (etapaFrete === "concluido") {
            if (
                pergunta.includes("finalizar") ||
                pergunta.includes("confirmar") ||
                pergunta.includes("pedido") ||
                pergunta.includes("compra")
            ) {
                return "Seu pedido já está com o frete calculado! 💚\n\n" +
                    "RESUMO DO PEDIDO\n\n" +
                    "Endereço informado: " + enderecoEntrega + "\n" +
                    "Quantidade de itens: " + produtosCarrinho.length + "\n" +
                    "Valor dos produtos: " + formatarMoeda(total) + "\n" +
                    "Distância: " +
                    distanciaEntrega.toLocaleString("pt-BR", {
                        maximumFractionDigits: 3
                    }) + " km\n" +
                    "Frete: " + formatarMoeda(valorFreteCalculado) + "\n\n" +
                    "TOTAL DO PEDIDO: " +
                    formatarMoeda(total + valorFreteCalculado) +
                    "\n\n" +
                    "📲 Clique no botão abaixo para concluir sua compra pelo WhatsApp!";
            }

            return "Seu pedido já está calculado! 💚 Digite FINALIZAR para consultar novamente o resumo.";
        }


        /* ETAPA 1: RECEBER ENDEREÇO */

        if (etapaFrete === "endereco") {
            if (pergunta.length < 5) {
                return "Por favor, informe um endereço mais completo para a entrega. 😊";
            }

            enderecoEntrega = textoOriginal;
            etapaFrete = "distancia";

            return "Obrigada! 💚 Agora precisamos saber a distância da rota.\n\n" +
                "Abra o Google Maps e informe:\n\n" +
                "Origem: Guaratinguetá - SP\n" +
                "Destino: o endereço que você acabou de informar.\n\n" +
                "Selecione o trajeto de carro e me envie a distância exatamente como aparece no Google Maps. Pode ser em metros (m) ou quilômetros (km).\n\n" +
                "Exemplos: 850 m, 1.200 m, 2 km ou 2,5 km.";
        }


        /* ETAPA 2: RECEBER DISTÂNCIA */

        if (etapaFrete === "distancia") {
            const numeroInformado = pergunta.match(/(\d+(?:[.,]\d+)?)/);

            if (!numeroInformado) {
                return "Não consegui identificar a distância. 😊 Envie o valor com a unidade que aparece no Google Maps, por exemplo: 850 m ou 2 km.";
            }

            const textoNumero = numeroInformado[1];
            let distanciaInformada = Number(textoNumero.replace(",", "."));

            const informouMetros = /\bm\b|metro|metros/.test(pergunta);

            if (/^\d{1,3}[.,]\d{3}$/.test(textoNumero)) {
                distanciaInformada = Number(textoNumero.replace(/[.,]/g, ""));
            }

            if (
                !Number.isFinite(distanciaInformada) ||
                distanciaInformada <= 0
            ) {
                return "A distância informada não parece válida. Tente novamente, por exemplo: 850 m ou 2 km.";
            }

            const km = informouMetros
                ? distanciaInformada / 1000
                : distanciaInformada;

            /* LIMITE DE ENTREGA: 100 KM */

            if (km > 100) {
                limparCalculoFrete();

                return "Poxa, sentimos muito! 💚 A distância informada é de " +
                    km.toLocaleString("pt-BR", {
                        maximumFractionDigits: 3
                    }) +
                    " km.\n\nNossa entrega atende somente até 100 km de Guaratinguetá - SP.\n\nNão é possível efetuar essa entrega.";
            }

            /* CALCULAR FRETE */

            distanciaEntrega = km;
            valorFreteCalculado = distanciaEntrega * 4;
            etapaFrete = "concluido";

            const subtotal = total;
            const totalComFrete = subtotal + valorFreteCalculado;

            return "Frete calculado com sucesso! 💚\n\n" +
                "RESUMO DO PEDIDO\n\n" +
                "Endereço informado: " + enderecoEntrega + "\n" +
                "Quantidade de itens: " + produtosCarrinho.length + "\n" +
                "Valor dos produtos: " + formatarMoeda(subtotal) + "\n" +
                "Distância informada: " +
                distanciaEntrega.toLocaleString("pt-BR", {
                    maximumFractionDigits: 3
                }) + " km\n" +
                "Frete (R$ 4,00 por km): " +
                formatarMoeda(valorFreteCalculado) + "\n\n" +
                "TOTAL DA COMPRA: " +
                formatarMoeda(totalComFrete) + "\n\n" +
                "📲 Clique no botão abaixo para concluir sua compra pelo WhatsApp!";
        }


        /* CONSULTAR RESUMO */

        if (
            pergunta.includes("resumo") ||
            pergunta.includes("total da compra") ||
            pergunta.includes("total com frete")
        ) {
            if (valorFreteCalculado === null) {
                return "Ainda não calculamos o frete. Digite 'calcular frete' para começar. 💚";
            }

            return "RESUMO ATUALIZADO DO PEDIDO 💚\n\n" +
                "Quantidade de itens: " + produtosCarrinho.length + "\n" +
                "Valor dos produtos: " + formatarMoeda(total) + "\n" +
                "Distância: " +
                distanciaEntrega.toLocaleString("pt-BR", {
                    maximumFractionDigits: 3
                }) + " km\n" +
                "Frete: " + formatarMoeda(valorFreteCalculado) + "\n\n" +
                "TOTAL: " +
                formatarMoeda(total + valorFreteCalculado) + "\n\n" +
                "📲 Clique no botão abaixo para concluir sua compra pelo WhatsApp.";
        }


        /* INICIAR CÁLCULO DO FRETE */

        if (
            pergunta.includes("frete") ||
            pergunta.includes("entrega") ||
            pergunta.includes("entregar") ||
            pergunta.includes("calcular frete") ||
            pergunta.includes("finalizar pedido") ||
            pergunta.includes("finalizar compra")
        ) {
            if (produtosCarrinho.length === 0 || total <= 0) {
                return "Antes de calcular o frete, escolha pelo menos um produto na vitrine ou envie uma foto para o robô identificar o produto. 💚";
            }

            etapaFrete = "endereco";
            enderecoEntrega = "";
            distanciaEntrega = null;
            valorFreteCalculado = null;

            return "Vamos calcular seu frete! 💚\n\n" +
                "Primeiro, informe o endereço completo onde deseja receber seu pedido.\n\n" +
                "Depois vou pedir a distância indicada no Google Maps.";
        }


        /* DESCONTOS */

        if (
            pergunta.includes("desconto") ||
            pergunta.includes("promocao")
        ) {
            return "Temos muito carinho por nossos clientes! 💚 Consulte nossa vendedora para saber as condições especiais de desconto.";
        }


        /* COMO COMPRAR */

        if (
            pergunta.includes("como comprar") ||
            pergunta.includes("comprar") ||
            pergunta.includes("pedido") ||
            pergunta.includes("encomenda")
        ) {
            return "É muito fácil comprar! Escolha seu produto na vitrine ou envie uma foto para o Robô Assistente identificar. Depois, digite 'calcular frete' para informar o endereço e calcular o valor da entrega. 💚";
        }


        /* PREÇOS */

        if (
            pergunta.includes("preco") ||
            pergunta.includes("valor") ||
            pergunta.includes("quanto custa")
        ) {
            return "Nossos produtos têm preços variados. Confira os valores na vitrine da GK Artesanatos! 💚";
        }


        /* PRODUTOS */

        if (
            pergunta.includes("produto") ||
            pergunta.includes("artesanato") ||
            pergunta.includes("feito a mao")
        ) {
            return "Trabalhamos com peças artesanais feitas à mão e com muito carinho! Confira nossa vitrine. 💚";
        }


        /* PAGAMENTO */

        if (
            pergunta.includes("pagamento") ||
            pergunta.includes("pagar") ||
            pergunta.includes("pix")
        ) {
            return "Para saber as formas de pagamento disponíveis, entre em contato com nossa vendedora pelo WhatsApp: (12) 99662-5667. 💚";
        }


        /* SAUDAÇÕES */

        if (
            pergunta === "oi" ||
            pergunta === "ola" ||
            pergunta.includes("bom dia") ||
            pergunta.includes("boa tarde") ||
            pergunta.includes("boa noite")
        ) {
            return "Olá! Seja muito bem-vindo à GK Artesanatos! 💚 Como posso ajudar?";
        }


        /* AGRADECIMENTO */

        if (
            pergunta.includes("obrigado") ||
            pergunta.includes("obrigada")
        ) {
            return "Eu que agradeço! 💚 Será sempre um prazer atender você!";
        }

        return "Desculpe, ainda estou aprendendo! 😊 Você pode perguntar sobre frete, como comprar, preços ou produtos.";
    }


    /* ENVIAR MENSAGEM */

    function enviarMensagem() {
        const pergunta = campoMensagem.value.trim();

        if (pergunta === "") return;

        mostrarMensagem("Você: " + pergunta, "cliente");

        const resposta = responderCliente(pergunta);

        mostrarMensagem("Robô: " + resposta, "robo");

        if (
            etapaFrete === "concluido" &&
            valorFreteCalculado !== null &&
            (
                resposta.includes("RESUMO DO PEDIDO") ||
                resposta.includes("RESUMO ATUALIZADO DO PEDIDO")
            )
        ) {
            mostrarBotaoWhatsApp();
        }

        campoMensagem.value = "";
        campoMensagem.focus();
    }

    btnEnviar.addEventListener("click", enviarMensagem);

    campoMensagem.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            enviarMensagem();
        }
    });

    window.mostrarMensagemNoChat = mostrarMensagem;
    window.mostrarFotoNoChat = mostrarFotoNaConversa;
}


/* ==========================================
   CARREGAR MODELO DO TEACHABLE MACHINE
========================================== */

async function carregarModelo() {
    if (modelo) return modelo;
    if (carregamentoModelo) return carregamentoModelo;

    carregamentoModelo = (async function() {
        if (typeof tmImage === "undefined") {
            throw new Error("A biblioteca do Teachable Machine não foi carregada.");
        }

        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        modelo = await tmImage.load(modelURL, metadataURL);

        return modelo;
    })();

    try {
        return await carregamentoModelo;
    } catch (erro) {
        carregamentoModelo = null;
        throw erro;
    }
}


/* ==========================================
   IDENTIFICAR O PRODUTO
========================================== */

function identificarProduto(nomeClasse) {
    const classe = nomeClasse
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const produtos = document.querySelectorAll(".produto");

    for (const produto of produtos) {
        const titulo = produto.querySelector("h2, h3");
        const botao = produto.querySelector(".comprar");

        if (!titulo || !botao) continue;

        const nomeProduto = titulo.textContent.trim();

        const nomeNormalizado = nomeProduto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        let corresponde = false;

        if (
            classe.includes("bordado") &&
            nomeNormalizado.includes("bordado")
        ) {
            corresponde = true;

        } else if (
            classe.includes("presente") &&
            nomeNormalizado.includes("presente")
        ) {
            corresponde = true;

        } else if (
            (
                classe.includes("peca artesanal") ||
                classe.includes("peca") ||
                classe.includes("croche")
            ) &&
            (
                nomeNormalizado.includes("peca artesanal") ||
                nomeNormalizado.includes("pecas variadas") ||
                nomeNormalizado.includes("croche")
            )
        ) {
            corresponde = true;

        } else if (classe === nomeNormalizado) {
            corresponde = true;
        }

        if (corresponde) {
            return {
                nome: nomeProduto,
                preco: Number(botao.getAttribute("data-preco"))
            };
        }
    }

    return null;
}


/* ==========================================
   MOSTRAR PRODUTO E BOTÃO COMPRAR NO CHAT
========================================== */

function mostrarProdutoReconhecido(produto) {
    const areaMensagens = document.querySelector(".chat-mensagem");

    if (!areaMensagens) return;

    const caixa = document.createElement("div");

    caixa.style.backgroundColor = "#e8f5e9";
    caixa.style.padding = "12px";
    caixa.style.margin = "10px";
    caixa.style.borderRadius = "10px";
    caixa.style.color = "#222";

    const nome = document.createElement("p");
    nome.textContent = "Produto identificado: " + produto.nome;

    const preco = document.createElement("p");
    preco.textContent = "Preço: " + formatarMoeda(produto.preco);

    const botaoComprar = document.createElement("button");

    botaoComprar.textContent = "🛒 Comprar";
    botaoComprar.style.backgroundColor = "#128C7E";
    botaoComprar.style.color = "white";
    botaoComprar.style.border = "none";
    botaoComprar.style.padding = "10px 15px";
    botaoComprar.style.borderRadius = "8px";
    botaoComprar.style.cursor = "pointer";

    botaoComprar.addEventListener("click", function() {
        adicionarAoCarrinho(produto.preco, produto.nome);

        botaoComprar.textContent = "✔ Adicionado ao carrinho";
        botaoComprar.disabled = true;
        botaoComprar.style.opacity = "0.7";

        window.mostrarMensagemNoChat(
            "Robô: " + produto.nome + " foi adicionado ao seu carrinho! 💚",
            "robo"
        );
    });

    caixa.appendChild(nome);
    caixa.appendChild(preco);
    caixa.appendChild(botaoComprar);

    areaMensagens.appendChild(caixa);
    areaMensagens.scrollTop = areaMensagens.scrollHeight;
}


/* ==========================================
   RECONHECIMENTO DE IMAGENS
========================================== */

function iniciarReconhecimentoDeImagem() {
    const campoImagem = document.getElementById("imagemChat");

    if (!campoImagem) return;

    campoImagem.addEventListener("change", async function() {
        const arquivo = campoImagem.files[0];

        if (!arquivo) return;

        if (!arquivo.type.startsWith("image/")) {
            window.mostrarMensagemNoChat(
                "Robô: Por favor, escolha um arquivo de imagem. 😊",
                "robo"
            );

            campoImagem.value = "";
            return;
        }

        const enderecoImagem = URL.createObjectURL(arquivo);

        window.mostrarFotoNoChat(enderecoImagem);

        window.mostrarMensagemNoChat(
            "Robô: Recebi sua imagem! Estou analisando... 🔎",
            "robo"
        );

        try {
            const imagem = new Image();
            imagem.src = enderecoImagem;

            await new Promise(function(resolve, reject) {
                imagem.onload = resolve;
                imagem.onerror = reject;
            });

            const modeloCarregado = await carregarModelo();
            const previsoes = await modeloCarregado.predict(imagem);

            previsoes.sort(function(a, b) {
                return b.probability - a.probability;
            });

            const melhorResultado = previsoes[0];

            const porcentagem = (
                melhorResultado.probability * 100
            ).toFixed(1);

            if (melhorResultado.probability < 0.70) {
                window.mostrarMensagemNoChat(
                    "Robô: Não consegui identificar o produto com segurança. 😊 Tente enviar outra foto, com o produto mais visível.",
                    "robo"
                );

                return;
            }

            const produto = identificarProduto(
                melhorResultado.className
            );

            if (produto) {
                window.mostrarMensagemNoChat(
                    "Robô: Encontrei o produto! Tenho " +
                    porcentagem +
                    "% de confiança na identificação. 💚",
                    "robo"
                );

                mostrarProdutoReconhecido(produto);

            } else {
                window.mostrarMensagemNoChat(
                    "Robô: A imagem parece pertencer à categoria '" +
                    melhorResultado.className +
                    "', com " +
                    porcentagem +
                    "% de confiança. Ainda não consegui relacionar essa categoria a um produto da nossa vitrine. 💚",
                    "robo"
                );
            }

        } catch (erro) {
            console.error("Erro ao analisar imagem:", erro);

            window.mostrarMensagemNoChat(
                "Robô: Não consegui analisar essa imagem. Verifique sua conexão e tente novamente. 😊",
                "robo"
            );

        } finally {
            URL.revokeObjectURL(enderecoImagem);
            campoImagem.value = "";
        }
    });
}


/* ==========================================
   PRODUTOS CADASTRADOS NO FIREBASE
========================================== */

window.carregarProdutosFirebase = function(produtos) {

    const vitrine = document.getElementById("vitrine");

    if (!vitrine) {
        console.error("A vitrine não foi encontrada.");
        return;
    }

    // Remove os produtos antigos vindos do Firebase.
    vitrine.querySelectorAll(".produto-firebase").forEach(function(item) {
        item.remove();
    });

    produtos.forEach(function(produto) {

        const nome = produto.nome || "Produto artesanal";
        const descricao = produto.descricao || "Feito à mão com carinho.";

        const preco = Number(
            String(produto.preco || "0").replace(",", ".")
        );

        if (!Number.isFinite(preco) || preco <= 0) {
            console.warn("Produto com preço inválido:", produto);
            return;
        }

        const imagem = produto.imagem || "";

        const caixa = document.createElement("div");
        caixa.className = "produto produto-firebase";

        const foto = document.createElement("img");

        if (imagem) {
            foto.src = imagem;
        } else {
            foto.alt = "Imagem não cadastrada";
        }

        foto.alt = nome;

        const titulo = document.createElement("h3");
        titulo.textContent = nome;

        const texto = document.createElement("p");
        texto.textContent = descricao;

        const valor = document.createElement("p");
        valor.className = "preco";
        valor.textContent = formatarMoeda(preco);

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "comprar";
        botao.setAttribute("data-preco", preco);
        botao.textContent = "🛒 Comprar";

        caixa.appendChild(foto);
        caixa.appendChild(titulo);
        caixa.appendChild(texto);
        caixa.appendChild(valor);
        caixa.appendChild(botao);

        vitrine.appendChild(caixa);
    });

    console.log("Produtos carregados do Firebase:", produtos.length);
};
