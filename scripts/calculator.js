import { apiRequest } from './apiRequest.js';

class UpdateValues {

    constructor() {
        // Inicializa os elementos do DOM
        this.initElements();
    };

    // Inicializa os elementos do DOM
    initElements() {
        console.log('Initializing elements...'); // Adicionado para depuração
        this.financialValue = document.getElementById('financial-value');
        this.startDate = document.getElementById('start-date');
        this.endDate = document.getElementById('end-date');
    };

    // Função para formatar a data no padrão local
    formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Atualiza os valores
    async updateValues() {
        function swapCommaAndDot(str) {
            return str.replace(/\./g, '').replace(/,/g, '.');
        }

        const indexMapping = {
            '188': 'INPC',
            '189': 'IGP-M',
            'tjpr': 'TJPR',
            '433': 'IPCA',
            "": ""
          };

        const financialValue = parseFloat(swapCommaAndDot(this.financialValue.value));

        // Obter o índice selecionado, se nenhum for selecionado, definir como string vazia
        const selectedIndex = document.querySelector('input[name="correction-index"]:checked');
        const index = selectedIndex ? selectedIndex.value : '';

        const startDate = this.startDate.value;
        const endDate = this.endDate.value;

        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        const adjustnumbers = await apiRequest(index, formattedStartDate, formattedEndDate);


        // multiplicar o valor financeiro pelo índice
        const adjustedValue = financialValue * adjustnumbers.accumulatedIndex;
        const localDate = adjustnumbers.baseDate.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
        });

        // Atribuir valores aos spans
        document.getElementById('basevalue').textContent = financialValue.toFixed(2).replace('.', ',');
        document.getElementById('correctionindex').textContent = adjustnumbers.accumulatedIndex.toFixed(6);
        document.getElementById('correctedvalue').textContent = adjustedValue.toFixed(2).replace('.', ',');
        document.getElementById('base-date').textContent = localDate;
        document.getElementById('index-name').textContent =  indexMapping[index];

        document.querySelector('.result-container').classList.add('display-active');
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




