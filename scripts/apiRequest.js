
const dataApi = async (index, startDate, endDate) => {
    try {
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${index}/dados?formato=json&dataInicial=${startDate}&dataFinal=${endDate}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Serviço indisponível no momento, tente novamente mais tarde.`);
    }
};

export const apiRequest = async (index, startDate, endDate) => {
    if (index === '') {
        return 1.00000;
    } else {
        try {
            const result = await dataApi(index, startDate, endDate);
            return result;
        } catch (error) {
            console.error(`Error in dataApi: ${error.message}`);
            window.alert(`Serviço indisponível no momento, tente novamente mais tarde.`);
            location.reload(); // Recarrega a página
        }
    }
};