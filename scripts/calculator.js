import { apiRequest } from './apiRequest.js';

class UpdateValues {

    constructor() {
        // Inicializa os elementos do DOM
        this.initElements();

        // Inicializa os eventos
        this.initEvents();

    };

    // Inicializa os elementos do DOM
    initElements() {
        console.log('Initializing elements...'); // Adicionado para depuração
        this.financialValue = document.getElementById('financial-value');
        this.startDate = document.getElementById('start-date');
        this.endDate = document.getElementById('end-date');
    };

    // Inicializa os eventos
    initEvents() {
        // Nenhum evento para inicializar
    };

    // Função para formatar a data no padrão local
    formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Atualiza os valores
    async updateValues() {
        console.log('Updating values...'); // Adicionado para depuração

        // Função para trocar vírgulas por pontos e vice-versa
        function swapCommaAndDot(str) {
            return str.replace(/\./g, '').replace(/,/g, '.');
        }

        const financialValue = parseFloat(swapCommaAndDot(this.financialValue.value));

        // Obter o índice selecionado, se nenhum for selecionado, definir como string vazia
        const selectedIndex = document.querySelector('input[name="correction-index"]:checked');
        const index = selectedIndex ? selectedIndex.value : '';

        const startDate = this.startDate.value;
        const endDate = this.endDate.value;

        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        try {
            const indexNumber = await apiRequest(index, formattedStartDate, formattedEndDate);
            console.log(indexNumber);
        } catch (error) {
            console.error(`Error in apiRequest: ${error.message}`);
            window.alert(`Serviço indisponível no momento, tente novamente mais tarde.`);
            location.reload(); // Recarrega a página
        }

    };

};

export const startUpdateValues = () => {
    document.querySelector('#financial-calculator').addEventListener('submit', (event) => {
        var financialValue = document.getElementById('financial-value');
        var startDate = document.getElementById('start-date');
        var endDate = document.getElementById('end-date');

        // Obrigated fields
        if (!financialValue.value || !startDate.value || !endDate.value) {
            console.log('Not all fields are filled'); // Adicionado para depuração
            alert('Por favor, preencha todos os campos obrigatórios antes de calcular.');

            // Add 'input-error' class to fields that are not filled
            if (!financialValue.value) {
                financialValue.classList.add('input-error');
            }
            if (!startDate.value) {
                startDate.classList.add('input-error');
            }
            if (!endDate.value) {
                endDate.classList.add('input-error');
            }
            event.preventDefault();
        }

        else {
            let updateValuesInstance = new UpdateValues();
            updateValuesInstance.updateValues();
            event.preventDefault(); // Adicionado para prevenir o comportamento padrão do submit
        }
    });
};