import fetch from 'node-fetch';  // We use fetch to make HTTP requests to external APIs
import fs from 'fs';  // We need the fs module to read JSON files
import { dirname, join } from 'path';  // We use path to handle file and directory paths
import { fileURLToPath } from 'url';  // We use fileURLToPath to convert file URLs to local paths in ES modules
import express from 'express';  // We use express to create and manage the API server

const port = 8004;
const app = express();
const url = "https://query.wikidata.org/sparql";
app.use(express.json());  // Middleware para leer JSON en las solicitudes

/**
 * Loads and filters question templates based on the specified topics and language.
 * This function reads the 'question_template.json' file, parses its content, 
 * and then filters the templates according to the provided topics and language.
 * 
 * @param {Array|String} topics - An array of topics or a single topic string to filter the templates. 
 * @param {String} lang - The language code ("es" for Spanish and "en" for English) to filter the templates.
 * @returns {Array} - An array of question templates that match the specified topics and language.
 * 
 * @example
 * const templates = loadQuestionTemplatesWithTopicLanguage(["geography"], "es");
 * This would return all the templates related to "geography" in Spanish.
 */
function loadQuestionTemplatesWithTopicLanguage(topics, lang) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const filePath = join(__dirname, 'question_template.json');

  if (!fs.existsSync(filePath)) {
    throw new Error('El archivo question_template.json no se encuentra');
  }

  const data = fs.readFileSync(filePath, 'utf-8');
  const templates = JSON.parse(data);

  const topicsArray = Array.isArray(topics) ? topics : [topics];

  const filteredTemplates = templates.filter(template =>
    topicsArray.some(topic => template.topics.includes(topic))
  );

  const filteredTemplatesLanguage = filteredTemplates.filter(template => template.lang === lang);

  return filteredTemplatesLanguage;
}


/**
 * Filters the results to get only unique entities based on their labels and limits the number of results.
 * This function checks that no two entities with the same label appear in the results.
 * It stops once the specified limit of unique results is reached.
 *
 * @param {Array} results - The list of results obtained from a SPARQL query. Each result contains a label (entity name).
 * @param {String} label - The field in each result object representing the entity name
 * @param {Number} limit - The maximum number of unique results (unique entity names) to return.
 * @returns {Array} - A list of up to 'limit' unique results based on the entity label.
 * 
 */
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

/**
 * Executes a SPARQL query to fetch data from the Wikidata endpoint.
 * It adds a random offset to the query to ensure different sets of results are returned each time.
 * The results are then filtered to return only unique entities based on their labels, 
 * and the number of results is limited to 4.
 * 
 * @param {string} query - The SPARQL query to fetch data from Wikidata. It should return results containing labels and images.
 * @returns {Array} - An array of up to 4 unique results based on the entity labels, including the corresponding images.
 * 
 */
async function executeQuery(query) {
  const offset = Math.floor(Math.random() * 100); // Generate a random offset between 0 and 99
  const finalQuery = query + ` LIMIT 100 OFFSET ${offset}`; // Add offset and limit to the query


  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      "Accept": "application/json"
    },
    body: finalQuery
  });

  const data = await response.json(); // Parse the response from the API

  // Filter and return 4 unique results by their labels
  return filterUnique(data.results.bindings, "label", 4);
}


/**
 * This function selects a random question template based on the provided topics and language,
 * runs a query to fetch the relevant data, and then returns the question along with options,
 * making sure the results are unique.
 * 
 * @param {Array|String} topics - A topic or a list of topics to filter the question templates.
 * @param {String} lang - The language you want the question
 * @returns {Array} - An array with the question, correct answer, url of the image, and options.
 * 
 * @example
 * const question = await generateQuestion(["geography"], "es");
 * This will return a random geography question in Spanish, run the query, and return 
 * the options with the correct answer and image.
 */
async function generateQuestion(topics, lang) {
  const templates = loadQuestionTemplatesWithTopicLanguage(topics, lang);
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

  // Get the SPARQL query from the selected template
  const query = randomTemplate.query;
  // Run the query to get the data
  const results = await executeQuery(query);

  // If there are results, generate the question with its options(correct and false ones)
  if (results.length > 0) {
    const filteredResults = generateQuestionWithOptions(results, "label", "image", randomTemplate);

    return filteredResults;
  }
  // If no results found, return an empty array to avoid errors
  return [];
}


/**
 * Randomly selects a result as the correct answer and the rest are considered incorrect options.
 * It uses this result to create the final question structure, including the question text, correct answer, image, and options.
 * 
 * @param {Array} results - The query results to be processed, each containing a label (question options) and an image URL.
 * @param {String} labelKey - The key that represents the label (question options) in the results.
 * @param {String} imageKey - The key that represents the image URL in the results.
 * @param {Object} randomTemplate - The template containing the question format.
 * @returns {Object} - The generated question with the correct answer, image, and a set of incorrect options.
 * 
 */
function generateQuestionWithOptions(results, labelKey, imageKey, randomTemplate) {
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


/**
 * Endpoint to generate a random question based on the provided topics and language
 * to allow users to specify topics and language.
 * 
 * The function will generate a question based on the selected topic(s) and language, fetch relevant data,
 * and return the generated question as a response.
 * 
 * @route POST /api/questions/generate
 * @async
 * @function
 * 
 * @param {Object} req - The request object, containing user input in the body (supports topic/language).
 * @param {Object} res - The response object, used to send the response back to the client.
 * 
 * @returns {Object} - A JSON response with the generated question and options if successful, or an error message if not
 */
app.post('/api/question/generate', async (req, res) => {
  try {

    const topics = req.body.topics;
    const lang = req.body.lang;
    const questionData = await generateQuestion(topics, lang);
    if (!questionData) {
      return res.status(404).json({ error: "No valid question generated" });
    }
    res.status(200).json(questionData);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate question" });
  }
});


/**
 * Starts the server and listens on the specified port
 *
 * @param {number} port - The port the server will listen on.
 */
const server = app.listen(port, async () => {
  console.log(`Question Service listening at http://localhost:${port}`);
});

export default server;