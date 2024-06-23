
const CACHE_NAME = 'api-cache';

// values for tjpr index before 06/1995
const tjprBefore = [
    {
        "data": "01/06/1995",
        "valor": 1.8200
    },
    {
        "data": "01/05/1995",
        "valor": 2.5700
    },
    {
        "data": "01/04/1995",
        "valor": 1.9200
    },
    {
        "data": "01/03/1995",
        "valor": 1.4100
    },
    {
        "data": "01/02/1995",
        "valor": 0.9900
    },
    {
        "data": "01/01/1995",
        "valor": 1.6700
    },
    {
        "data": "01/12/1994",
        "valor": 2.1900
    },
    {
        "data": "01/11/1994",
        "valor": 3.2700
    },
    {
        "data": "01/10/1994",
        "valor": 1.8600
    },
    {
        "data": "01/09/1994",
        "valor": 1.5100
    },
    {
        "data": "01/08/1994",
        "valor": 5.4600
    }
];


// Função de pausa
const pause = (duration) => new Promise(res => setTimeout(res, duration));

const dataApi = async (index, startDate, endDate) => {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${index}/dados?formato=json&dataInicial=${startDate}&dataFinal=${endDate}`;

    // Primeiro, tentamos buscar os dados do cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse && cachedResponse.ok) {
        console.log('Dados obtidos do cache'); // Adicionado para depuração
        return await cachedResponse.json(); // Retorna os dados do cache se estiverem disponíveis
    }

    // Se os dados não estiverem no cache, buscamos da API
    // Introduzimos um atraso de 1 segundo (100 milissegundos) antes de fazer a chamada para a API
    await pause(100);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Clonamos a resposta antes de ler o corpo
    const responseClone = response.clone();

    // Colocamos os dados da API no cache para uso futuro
    await cache.put(url, responseClone);

    console.log('Dados obtidos da API'); // Adicionado para depuração

    const data = await response.json();

    return data;
};

function monthDiff(date1, date2) {
    var years = date2.getFullYear() - date1.getFullYear();
    var months = date2.getMonth() - date1.getMonth();
    var totalMonths = (years * 12) + months;

    // If date2 is less than date1, subtract 1 from totalMonths
    if (date2.getDate() < date1.getDate()) {
        totalMonths--;
    }
    return totalMonths <= 0 ? 0 : totalMonths;
}

// Função auxiliar para converter uma string de data em um objeto Date
function convertStringToDate(dateString) {
    const dateParts = dateString.split("/");
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
}

export const apiRequest = async (index, startDate, endDate) => {
    if ((index === '') || ((startDate[3] === endDate[3]) && (startDate[4] === endDate[4]) && (startDate[8] === endDate[8]) && (startDate[9] === endDate[9]))) {
        return {
            accumulatedIndex: parseFloat(1.00000),
            baseDate: convertStringToDate(endDate)
        };
    }
    if (index === 'tjpr') {
        const values = ['190', '188'];
        const dataArrays = [];

        let getTjprBefore = 0;

        // Converta startDate para um objeto Date
        const compareDate = new Date(1995, 6, 1); // no js o mês começa em 0, então 6 é julho
        let startDateObj = convertStringToDate(startDate);

        // Se startDate for antes de 01/07/1995, defina-o como 01/07/1995
        if (startDateObj < compareDate) {
            // armazenar starDate antes de alterar
            const oldStartDate = startDate;
            startDate = "01/07/1995";
            getTjprBefore = monthDiff(convertStringToDate(oldStartDate), convertStringToDate(startDate));
        }

        for (const value of values) {
            try {
                // Armazene os arrays retornados de dataApi
                dataArrays.push(await dataApi(value, startDate, endDate));

            } catch (error) {
                console.error(`Error in dataApi: ${error.message}`); // Adicionado para depuração
                window.alert(`Serviço indisponível no momento, tente novamente mais tarde.`);
                location.reload(); // Recarrega a página
            }
        }

        // Compare o tamanho dos arrays e remova o último elemento do array maior
        if (dataArrays[0].length !== dataArrays[1].length) {
            if (dataArrays[0].length > dataArrays[1].length) {
                dataArrays[0].pop();
            } else {
                dataArrays[1].pop();
            }
        }

        // Crie um array averageArray onde cada elemento é a média dos elementos correspondentes em dataArrays[0] e dataArrays[1]

        let averageArray = dataArrays[0].map((item, index) => {
            return {
                data: item.data, // assumindo que cada item tem uma propriedade 'data'
                valor: (parseFloat(item.valor) + parseFloat(dataArrays[1][index].valor)) / 2
            };
        });

        // Se getTjprBefore for maior que 0, adicione os valores de tjprBefore ao início de averageArray

        if (getTjprBefore > 0) {
            // Cria um array temporário para armazenar os elementos de tjprBefore
            const tempArray = [];
            for (let i = 0; i < getTjprBefore; i++) {
                tempArray.unshift({
                    data: tjprBefore[i].data,
                    valor: tjprBefore[i].valor
                });
            }
            // Adiciona todos os elementos de tempArray ao início de averageArray de uma vez, mantendo a ordem original
            averageArray.unshift.apply(averageArray, tempArray);
        }

        // Chame acummulatedIndex com averageArray e endDate        
        const result = await acummulatedIndex(averageArray, endDate);

        averageArray = [];

        // Return both accumulatedIndex and baseDate
        return {
            accumulatedIndex: parseFloat(result.accumulatedIndex),
            baseDate: result.baseDate
        };
    }

    else {
        try {
            return await acummulatedIndex(await dataApi(index, startDate, endDate), endDate);

        } catch (error) {
            console.error(`Error in dataApi: ${error.message}`);
            window.alert(`Serviço indisponível no momento, tente novamente mais tarde.`);
            location.reload(); // Recarrega a página
        };
    };
};

const acummulatedIndex = async (data, endDate) => {

    let baseDate;

    function modifiedArray(data) {

        // Pega o último elemento do array
        let lastElement = data[data.length - 1].data;

        baseDate = convertStringToDate(lastElement);

        // Extrai os índices [3] e [4] do valor da chave 'data'
        let lastElementIndices = lastElement.slice(3, 5);

        // Extrai os índices [3] e [4] de endDate
        let endDateIndices = endDate.slice(3, 5);

        // Se os índices [3] e [4] do valor da chave 'data' são iguais aos índices [3] e [4] de endDate
        // remove o último elemento do array
        if (lastElementIndices === endDateIndices) {
            let lastElement = data[data.length - 1].data;
            baseDate = convertStringToDate(lastElement);
            data.pop();
        } else {
            const endSelected = convertStringToDate(endDate);
            const diff = monthDiff(baseDate, endSelected);
            baseDate.setMonth(baseDate.getMonth() + 1);
            // If monthDiff is greater than 1, set baseDate to baseDate, otherwise set it to currentDate
            baseDate = diff > 1 ? baseDate : endSelected;
        }
        return data;
    };

    function indexNumber(data) {

        let accumulatedIndex = 1; // Inicializa o índice acumulado

        // Itera sobre o array de objetos do último para o primeiro
        data.reduceRight((_, item, i) => {
            // Para os outros itens, o valor é o valor atual dividido por 100, somado a 1 e multiplicado pelo índice acumulado
            accumulatedIndex *= parseFloat(((parseFloat(item.valor) / 100) + 1).toFixed(9));
        }, []);

        return accumulatedIndex;
    };

    // Process the array and calculate accumulatedIndex
    const accumulatedIndex = indexNumber(modifiedArray(data));


    // Return an object containing the accumulatedIndex and the new base date
    return {
        accumulatedIndex: accumulatedIndex,
        baseDate: baseDate
    };
};






















