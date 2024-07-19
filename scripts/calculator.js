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
        this.startRate05Percent = document.getElementById('rate05start');
        this.endRate05Percent = document.getElementById('rate05end');
        this.startRateOnePercent = document.getElementById('rate1start');
        this.endRateOnePercent = document.getElementById('rate1end');
    };

    // Função para formatar a data no padrão local
    formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }


    // Função para calcular a diferença exata em dias entre duas datas
    monthDiff(d1, d2) {
        // Criar cópias das datas para evitar modificar os objetos originais
        const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());

        // Calcular a diferença em dias diretamente
        const diffInTime = date2.getTime() - date1.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);

        // Retornar o valor absoluto da diferença em dias
        return Math.abs(diffInDays);
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


        let months05Percent = this.monthDiff(convertStringToDate(this.formatDate(this.startRate05Percent.value)),
            convertStringToDate(this.formatDate(this.endRate05Percent.value))) || 0;

        let monthsOnePercent = this.monthDiff(convertStringToDate(this.formatDate(this.startRateOnePercent.value)),
            convertStringToDate(this.formatDate(this.endRateOnePercent.value))) || 0;


        let rate05Percent, interest05Percent, startDate05, endDate05;
        if (months05Percent > 0) {
            rate05Percent = ((0.5 / 100)/30) * months05Percent;
            interest05Percent = adjustedValue * rate05Percent;
            startDate05 = this.formatDate(this.startRate05Percent.value);
            endDate05 = this.formatDate(this.endRate05Percent.value);
        } else {
            rate05Percent = 0;
            interest05Percent = 0;
            months05Percent = 0;
        }

        let rateOnePercent, interestOnePercent, startDate1, endDate1;
        if (monthsOnePercent > 0) {
            rateOnePercent = ((1 / 100)/30) * monthsOnePercent;
            interestOnePercent = adjustedValue * rateOnePercent;
            startDate1 = this.formatDate(this.startRateOnePercent.value);
            endDate1 = this.formatDate(this.endRateOnePercent.value);

        } else {
            rateOnePercent = 0;
            interestOnePercent = 0;
            monthsOnePercent = 0;
        }

        let totalValue = adjustedValue + interest05Percent + interestOnePercent;

        // Atribuir valores aos spans
        document.getElementById('basevalue').textContent = financialValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        document.getElementById('index-name').textContent = `(${indexMapping[index]})`;
        document.getElementById('correctionindex').textContent = adjustnumbers.accumulatedIndex.toFixed(6);
        document.getElementById('correctedvalue').textContent = adjustedValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        document.getElementById('base-date').textContent = localDateEnd;
        document.getElementById('initialbase').textContent = localDateStart;

        // juros 05%
        document.getElementById('initialDate05').textContent = startDate05;
        document.getElementById('endDate05').textContent = endDate05;
        document.getElementById("months05Percent").textContent = (months05Percent/30).toFixed(0);
        document.getElementById("rate05Percent").textContent = (rate05Percent * 100).toFixed(2) + '%';
        document.getElementById("interest05Percent").textContent = interest05Percent.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // vericar se foram selecinados juros de 05% e 1%, caso true mostrar os valores
        if (months05Percent > 0) {
            document.querySelector('.zerofivepercentrate').classList.add('visible');
        };

        // juros 1%
        document.getElementById('initialDate1').textContent = startDate1;
        document.getElementById('endDate1').textContent = endDate1;
        document.getElementById("monthsOnePercent").textContent = (monthsOnePercent/30).toFixed(0);
        document.getElementById("rateOnePercent").textContent = (rateOnePercent * 100).toFixed(2) + '%';
        document.getElementById("interestOnePercent").textContent = interestOnePercent.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // vericar se foram selecinados juros de 05% e 1%, caso true mostrar os valores

        if (monthsOnePercent > 0) {
            document.querySelector('.onepercentrate').classList.add('visible');
        };

        document.querySelector('.result-wrapper').classList.add('visible');
        document.getElementById('Total').textContent = totalValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    };

};

export const startUpdateValues = () => {
    var financialValue = document.getElementById('financial-value');
    var startDate = document.getElementById('start-date');
    var endDate = document.getElementById('end-date');
    var startRate05Percent = document.getElementById('rate05start');
    var endRate05Percent = document.getElementById('rate05end');
    var startRateOnePercent = document.getElementById('rate1start');
    var endRateOnePercent = document.getElementById('rate1end');


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

        var resultContainer = document.querySelector('.result-wrapper');
        var zerofivepercentrate = document.querySelector('.zerofivepercentrate');
        var onepercentrate = document.querySelector('.onepercentrate');

        if (resultContainer.classList.contains('display-active')) {
            resultContainer.style.display = 'none';
            resultContainer.classList.remove('display-active');
        }

        if (zerofivepercentrate.classList.contains('visible')) {
            zerofivepercentrate.classList.remove('visible');
        }

        if (onepercentrate.classList.contains('visible')) {
            onepercentrate.classList.remove('visible');
        }


        // Verifica se os campos estão preenchidos e se não possuem a classe 'input-error'
        const fieldsWithError = [financialValue, startDate, endDate
        ].filter(field => !field.value || field.classList.contains('input-error'));

        const rateDates = [startRate05Percent, endRate05Percent, startRateOnePercent,
            endRateOnePercent].filter(field => field.classList.contains('input-error'));

        const noRate05Percent = [startRate05Percent,
            endRate05Percent].filter(field => !field.value);

        const noRateOnePercent = [startRateOnePercent,
            endRateOnePercent].filter(field => !field.value);

        if (fieldsWithError.length > 0) {
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Por favor, preencha todos os campos obrigatórios antes de calcular.';
            errorMessage.style.display = 'block'; // Torna a mensagem visível

            // Adiciona a classe 'input-error' aos campos que não estão preenchidos
            fieldsWithError.forEach(field => {
                if (!field.value) {
                    field.classList.add('input-error');
                }
            }); ""
            resultContainer.classList.remove('visible');
        }
        else if (rateDates.length > 0) {
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Por favor, preencha todos os campos obrigatórios antes de calcular.';
            errorMessage.style.display = 'block'; // Torna a mensagem visível
            resultContainer.classList.remove('visible');

        } else {

            document.getElementById('error-message').style.display = 'none'; // Esconde a mensagem se tudo estiver preenchido
            document.getElementById('no-interest05').style.display = 'none'; // Esconde a mensagem se tudo estiver preenchido
            document.getElementById('no-interest1').style.display = 'none'; // Esconde a mensagem se tudo estiver preenchido

            if (noRate05Percent.length > 0) {
                const noRate05 = document.getElementById('no-interest05');
                noRate05.textContent = 'Não selecionado';
                noRate05.classList.add('no-interest');
                noRate05.style.display = 'inline'; // Torna a mensagem visível
            }

            if (noRateOnePercent.length > 0) {
                const noRateOne = document.getElementById('no-interest1');
                noRateOne.textContent = 'Não selecionado';
                noRateOne.classList.add('no-interest');
                noRateOne.style.display = 'inline'; // Torna a mensagem visível
            }

            let updateValuesInstance = new UpdateValues();
            updateValuesInstance.updateValues();
        }
    });
};




