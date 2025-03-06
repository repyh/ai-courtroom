const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

async function run() {
    const responseSchema = require('./schemas/case_schema');

    const genAI = new GoogleGenerativeAI(process.env.AI_API);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 2,
            top_p: 0.9
        },
        cachedContent: false
    });
    
    const caseType = ["CRIMINAL", "CIVIL", "DIVORCE", "APPEAL"];
    const chosenType = caseType[Math.floor(Math.random() * caseType.length)];

    const prompt = `VARY THE RESPOND BELOW AND DO NOT BASE IT ON PREVIOUS HISTORY, CHANGE THE RESPONSE EVERY CALL. DO NOT RESPOND WITH ANYTHING OTHER THAN PROPERLY FORMATTED JSON. DO NOT ADD ANY OTHER FIELD OTHER THAN THE ONE PROVIDED BELOW. generate a sample ${chosenType} case (RANDOM AND VARY YOUR RESPONSES) court case for a game in a format of below (the case should be able to be concluded with the information generated) MAKE SURE THE HIDDENDETAILS CAN BE REVEALED/CONCLUDED BASED ON OTHER AVAILABLE DETAILS SUCH AS PLAINTIFF DETAIL, DEFENDANT DETAIL, FACTS, EVIDENCE, AND REGULAR DETAILS. BELOW IS THE LAW THAT SHOULD BE USED TO GENERATE A LAWFUL CASE AND THE BASE SHOULD BE RAN ACCORDING TO THE LAW:`;

    const result = await model.generateContent(prompt + "\n\n" + JSON.stringify(require('./database/laws/' + chosenType.toLowerCase())));

    fs.writeFileSync('./sample.json', JSON.stringify(JSON.parse(result.response.text()), null, 4));

    console.log('done!');
}

async function generateLaws() {
    const genAI = new GoogleGenerativeAI(process.env.AI_API);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        law: {
                            type: SchemaType.STRING,
                            description: "The law content"
                        },
                        description: {
                            type: SchemaType.STRING,
                            description: "Description of the law"
                        }
                    }
                },
                minItems: 50
            },
            temperature: 2,
            top_p: 0.9
        },
        cachedContent: false
    });

    const prompt = `generate me a list of laws that is should be useful for a game of court case debate where the case type is APPEAL. The laws should be able to be used in the court case debate and should be able to be used to conclude the case. The laws should be in a format of below:`;

    const result = await model.generateContent(prompt);

    fs.writeFileSync('./sample_law.json', JSON.stringify(JSON.parse(result.response.text()), null, 4));

    console.log('done sample law!');
}

run();
// generateLaws();