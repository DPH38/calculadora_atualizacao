
document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('financial-value');
    input.addEventListener('keyup', function () {
        var value = input.value;
        var maskedValue = VMasker.toMoney(value);
        input.value = maskedValue;
    });
});

document.addEventListener('DOMContentLoaded', function () {
    var radios = document.querySelectorAll('input[type=radio][name="correction-index"]');
    var current = null;

    radios.forEach(function (radio) {
        radio.addEventListener('click', function () {
            if (this !== current) {
                current = this;
            } else {
                this.checked = false;
                current = null;
            }
        });
    });
});


// validaçao de data da correcao monetaria
document.addEventListener('DOMContentLoaded', function () {
    var startDateInput = document.getElementById('start-date');
    var endDateInput = document.getElementById('end-date');
    const dateStartError = document.getElementById('start-date-error');
    const dateEndError = document.getElementById('end-date-error')

    startDateInput.addEventListener('blur', function () {
        var startDate = new Date(this.value);
        var minDate = new Date('1994-08-01');
        var endDate = new Date(endDateInput.value);

        if (startDate < minDate) {
            startDateInput.classList.add('input-error');
            dateStartError.textContent = 'A data de início não pode ser anterior a 01/08/1994!';
            dateStartError.style.display = 'block';
            this.value = '';
        }

        startDateInput.addEventListener('input', function () {
            if (this.value) {
                this.classList.remove('input-error');
                dateStartError.style.display = 'none';
            }
        });

    });

    endDateInput.addEventListener('blur', function () {
        var endDate = new Date(this.value);
        var startDate = new Date(startDateInput.value);

        if (endDate < startDate) {
            endDateInput.classList.add('input-error');
            dateEndError.textContent = 'A data de término deve ser posterior à data de início!';
            dateEndError.style.display = 'block';
            this.value = '';
        }

        endDateInput.addEventListener('input', function () {
            if (this.value) {
                this.classList.remove('input-error');
                dateEndError.style.display = 'none';
            }
        });
    });
});

// validaçao de data para juros 

document.addEventListener('DOMContentLoaded', function () {
    var startRateHalfPercent = document.getElementById('rate05start');
    var endRateHalfPercent = document.getElementById('rate05end');
    var startRateOnePercent = document.getElementById('rate1start');
    var endRateOnePercent = document.getElementById('rate1end');
    const rate05StartError = document.getElementById('rate05-start-error');
    const rate05EndError = document.getElementById('rate05-end-error');
    const rate1StartError = document.getElementById('rate1-start-error');
    const rate1EndError = document.getElementById('rate1-end-error');

    function validateDates(startDateElement, endDateElement, startErrorElement, endErrorElement) {
        let startDateValue = startDateElement.value.trim();
        let endDateValue = endDateElement.value.trim();

        // Remover erros existentes
        startDateElement.classList.remove('input-error');
        endDateElement.classList.remove('input-error');
        startErrorElement.style.display = 'none';
        endErrorElement.style.display = 'none';

        // Se uma data foi preenchida sem a outra
        if ((startDateValue && !endDateValue) || (!startDateValue && endDateValue)) {
            if (!startDateValue) {
                startDateElement.classList.add('input-error');
                startErrorElement.textContent = 'Informe a data de início!';
                startErrorElement.style.display = 'block';
            }
            if (!endDateValue) {
                endDateElement.classList.add('input-error');
                endErrorElement.textContent = 'Informe a data de término!';
                endErrorElement.style.display = 'block';
            }
        }
    }

    // Configuração dos listeners
    startRateHalfPercent.addEventListener('blur', function () {
        validateDates(startRateHalfPercent, endRateHalfPercent, rate05StartError, rate05EndError);
    });
    endRateHalfPercent.addEventListener('blur', function () {
        validateDates(startRateHalfPercent, endRateHalfPercent, rate05StartError, rate05EndError);
    });

    startRateOnePercent.addEventListener('blur', function () {
        validateDates(startRateOnePercent, endRateOnePercent, rate1StartError, rate1EndError);
    });
    endRateOnePercent.addEventListener('blur', function () {
        validateDates(startRateOnePercent, endRateOnePercent, rate1StartError, rate1EndError);
    });
});











