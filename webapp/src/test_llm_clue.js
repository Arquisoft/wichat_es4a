import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

async function getClue(name, userQuestion, language) {
    try {

        let message = await axios.post(`${apiEndpoint}/askllm/clue`, { name, userQuestion, language })
      
        return message;

    } catch (error) {
      console.error(error.response.data);
    }
}

// Descomentar para probar la función

getClue("El guernica", "Quién fue el pintor", "es").then((res) => {
  console.log(res.data.answer);
});