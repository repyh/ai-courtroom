import { GoogleGenerativeAI } from "@google/generative-ai";
import Events from 'events';
import fs from 'fs';

import Case from './Case.js';
import Judge from './Judge.js';

import caseSchema from "../schemas/case_schema.js";
import judgeSchema from "../schemas/judge_schema.js";
import replySchema from "../schemas/reply_schema.js";

class Game extends Events {
    constructor(data) {
        super();
        this.case = data.case;
        this.judge = data.judge;
        this.state = "INIT";
        this.turn = "INIT";
    }

    async initGame() {
        const caseRulePrompt = fs.readFileSync('./src/prompts/case_init.txt', 'utf-8');

        return new Promise(async (resolve, reject) => {
            const genAI = new GoogleGenerativeAI(process.env.AI_API);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-lite"
            });

            const gameChat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: "YOU ARE GOING TO BE PART OF A NEW GAME SESSION OF A COURTROOM SIMULATOR. YOU ARE GOING AGAINST A REAL HUMAN PLAYER. YOU ARE GOING TO PLAY THE PART OF THE JUDGE, WITNESSES, OPPONENT LAWYER, PLAINTIFF, AND DEFENDANT."
                            },
                            {
                                text: "YOU ARE GOING TO PLAY YOUR PART INDEPENDANTLY AND EXCLUSIVELY FROM OTHER ROLE SO ACT LIKE NO OTHER PEOPLE."
                            },
                            {
                                text: `
                                    ${caseRulePrompt}
                                `
                            },
                            {
                                text: "YOU ARE GOING TO REPLY TO THIS MESSAGE AS THE JUDGE AND ACT ACCORDING TO THE PROVIDED DETAILS BELOW."
                            },
                            {
                                text: "Judge profile:\n" + JSON.stringify(this.judge)
                            },
                            {
                                text: "Case details:\n" + JSON.stringify(this.case)
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: replySchema,
                    temperature: 2,
                    top_p: 0.9
                }
            });

            this.gameChat = gameChat;
            // console.log(this.gameChat.sendMessage)
            resolve();
        });
    }

    async startGame() {
        this.state = "START";
        this.turn = "JUDGE";

        await this.initGame();
        this.emit("GAME_START");
    }

    setPlayerRepresent(side) {
        this.playerRepresent = side ?? "PLAINTIFF";
    }

    // sendMessage() {
    //     return {
    //         asPlayer: this.#messageAsPlayer,
    //         asJudge: this.#messageAsJudge,
    //         asOpponentLawyer: this.#messageAsOpponentLawyer,
    //         asWitness: this.#messageAsWitness,
    //         asPlaintiff: this.#messageAsPlaintiff,
    //         asDefendant: this.#messageAsDefendant
    //     }
    // }

    async messageAsPlayer(message) {
        const result = await this.gameChat.sendMessage(
            `
                THE PLAYER HAS SENT A MESSAGE FOR SOMEONE, REPLY AND ACT ACCORDING TO THE MESSAGE
                CASE CONTEXT: ${JSON.stringify(this.case)}
                MESSAGE: ${message}

                WHAT IS YOUR REPLY AND ACTION?
                REPLY PROFILE: ${JSON.stringify(this.judge)}
            `
        );
        const response = await result.response.text();
        // console.log(response)

        this.emit("REPLY_AS_JUDGE", JSON.parse(response));
    }

    async messageAsOpponentLawyer(message) {
        const result = await this.gameChat.sendMessage(
            `
                YOU ARE GOING TO ACT AS THE OPPONENT LAWYER.
                CASE CONTEXT: ${JSON.stringify(this.case)}
                YOU WERE CALLED UPON BY SOMEONE TO PROVIDE A REPLY.
                MESSAGE: ${message}

                WHAT IS YOUR REPLY?
            `
        )
        const response = await result.response.text();

        this.emit("REPLY_AS_OPPONENT", JSON.parse(response));
    }

    async messageAsJudge(message) {
        const result = await this.gameChat.sendMessage(
            `
                YOU ARE GOING TO ACT AS THE JUDGE.
                CASE CONTEXT: ${JSON.stringify(this.case)}
                MESSAGE: ${message}

                WHAT IS YOUR REPLY?
            `
        );
        const response = await result.response.text();

        this.emit("REPLY_AS_JUDGE", JSON.parse(response));
    }

    async messageAsWitness(message, witnessName) {
        const result = await this.gameChat.sendMessage(
            `
                YOU ARE GOING TO ACT AS A WITNESS.
                CASE CONTEXT: ${JSON.stringify(this.case)}
                PROFILE OF WITNESS: ${JSON.stringify([...this.case.defendantWitnesses, ...this.case.plaintiffWitnesses].find(w => w.name === witnessName))}
                MESSAGE: ${message}

                WHAT IS YOUR REPLY?
            `
        );
        const response = await result.response.text();

        this.emit("REPLY_AS_WITNESS", JSON.parse(response));
    }

    async messageAsPlaintiff(message) {
        const result = await this.gameChat.sendMessage(
            `
                YOU ARE GOING TO ACT AS THE PLAINTIFF.
                CASE CONTEXT: ${JSON.stringify(this.case)}
                PROFILE OF PLAINTIFF: ${JSON.stringify(this.case.plaintiff)}
                MESSAGE: ${message}

                WHAT IS YOUR REPLY?
            `
        );
        const response = await result.response.text();

        this.emit("REPLY_AS_PLAINTIFF", JSON.parse(response));
    }

    async messageAsDefendant(message) {
        const result = await this.gameChat.sendMessage(
            `
                YOU ARE GOING TO ACT AS THE DEFENDANT.
                CASE CONTEXT: ${JSON.stringify(this.case)}
                PROFILE OF DEFENDANT: ${JSON.stringify(this.case.defendant)}
                MESSAGE: ${message}

                WHAT IS YOUR REPLY?
            `
        );
        const response = await result.response.text();

        this.emit("REPLY_AS_DEFENDANT", JSON.parse(response));
    }

    static async generateCase(requestedPrompt, caseType, baseTopic) {
        const prompt = (
            requestedPrompt ??
            `VARY THE RESPOND BELOW AND DO NOT BASE IT ON PREVIOUS HISTORY, CHANGE THE RESPONSE EVERY CALL. DO NOT RESPOND WITH ANYTHING OTHER THAN PROPERLY FORMATTED JSON. DO NOT ADD ANY OTHER FIELD OTHER THAN THE ONE PROVIDED BELOW. generate a sample ${caseType} on a topic of: ${baseTopic} \ncase (RANDOM AND VARY YOUR RESPONSES) court case for a game in a format of below (the case should be able to be concluded with the information generated) MAKE SURE THE HIDDENDETAILS CAN BE REVEALED/CONCLUDED BASED ON OTHER AVAILABLE DETAILS SUCH AS PLAINTIFF DETAIL, DEFENDANT DETAIL, FACTS, EVIDENCE, AND REGULAR DETAILS:`
        );

        const genAI = new GoogleGenerativeAI(process.env.AI_API);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: caseSchema,
                temperature: 2,
                top_p: 0.9
            },
            cachedContent: false
        });
        
        const result = await model.generateContent(prompt);

        return new Case(JSON.parse(result.response.text()));
    }

    static async generateJudgeProfile() {
        const prompt = "Generate a judge profile for a game where player takes on AI judge and AI lawyer oppponent in a courtroom";

        const genAI = new GoogleGenerativeAI(process.env.AI_API);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: judgeSchema,
                temperature: 2,
                top_p: 0.9
            },
            cachedContent: false
        });

        const result = await model.generateContent(prompt);

        return new Judge(JSON.parse(result.response.text()));
    }
}

export default Game;