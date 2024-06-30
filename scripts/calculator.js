import { apiRequest, convertStringToDate } from './apiRequest.js';

class UpdateValues {

    constructor() {
        // Inicializa os elementos do DOM
        this.initElements();
    };

    // Inicializa os elementos do DOM
    initElements() {
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
        const formattedStartDate = this.formatDate(this.startDate.value);
        const formattedEndDate = this.formatDate(this.endDate.value);

        const adjustnumbers = await apiRequest(index, formattedStartDate, formattedEndDate);

        // multiplicar o valor financeiro pelo índice
        const adjustedValue = financialValue * adjustnumbers.accumulatedIndex;

        const localDateStart = convertStringToDate(formattedStartDate).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
        });

        const localDateEnd = adjustnumbers.baseDate.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
        });

        // Atribuir valores aos spans
        document.getElementById('basevalue').textContent = financialValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        document.getElementById('correctionindex').textContent = adjustnumbers.accumulatedIndex.toFixed(6);
        document.getElementById('correctedvalue').textContent = adjustedValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        document.getElementById('base-date').textContent = localDateEnd;
        document.getElementById('index-name').textContent = indexMapping[index];
        document.getElementById('initialbase').textContent = localDateStart;
        document.querySelector('.result-container').style.display = 'block';
        document.querySelector('.result-container').classList.add('display-active');
    };

};

export const startUpdateValues = () => {
    var financialValue = document.getElementById('financial-value');
    var startDate = document.getElementById('start-date');
    var endDate = document.getElementById('end-date');

    // Adiciona um ouvinte de evento 'input' para remover a classe 'input-error' quando o campo for preenchido
    financialValue.addEventListener('input', function () {
        if (this.value) {
            this.classList.remove('input-error');
        }
    });

    startDate.addEventListener('input', function () {
        if (this.value) {
            this.classList.remove('input-error');
        }
    });

    endDate.addEventListener('input', function () {
        if (this.value) {
            this.classList.remove('input-error');
        }
    });

    document.querySelector('#financial-calculator').addEventListener('submit', (event) => {
        event.preventDefault();

        var resultContainer = document.querySelector('.result-container');

        if (resultContainer.classList.contains('display-active')) {
            resultContainer.style.display = 'none';
            resultContainer.classList.remove('display-active');
        }

        // Obrigated fields
        if (!financialValue.value || !startDate.value || !endDate.value) {
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Por favor, preencha todos os campos obrigatórios antes de calcular.';
            errorMessage.style.display = 'block'; // Torna a mensagem visível

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
            document.getElementById('error-message').style.display = 'none'; // Esconde a mensagem se tudo estiver preenchido
            let updateValuesInstance = new UpdateValues();
            updateValuesInstance.updateValues();

        }
    });
};




