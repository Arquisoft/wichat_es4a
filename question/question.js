import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 8007;

app.use(express.json());

const url = "https://query.wikidata.org/sparql";

function loadQuestionTemplatesWithTopicLanguage(topics, lang) {
  const filePath = path.resolve('question', 'question_template.json');

  const data = fs.readFileSync(filePath, 'utf-8');
  const templates = JSON.parse(data);

  const topicsArray = Array.isArray(topics) ? topics : [topics];

  const filteredTemplates = templates.filter(template =>
    topicsArray.some(topic => template.topics.includes(topic))
  );

  const filteredTemplatesLanguage = filteredTemplates.filter(template => template.lang === lang);

  return filteredTemplatesLanguage; 
}


async function executeQuery(query) {
  const offset = Math.floor(Math.random() * 100);
  const finalQuery = query + ` LIMIT 100 OFFSET ${offset}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      "Accept": "application/json"
    },
    body: finalQuery
  });

  const data = await response.json();
  //label representa los resultados que van a aparecer en las opciones -> no puede ser iguales
  //filtro para asegurarme que no se repitan bajo ninguna circunstancia
  return filterUnique(data.results.bindings, "label", 4);
}

function filterUnique(results, label, limit) {
  const uniqueResults = [];
  const seenValues = new Set();

  for (const result of results) {
    if (result[label]?.value && !seenValues.has(result[label].value)) {
      seenValues.add(result[label].value);
      uniqueResults.push(result);
    }
    if (uniqueResults.length === limit) break;
  }
  return uniqueResults;
}
//intercambiar por la de andrea y meter lo del lang para que admita los idiomas
async function takeOptions(topics, lang) {
  const templates = loadQuestionTemplatesWithTopicLanguage(topics, lang);
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  const query = randomTemplate.query;
  const results = await executeQuery(query);

  if (results.length > 0) {

    const filteredResults = allInfo(results, "label", "image", randomTemplate);
    console.log("Resultados finales:");
    console.log(JSON.stringify(filteredResults, null, 2));

    return filteredResults;
  }
  //para evitar errores en tiempo de ejecucion -> quitarlo en un futuro
  return [];
}

function allInfo(results, labelKey, imageKey, randomTemplate) {
  const specialIndex = Math.floor(Math.random() * results.length);

  const question = randomTemplate.question;
  const correct = results[specialIndex][labelKey]?.value || null;
  const image = results[specialIndex][imageKey]?.value || null;
  const options = results
    .map(result => result[labelKey]?.value || null)
    .filter((option, index) => index !== specialIndex);

  return {
    question,
    correct,
    image,
    options
  };
}

const server = app.listen(port, () => {
  console.log(`question Service listening at http://localhost:${port}`);
});
  
export default server;
