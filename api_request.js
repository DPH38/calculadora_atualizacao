
// obtendo o valor do índice escolhido
document.querySelector('button[type="submit"]').addEventListener('click', function(event) {
    event.preventDefault(); // Evita o envio do formulário

    // Obtém o valor do input de rádio selecionado
    var correctionIndex = document.querySelector('input[name="correction-index"]:checked').value;

    console.log(correctionIndex);
});


// obtendo o valor do intervalo de datas
document.querySelector('button[type="submit"]').addEventListener('click', function(event) {
    event.preventDefault(); // Evita o envio do formulário

    var startDate = document.querySelector('#start-date').value;
    var endDate = document.querySelector('#end-date').value;

    console.log(startDate, endDate);
});

