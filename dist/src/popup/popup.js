document.addEventListener('DOMContentLoaded', () => {
    const resultDiv = document.getElementById('result');


    chrome.storage.local.get(['selectedWord'], async (result) => {
        const word = result.selectedWord;
        if (word) {

            chrome.storage.local.remove('selectedWord');
            await getDefinition(word);
        }
    });

    async function getDefinition(word) {
        resultDiv.innerHTML = `<p>Buscando definição para "<strong>${word}</strong>"...</p>`;
        try {

            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

            if (!response.ok) {
                throw new Error('Palavra não encontrada.');
            }

            const data = await response.json();
            displayDefinition(data[0]);

        } catch (error) {
            resultDiv.innerHTML = `<p class="error">Não foi possível encontrar a definição. Tente outra palavra.</p>`;
        }
    }

    function displayDefinition(data) {
        const word = data.word;
        const meaning = data.meanings[0].definitions[0].definition;

        resultDiv.innerHTML = `
      <h2>${word}</h2>
      <div class="definition">
        <p>${meaning}</p>
      </div>
    `;
    }
});