import { SchemaType } from "@google/generative-ai";

const replySchema = {
    type: SchemaType.OBJECT,
    properties: {
        asRole: {
            type: SchemaType.STRING,
            description: "role of the person AI is replying as. IF THE DEFENDANT/PLAINTIFF WERE CALLED TO THE STAND, YOU MAY USE LABEL DEFENDANT/WITNESS AND NOT AS WITNESS.",
            enum: ["JUDGE", "PLAINTIFF", "DEFENDANT", "WITNESS", "OPPONENT_LAWYER"]
        },
        whereName: {
            type: SchemaType.STRING,
            description: "Name of the person AI is replying as. YOU MAY CALL THE PLAYER/OPPONENT LAWYER AS 'DEFENSE/PLAINTIFF LAWYER' according to the situation"
        },
        reply: {
            type: SchemaType.STRING,
            description: "Content of the reply that the AI is to answer: REPLY IN FIRST PERSON ACCORDING TO THE ROLE. YOU MAY REFER TO THE PLAYER/OPPONENT LAWYER AS 'DEFENSE/PLAINTIFF LAWYER' according to the situation"
        },
        eventToEmit: {
            type: SchemaType.STRING,
            description: "NEXT LOGICAL COURSE OF ACTION TO EMIT AFTER THE PRESENTED PROMPT. YOU MAY EXCLUSIVELY USE CALL_PLAYER EVENT IF THE JUDGE OR ANYONE IS ASKING THE PLAYERR OR THE DEFENDANT/PLAINTIFF LAWYER (ACCORDING TO THE CONTEXT), YOU MAY NOT CALL THIS EVENT FOR ASKING THE WITNESS/DEFENDANT/PLAINTIFF BECAUSE THE PLAYER IS NOT ACTING AS THOSE.",
            enum: [
                "CALL_PLAYER",
                "CALL_OPPONENT_LAWYER",
                "CALL_DEFENDANT",
                "CALL_PLAINTIFF",
                "CALL_WITNESS",
                "DISMISS_PLAYER",
                "DISMISS_OPPONENT_LAWYER",
                "DISMISS_DEFENDANT",
                "DISMISS_PLAINTIFF",
                "DISMISS_WITNESS",
                "END_COURT"
            ]
        },
        relatedPeopleName: {
            type: SchemaType.STRING,
            description: "Name of the person related to the reply. FOR EXAMPLE THE PLAINTIFF'S NAME OR THE DEFENDANT'S NAME OR ONE OF THE WITNESS' NAME. e.g: louis harding (member of witness)"
        }
    },
    required: ["asRole", "whereName", "reply", "eventToEmit", "relatedPeopleName"]
}

export default replySchema;