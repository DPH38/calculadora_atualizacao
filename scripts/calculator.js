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
        console.log('Initializing events...'); // Adicionado para depuração
        this.financialValue.addEventListener('input', this.updateValues.bind(this));
        document.querySelectorAll('input[name="correction-index"]').forEach((element) => {
            element.addEventListener('change', this.updateValues.bind(this));
        });
        this.startDate.addEventListener('input', this.updateValues.bind(this));
        this.endDate.addEventListener('input', this.updateValues.bind(this));
    };

    // Validar se todos os valores estão preenchidos
    checkValues() {
        console.log('Checking values...'); // Adicionado para depuração
        if (this.financialValue.value === '' || this.startDate.value === '' || this.endDate.value === '') {
            alert('Por favor, preencha todos os campos antes de submeter!');
            return false;
        }
        return true;
    };

    // Função para formatar a data no padrão local
    formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Atualiza os valores
    async updateValues() {
        console.log('Updating values...'); // Adicionado para depuração

        const financialValue = parseFloat(this.financialValue.value);

        // Obter o índice selecionado
        const selectedIndex = document.querySelector('input[name="correction-index"]:checked');
        const index = selectedIndex ? selectedIndex.value : null;

        const startDate = this.startDate.value;
        const endDate = this.endDate.value;

        console.log(`startDate original: ${startDate}`); // Adicionado para depuração
        console.log(`endDate original: ${endDate}`); // Adicionado para depuração

        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        console.log(`financialValue: ${financialValue}`); // Adicionado para depuração
        console.log(`formattedStartDate: ${formattedStartDate}`); // Adicionado para depuração
        console.log(`formattedEndDate: ${formattedEndDate}`); // Adicionado para depuração
        console.log(`index: ${index}`); // Adicionado para depuração

        try {
            const indexNumber = await apiRequest(index, formattedStartDate, formattedEndDate);
            console.log(indexNumber);
        } catch (error) {
            console.error(`Error in apiRequest: ${error.message}`);
        }
    };

};

export const startUpdateValues = () => {
    document.querySelector('#financial-calculator').addEventListener('submit', (event) => {
        var financialValue = document.getElementById('financial-value');
        var correctionIndex = document.querySelectorAll('input[type=radio][name="correction-index"]');
        var startDate = document.getElementById('start-date');
        var endDate = document.getElementById('end-date');

        var isCorrectionIndexChecked = Array.prototype.slice.call(correctionIndex).some(x => x.checked);

        if (!financialValue.value || !isCorrectionIndexChecked || !startDate.value || !endDate.value) {
            console.log('Not all fields are filled'); // Adicionado para depuração
            alert('Por favor, preencha todos os campos antes de calcular.');
            event.preventDefault();
        } else {
            let updateValuesInstance = new UpdateValues();
            updateValuesInstance.updateValues();
            event.preventDefault(); // Adicionado para prevenir o comportamento padrão do submit
        }
    });
};
