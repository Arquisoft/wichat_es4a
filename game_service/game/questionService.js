const Question = require("../models/Question");
const { requestQuestion } = require("../game/QuestionAsk");

const NUM_QUESTIONS = 100;

const loadQuestion = async(tags, lang) =>
{
    let res;

    if(tags && tags.length > 0) {
        res = await Question.aggregate([
            { $match: { $and:
                        [{tags: { $in: tags}}, {lang: lang}]
                }
        }]).sample(1);
    }


    //Safety!
    if(res === undefined || res[0] === undefined){
        res = await Question.aggregate().sample(1);
    }


    
    const { _id, __v, createdAt, ...question } = res[0];

    return question;
}

const saveQuestion = async() =>
{
    const res = await requestQuestion();

    const question = new Question({
        question: res.question,
        answer: res.correct,
        options: res.options,
        imageUrl: res.imageUrl,
        correct: res.correct,
        topics: res.topics || []  // Asegúrate de que `topics` esté presente
    });
 
    await question.save();
}

const loadInitialQuestions = () =>
{
    for (let i = 0; i < 9; i++)
        setTimeout(async () => await saveQuestionsInDB(), 1000);
}

const saveQuestionsInDB = async () =>
{
    const questions = await Question.find({});

    if (questions.length > 1000)
        return;

    for (let i = 0; i < NUM_QUESTIONS; i++)
        await saveQuestion();
}

const deleteOlderQuestions = async () =>
{
    const questionsToRemove = await Question.find({}, {_id: 1})
        .limit(NUM_QUESTIONS)
        .sort({ createdAt: 'ascending' });

    await Question.deleteMany({ _id: {$in: questionsToRemove} });
}

module.exports = { loadQuestion, saveQuestionsInDB, loadInitialQuestions, deleteOlderQuestions };