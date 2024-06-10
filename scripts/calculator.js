
import { apiRequest } from './apiRequest.js';

class UpdateValues {

    constructor() {
        // starting  DOM elements
        this.initElements();

        // Inicializa os eventos
        this.initEvents();
    };

    // Inicializa os elementos do DOM
    initElements() {
        this.financialValue = document.getElementById('financialValue');
        let radioButton = document.querySelector('input[name="correction-index-cards"]:checked');
        this.index = radioButton ? radioButton.value : null;
        this.startDate = document.getElementById('startDate');
        this.endDate = document.getElementById('endDate');
    };

    // Inicializa os eventos
    initEvents() {
        this.financialValue.addEventListener('input', this.updateValues.bind(this));
        document.querySelectorAll('input[name="correction-index-cards"]').forEach((element) => {
            element.addEventListener('change', this.updateValues.bind(this));
        });
        this.startDate.addEventListener('input', this.updateValues.bind(this));
        this.endDate.addEventListener('input', this.updateValues.bind(this));
    };

    // validar se todos os valores estão preenchidos
    checckValues() {
        if (this.financialValue.value === '' || this.startDate.value === '' || this.endDate.value === '') {
            alert('Preencha todos os campos!');
            return false;
        }
        return true;
    };

    // Atualiza os valores

    async updateValues() {
        const financialValue = parseFloat(this.financialValue.value);
        const startDate = new Date(this.startDate.value);
        const endDate = new Date(this.endDate.value);
        const index = String(this.index);

        try {
            const indexNumber = await apiRequest(index, startDate, endDate);
            console.log(indexNumber);
        } catch (error) {
            console.error(`Error in apiRequest: ${error.message}`);
        }
    };

};

export const startUpdateValues = () => {
    document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        new UpdateValues();
    });
};