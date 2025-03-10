import Game from "./classes/Game.js";
import handleReplyEvent from "./functions/reply_event.js";
import handleAIEvent from "./functions/ai_event.js";
import caseTopics from "./database/case/topics.json" with { type: 'json' };
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function startGame() {
    const caseTypes = ["CRIMINAL", "CIVIL", "DIVORCE", "APPEAL"];

    const chosenType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
    const chosenTopic = caseTopics[chosenType][Math.floor(Math.random() * caseTopics[chosenType].length)];
    console.log("Chosen topic:", chosenTopic);

    const gameCase = await Game.generateCase(null, caseTypes, chosenTopic);
    fs.writeFileSync('./sample.json', JSON.stringify(gameCase, null, 4));

    const game = new Game({
        case: gameCase,
        judge: Game.generateJudgeProfile(),
    });

    // await game.initGame();

    game.on("GAME_START", async () => {
        console.log('Initializing case...\n');

        // return console.log(game.sendMessage())
        game.messageAsJudge("You may now start the court by asking the player for their opening statement.");
    });

    handleReplyEvent(game);
    handleAIEvent(game);

    game.startGame();
}

startGame();