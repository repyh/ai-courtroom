import { SchemaType } from "@google/generative-ai";

const replySchema = {
    type: SchemaType.OBJECT,
    properties: {
        asRole: {
            type: SchemaType.STRING,
            description: "The role of the person AI is replying as. If the DEFENDANT or PLAINTIFF is called to the stand, use 'DEFENDANT' or 'PLAINTIFF' instead of 'WITNESS'.",
            enum: ["JUDGE", "PLAINTIFF", "DEFENDANT", "WITNESS", "OPPONENT_LAWYER"]
        },
        whereName: {
            type: SchemaType.STRING,
            description: "The name of the person AI is replying as. Use 'Opposing Counsel' or 'Mr./Ms./Mrs. [EXPLICIT WITNESS NAME]' or 'Judge' or 'Mr./Ms./Mrs. [EXPLICIT DEFENDANT NAME]' or 'Mr./Ms./Mrs. [EXPLICIT WITNESS NAME]' depending on the context where applicable. ALL IN **PROPERCASE**."
        },
        reply: {
            type: SchemaType.STRING,
            description: "The content of the reply, formatted in the **first person** according to the role. Always refer to the player as 'Player' appropriately."
        },
        eventToEmit: {
            type: SchemaType.STRING,
            description: "The next logical action to be taken. Use 'CALL_PLAYER' only when directly requesting input from the player's character (the lawyer). Do not use this event when calling the WITNESS, DEFENDANT, or PLAINTIFF.",
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
            description: "The name of the person relevant to the reply (e.g., the plaintiff's, defendant's, or a witness' name). Example: 'Louis Harding' (a witness)."
        },
        verdict: {
            type: SchemaType.STRING,
            description: "The verdict of the court proceeding. YOU ARE TO USE THIS FIELD ONLY WHEN THE EVENT TO EMIT IS 'END_COURT'. USE THE APPROPRIATE RESPONSE ACCORDING TO THE **ARGUMENTS** and **EVIDENCE** PROVIDED.",
            enum: [
                "PLAINTIFF_WIN",
                "DEFENDANT_WIN",
                "NO_CONCLUSION",
                "COURT_IN_PROGRESS"
            ]
        }
    },
    required: ["asRole", "whereName", "reply", "eventToEmit", "relatedPeopleName"]
};

export default replySchema;
