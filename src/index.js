import Game from "./classes/Game.js";
import handleReplyEvent from "./functions/reply_event.js";
import handleAIEvent from "./functions/ai_event.js";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function startGame() {
    const gameCase = await Game.generateCase();
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