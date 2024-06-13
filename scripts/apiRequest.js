
const CACHE_NAME = 'api-cache'; 


const dataApi = async (index, startDate, endDate) => {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${index}/dados?formato=json&dataInicial=${startDate}&dataFinal=${endDate}`;

    // Primeiro, tentamos buscar os dados do cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse && cachedResponse.ok) {
        console.log('Dados obtidos do cache'); // Adicionado para depuração
        return cachedResponse.json(); // Retorna os dados do cache se estiverem disponíveis
    }

    // Se os dados não estiverem no cache, buscamos da API
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Clonamos a resposta antes de ler o corpo
    const responseClone = response.clone();

    // Colocamos os dados da API no cache para uso futuro
    cache.put(url, responseClone);

    console.log('Dados obtidos da API'); // Adicionado para depuração

    const data = await response.json();

    return data;
};

export const apiRequest = async (index, startDate, endDate) => {
    if ((index === '') || ((startDate[3] === endDate[3]) && startDate[4] === endDate[4])) {
        return parseFloat(1.00000);
    }
    if (index === 'tjpr') {
        const values = ['190', '188'];
        const results = [];
        for (const value of values) {
            try {
                const result = await dataApi(value, startDate, endDate);
                results.push(result);
            } catch (error) {
                console.error(`Error in dataApi: ${error.message}`); // Adicionado para depuração
                window.alert(`Serviço indisponível no momento, tente novamente mais tarde.`);
                location.reload(); // Recarrega a página
            }
        };
        return await acummulatedIndex(index, results);

    }

    else {
        try {
            return await acummulatedIndex(index, await dataApi(index, startDate, endDate), endDate);

        } catch (error) {
            console.error(`Error in dataApi: ${error.message}`);
            window.alert(`Serviço indisponível no momento, tente novamente mais tarde.`);
            location.reload(); // Recarrega a página
        };
    };

};



const acummulatedIndex = async (index, data, endDate) => {
    function modifiedArray(data) {
        // Pega o último elemento do array
        let lastElement = data[data.length - 1].data;

        // Extrai os índices [3] e [4] do valor da chave 'data'
        let lastElementIndices = lastElement.slice(3, 5);

        // Extrai os índices [3] e [4] de endDate
        let endDateIndices = endDate.slice(3, 5);

        // Se os índices [3] e [4] do valor da chave 'data' são iguais aos índices [3] e [4] de endDate
        // remove o último elemento do array
        if (lastElementIndices === endDateIndices) {
            data.pop();
        }

        let accumulatedIndex = 1; // Inicializa o índice acumulado

        // Itera sobre o array de objetos do último para o primeiro
        data.reduceRight((_, item, i) => {
            // Para os outros itens, o valor é o valor atual dividido por 100, somado a 1 e multiplicado pelo índice acumulado
            accumulatedIndex *= (parseFloat(item.valor) / 100) + 1;
        }, []);

        if (index !== 'tjpr') {
            return accumulatedIndex.toFixed(6);
        }
    };

    if (index !== 'tjpr') {
        return modifiedArray(data);
    }
};






















