//Controller
const buttonAdicionar = document.getElementById("button-adicionar");
let listagem = document.getElementById("listagem");
let divTotalMoedaOrigem = document.getElementById("div-total-moeda-origem");
let divTotalMoedaDestino = document.getElementById("div-total-moeda-destino");
localStorage.setItem("itens", JSON.stringify(new Array()));

buttonAdicionar.addEventListener("click", async () => {

    const inputDescricao = document.getElementById("input-descricao").value;
    const inputQuantidade = document.getElementById("input-quantidade").value;
    const inputValor = document.getElementById("input-valor").value;
    const selectMoedaDe = document.getElementById("select-moeda-de").value;
    const selectMoedaPara = document.getElementById("select-moeda-para").value;

    if (inputDescricao === '' || inputQuantidade === '' || inputValor === ''){
        alert('Por favor, preencha os campos!');
        return false;
    }

    if (selectMoedaDe === '0') {
        alert('Selecione uma Moeda de Origem');
        return false;
    }

    if (selectMoedaPara === '0') {
        alert('Selecione uma Moeda de Destino');
        return false;
    }

    if (selectMoedaDe === selectMoedaPara) {
        alert('Selecione moedas diferentes');
        return false;
    }

    try {
        const responseApi = await fetch(`https://api.exchangerate-api.com/v4/latest/${selectMoedaDe}`);
        const dados = await responseApi.json();
        
        if (dados.erro) {
            alert("Moeda não encontrada");
        } else {
            const rate = dados.rates[selectMoedaPara];
            let itens = JSON.parse(localStorage.getItem("itens"));
            let indexEdicao = localStorage.getItem("indexEdicao");

            let item = {};
            item.descricao = inputDescricao;
            item.quantidade = inputQuantidade;
            item.valor = parseFloat(inputValor);
            item.moedaDe = selectMoedaDe;
            item.moedaPara = selectMoedaPara;
            item.valorConvertido = parseFloat(((item.valor * item.quantidade) * rate).toFixed(2));
            
            if (indexEdicao) {
                itens[indexEdicao] = item;
                localStorage.removeItem("indexEdicao");
            } else {
                itens.push(item);
            }

            localStorage.setItem("itens", JSON.stringify(itens));

            montarListagem(itens);
            
            limparCampos();
        }

    } catch (error) {
         alert("Ocorreu um erro ao buscar o valor para conversão");
    }

});

function montarListagem(itens){
    listagem.innerHTML = '';
    divTotalMoedaOrigem.innerHTML = '';
    divTotalMoedaDestino.innerHTML = '';
    let conteudo = '';
    let totalMoedaOrigem = 0.0;
    let totalMoedaDestino = 0.0;
    itens.forEach((item, index) => {

        conteudo += `
            <div class="row">
              <div class="col-8"><span>${item.descricao} | Quant.: ${item.quantidade} | Valor: ${item.valor} ${item.moedaDe} => ${item.valorConvertido} ${item.moedaPara}</span></div>
              <div class="col-4">
                <button id="button-excluir" style="width: 60px; margin-bottom: 2px;" class="btn btn-secondary btn-sm float-right mr-2" onclick="excluirItem(${index})">Excluir</button>
                <button id="button-alterar" style="width: 60px; margin-bottom: 2px;" class="btn btn-secondary btn-sm float-right mr-2" onclick="editarItem(${index})">Alterar</button>
              </div>
            </div>

        `;
        totalMoedaOrigem += item.valor;
        totalMoedaDestino += item.valorConvertido;
    });
    listagem.innerHTML = conteudo;
    
    if (totalMoedaOrigem != 0){
        divTotalMoedaOrigem.innerHTML = `<span>Total (Moeda de Origem): ${totalMoedaOrigem.toFixed(2)}</span>`;
    }

    if (totalMoedaDestino != 0){
        divTotalMoedaDestino.innerHTML = `<span>Total (Moeda de Destino): ${totalMoedaDestino.toFixed(2)}</span>`;
    }
}

function editarItem(index) {
    let itens = JSON.parse(localStorage.getItem("itens"));
    let item = itens[index];

    document.getElementById("input-descricao").value = item.descricao;
    document.getElementById("input-quantidade").value = item.quantidade;
    document.getElementById("input-valor").value = item.valor;
    document.getElementById("select-moeda-de").value = item.moedaDe;
    document.getElementById("select-moeda-para").value = item.moedaPara;

    localStorage.setItem("indexEdicao", index);
}

function excluirItem(index) {
    let itens = JSON.parse(localStorage.getItem("itens"));
    const item = itens[index];
    itens.splice(index, 1);
    localStorage.setItem("itens", JSON.stringify(itens));
    montarListagem(itens);
    alert(`O item ${item.descricao} esté sendo removido da lista`);
}

function limparCampos(){
    document.getElementById("input-descricao").value = '';
    document.getElementById("input-quantidade").value = '';
    document.getElementById("input-valor").value = '';
    document.getElementById("select-moeda-de").value = '0';
    document.getElementById("select-moeda-para").value = '0';
}
