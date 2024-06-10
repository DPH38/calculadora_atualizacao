
document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('financial-value');
    input.addEventListener('keyup', function() {
        var value = input.value;
        var maskedValue = VMasker.toMoney(value);
        input.value = maskedValue;
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var radios = document.querySelectorAll('input[type=radio][name="correction-index"]');
    var current = null;

    radios.forEach(function(radio) {
        radio.addEventListener('click', function() {
            if (this !== current) {
                current = this;
            } else {
                this.checked = false;
                current = null;
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var startDateInput = document.getElementById('start-date');
    var endDateInput = document.getElementById('end-date');

    startDateInput.addEventListener('blur', function() {
        var startDate = new Date(this.value);
        var minDate = new Date('1994-08-01');
        var endDate = new Date(endDateInput.value);

        if (startDate < minDate) {
            alert('A data de início não pode ser anterior a 01/08/1994');
            this.value = '';
        } else if (startDate > new Date()) {
            alert('A data de início não pode ser posterior a hoje');
            this.value = '';
        } else if (startDate > endDate) {
            alert('A data de início não pode ser posterior à data de término');
            this.value = '';
        }
    });

    endDateInput.addEventListener('blur', function() {
        var endDate = new Date(this.value);
        var minDate = new Date('1994-08-01');
        var startDate = new Date(startDateInput.value);
        var today = new Date();

        // Ajusta a data para o inicio do dia
        today.setHours(0, 0, 0, 0);

        if (endDate < minDate) {
            alert('A data de término não pode ser anterior a 01/08/1994');
            this.value = '';
        } else if (endDate > today) {
            alert('A data de término não pode ser posterior a hoje');
            this.value = '';
        } else if (endDate <= startDate) {
            alert('A data de término deve ser posterior à data de início');
            this.value = '';
        }
    });
});


document.querySelector('button[type="submit"]').addEventListener('click', function(event) {
    var financialValue = document.getElementById('financial-value');
    var correctionIndex = document.querySelectorAll('input[type=radio][name="correction-index"]');
    var startDate = document.getElementById('start-date');
    var endDate = document.getElementById('end-date');

    var isCorrectionIndexChecked = Array.prototype.slice.call(correctionIndex).some(x => x.checked);

    if (!financialValue.value || !isCorrectionIndexChecked || !startDate.value || !endDate.value) {
        alert('Por favor, preencha todos os campos antes de calcular.');
        event.preventDefault();
    }
});