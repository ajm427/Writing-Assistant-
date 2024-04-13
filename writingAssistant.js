require('dotenv').config();
const OpenAI = require("openai");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: secretKey });

async function askQuestion(question) {
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function getResponseFromAssistant(prompt, thread) {
  try {
    const response = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
    });
    
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    return messages.data.filter(
      (message) => message.run_id === run.id && message.role === "assistant"
    ).pop();
  } catch (error) {
    console.error("Error in getResponseFromAssistant:", error);
    return null;
  }
}

function generatePrompt(userRequest, writingStyle) {
  const prompt = `Please help me with the following writing task: ${userRequest}


function generatePrompt(userRequest, writingStyle) {
  const prompt = `Please help me with the following writing task: ${userRequest}

Please apply the following writing style guidelines:
- Lexical Diversity: ${writingStyle.lexicalDiversity}
- Sentence Complexity: ${writingStyle.sentenceComplexity}
- Use of Passive Voice: ${writingStyle.passiveVoice}
- Narrative Pace: ${writingStyle.narrativePace}
- Tone Consistency: ${writingStyle.toneConsistency}
- Dialogue Frequency: ${writingStyle.dialogueFrequency}
- Emotional Expressiveness: ${writingStyle.emotionalExpressiveness}
- Adjective and Adverb Usage: ${writingStyle.adjectiveAdverbUsage}
- Syntactic Variety: ${writingStyle.syntacticVariety}
- Figurative Language Usage: ${writingStyle.figurativeLanguage}
- Punctuation Diversity: ${writingStyle.punctuationDiversity}
- Subject Matter Expertise: ${writingStyle.subjectMatterExpertise}
- Point of View Consistency: ${writingStyle.pointOfViewConsistency}
- Thematic Depth: ${writingStyle.thematicDepth}
- Idiomatic Expression Usage: ${writingStyle.idiomaticExpressions}
- Formality Level: ${writingStyle.formalityLevel}
- Vocabulary Complexity: ${writingStyle.vocabularyComplexity}
- Paragraph Structure: ${writingStyle.paragraphStructure}
- Transitional Phrases: ${writingStyle.transitionalPhrases}
- Rhetorical Devices: ${writingStyle.rhetoricalDevices}
- Sentence Length Variation: ${writingStyle.sentenceLengthVariation}
- Humor and Wit: ${writingStyle.humorAndWit}
- Cultural References: ${writingStyle.culturalReferences}
- Sensory Details: ${writingStyle.sensoryDetails}
- Persuasive Techniques: ${writingStyle.persuasiveTechniques}

Please avoid using the following words/phrases: ${writingStyle.wordsToAvoid.join(", ")}

Favor using prepositional transitions such as "The likes of which", "each of which".

Adhere to the following word count guidelines based on the complexity of the subject:
${writingStyle.wordCountGuidelines}
`;

  return prompt;
}

function getWritingStyle(choice) {
  const writingStyles = {
    1: { // Expository
      lexicalDiversity: 6,
      sentenceComplexity: 6,
      passiveVoice: 4,
      narrativePace: 5,
      toneConsistency: 8,
      dialogueFrequency: 1,
      emotionalExpressiveness: 3,
      adjectiveAdverbUsage: 4,
      syntacticVariety: 6,
      figurativeLanguage: 3,
      punctuationDiversity: 6,
      subjectMatterExpertise: 8,
      pointOfViewConsistency: 8,
      thematicDepth: 6,
      idiomaticExpressions: 2,
      formalityLevel: 7,
      vocabularyComplexity: 5,
      paragraphStructure: 7,
      transitionalPhrases: 7,
      rhetoricalDevices: 4,
      sentenceLengthVariation: 6,
      humorAndWit: 2,
      culturalReferences: 2,
      sensoryDetails: 3,
      persuasiveTechniques: 2,
      wordsToAvoid: ["delve", "here", "next", "continue", "chapter", "section",
        "delving", "herein", "beyond mere", "At its core", "at the heart",
        "beyond just", "cornerstone", "pivotal", "crucial", "vital",
        "fostering", "foster", "be overlooked", "critical", "underscores",
        "transformative", "transformation", "the subsequent", "This introduction",
        "sets the stage", "next we will", "navigate", "tapestry", "evident",
        "merely", "revolutionary", "force", "reshaping", "fabric", "journey",
        "underscore", "underscores", "democratizing", "enhancing", "paradigms",
        "laden", "the path forward", "challenges", "promise", "disrupt",
        "redefine", "foresight", "complexities", "clear", "transcends",
        "emerge", "key", "evolution", "advent", "expansion", "road ahead",
        "hurdles", "continues", "essential", "continued", "transform",
        "wrapping up", "moving forward", "vital", "reveals", "significant",
        "impact", "mere", "catalyst", "innovation", "substantial", "cannot be overstated",
        "At the Heart of", "At the core of", "Moving forward", "As we continue",
        "In this chapter"
]
    },
    2: { // Descriptive
      lexicalDiversity: 8,
      sentenceComplexity: 7,
      passiveVoice: 3,
      narrativePace: 4,
      toneConsistency: 7,
      dialogueFrequency: 3,
      emotionalExpressiveness: 8,
      adjectiveAdverbUsage: 9,
      syntacticVariety: 7,
      figurativeLanguage: 8,
      punctuationDiversity: 6,
      subjectMatterExpertise: 6,
      pointOfViewConsistency: 7,
      thematicDepth: 6,
      idiomaticExpressions: 5,
      formalityLevel: 4,
      vocabularyComplexity: 6,
      paragraphStructure: 6,
      transitionalPhrases: 6,
      rhetoricalDevices: 7,
      sentenceLengthVariation: 7,
      humorAndWit: 4,
      culturalReferences: 5,
      sensoryDetails: 9,
      persuasiveTechniques: 3,
      wordsToAvoid: ["delve", "here", "next", "continue", "chapter", "section",
        "delving", "herein", "beyond mere", "At its core", "at the heart",
        "beyond just", "cornerstone", "pivotal", "crucial", "vital",
        "fostering", "foster", "be overlooked", "critical", "underscores",
        "transformative", "transformation", "the subsequent", "This introduction",
        "sets the stage", "next we will", "navigate", "tapestry", "evident",
        "merely", "revolutionary", "force", "reshaping", "fabric", "journey",
        "underscore", "underscores", "democratizing", "enhancing", "paradigms",
        "laden", "the path forward", "challenges", "promise", "disrupt",
        "redefine", "foresight", "complexities", "clear", "transcends",
        "emerge", "key", "evolution", "advent", "expansion", "road ahead",
        "hurdles", "continues", "essential", "continued", "transform",
        "wrapping up", "moving forward", "vital", "reveals", "significant",
        "impact", "mere", "catalyst", "innovation", "substantial", "cannot be overstated",
        "At the Heart of", "At the core of", "Moving forward", "As we continue",
        "In this chapter"
]
    },
    3: { // Persuasive
      lexicalDiversity: 7,
      sentenceComplexity: 8,
      passiveVoice: 3,
      narrativePace: 6,
      toneConsistency: 8,
      dialogueFrequency: 2,
      emotionalExpressiveness: 7,
      adjectiveAdverbUsage: 7,
      syntacticVariety: 8,
      figurativeLanguage: 6,
      punctuationDiversity: 7,
      subjectMatterExpertise: 8,
      pointOfViewConsistency: 9,
      thematicDepth: 7,
      idiomaticExpressions: 4,
      formalityLevel: 6,
      vocabularyComplexity: 7,
      paragraphStructure: 8,
      transitionalPhrases: 8,
      rhetoricalDevices: 9,
      sentenceLengthVariation: 8,
      humorAndWit: 5,
      culturalReferences: 4,
      sensoryDetails: 6,
      persuasiveTechniques: 9,
      wordsToAvoid: ["delve", "here", "next", "continue", "chapter", "section",
        "delving", "herein", "beyond mere", "At its core", "at the heart",
        "beyond just", "cornerstone", "pivotal", "crucial", "vital",
        "fostering", "foster", "be overlooked", "critical", "underscores",
        "transformative", "transformation", "the subsequent", "This introduction",
        "sets the stage", "next we will", "navigate", "tapestry", "evident",
        "merely", "revolutionary", "force", "reshaping", "fabric", "journey",
        "underscore", "underscores", "democratizing", "enhancing", "paradigms",
        "laden", "the path forward", "challenges", "promise", "disrupt",
        "redefine", "foresight", "complexities", "clear", "transcends",
        "emerge", "key", "evolution", "advent", "expansion", "road ahead",
        "hurdles", "continues", "essential", "continued", "transform",
        "wrapping up", "moving forward", "vital", "reveals", "significant",
        "impact", "mere", "catalyst", "innovation", "substantial", "cannot be overstated",
        "At the Heart of", "At the core of", "Moving forward", "As we continue",
        "In this chapter"
]
    },
    4: { // Narrative
      lexicalDiversity: 8,
      sentenceComplexity: 7,
      passiveVoice: 2,
      narrativePace: 7,
      toneConsistency: 8,
      dialogueFrequency: 8,
      emotionalExpressiveness: 9,
      adjectiveAdverbUsage: 7,
      syntacticVariety: 8,
      figurativeLanguage: 7,
      punctuationDiversity: 7,
      subjectMatterExpertise: 6,
      pointOfViewConsistency: 8,
      thematicDepth: 8,
      idiomaticExpressions: 6,
      formalityLevel: 4,
      vocabularyComplexity: 6,
      paragraphStructure: 7,
      transitionalPhrases: 7,
      rhetoricalDevices: 6,
      sentenceLengthVariation: 8,
      humorAndWit: 6,
      culturalReferences: 6,
      sensoryDetails: 8,
      persuasiveTechniques: 4,
      wordsToAvoid: ["delve", "here", "next", "continue", "chapter", "section",
        "delving", "herein", "beyond mere", "At its core", "at the heart",
        "beyond just", "cornerstone", "pivotal", "crucial", "vital",
        "fostering", "foster", "be overlooked", "critical", "underscores",
        "transformative", "transformation", "the subsequent", "This introduction",
        "sets the stage", "next we will", "navigate", "tapestry", "evident",
        "merely", "revolutionary", "force", "reshaping", "fabric", "journey",
        "underscore", "underscores", "democratizing", "enhancing", "paradigms",
        "laden", "the path forward", "challenges", "promise", "disrupt",
        "redefine", "foresight", "complexities", "clear", "transcends",
        "emerge", "key", "evolution", "advent", "expansion", "road ahead",
        "hurdles", "continues", "essential", "continued", "transform",
        "wrapping up", "moving forward", "vital", "reveals", "significant",
        "impact", "mere", "catalyst", "innovation", "substantial", "cannot be overstated",
        "At the Heart of", "At the core of", "Moving forward", "As we continue",
        "In this chapter"
]
    },
    5: { // Technical
      lexicalDiversity: 5,
      sentenceComplexity: 8,
      passiveVoice: 7,
      narrativePace: 3,
      toneConsistency: 9,
      dialogueFrequency: 0,
      emotionalExpressiveness: 1,
      adjectiveAdverbUsage: 3,
      syntacticVariety: 5,
      figurativeLanguage: 1,
      punctuationDiversity: 4,
      subjectMatterExpertise: 9,
      pointOfViewConsistency: 9,
      thematicDepth: 6,
      idiomaticExpressions: 1,
      formalityLevel: 9,
      vocabularyComplexity: 8,
      paragraphStructure: 8,
      transitionalPhrases: 7,
      rhetoricalDevices: 2,
      sentenceLengthVariation: 5,
      humorAndWit: 1,
      culturalReferences: 1,
      sensoryDetails: 2,
      persuasiveTechniques: 1,
      wordsToAvoid: ["delve", "here", "next", "continue", "chapter", "section",
        "delving", "herein", "beyond mere", "At its core", "at the heart",
        "beyond just", "cornerstone", "pivotal", "crucial", "vital",
        "fostering", "foster", "be overlooked", "critical", "underscores",
        "transformative", "transformation", "the subsequent", "This introduction",
        "sets the stage", "next we will", "navigate", "tapestry", "evident",
        "merely", "revolutionary", "force", "reshaping", "fabric", "journey",
        "underscore", "underscores", "democratizing", "enhancing", "paradigms",
        "laden", "the path forward", "challenges", "promise", "disrupt",
        "redefine", "foresight", "complexities", "clear", "transcends",
        "emerge", "key", "evolution", "advent", "expansion", "road ahead",
        "hurdles", "continues", "essential", "continued", "transform",
        "wrapping up", "moving forward", "vital", "reveals", "significant",
        "impact", "mere", "catalyst", "innovation", "substantial", "cannot be overstated",
        "At the Heart of", "At the core of", "Moving forward", "As we continue",
        "In this chapter"
]
    },
    6: { // Business and Professional
      lexicalDiversity: 6,
      sentenceComplexity: 7,
      passiveVoice: 5,
      narrativePace: 5,
      toneConsistency: 9,
      dialogueFrequency: 1,
      emotionalExpressiveness: 3,
      adjectiveAdverbUsage: 4,
      syntacticVariety: 6,
      figurativeLanguage: 3,
      punctuationDiversity: 5,
      subjectMatterExpertise: 8,
      pointOfViewConsistency: 8,
      thematicDepth: 6,
      idiomaticExpressions: 3,
      formalityLevel: 8,
      vocabularyComplexity: 6,
      paragraphStructure: 8,
      transitionalPhrases: 7,
      rhetoricalDevices: 4,
      sentenceLengthVariation: 6,
      humorAndWit: 2,
      culturalReferences: 3,
      sensoryDetails: 3,
      persuasiveTechniques: 5,
      wordsToAvoid: ["delve", "here", "next", "continue", "chapter", "section",
        "delving", "herein", "beyond mere", "At its core", "at the heart",
        "beyond just", "cornerstone", "pivotal", "crucial", "vital",
        "fostering", "foster", "be overlooked", "critical", "underscores",
        "transformative", "transformation", "the subsequent", "This introduction",
        "sets the stage", "next we will", "navigate", "tapestry", "evident",
        "merely", "revolutionary", "force", "reshaping", "fabric", "journey",
        "underscore", "underscores", "democratizing", "enhancing", "paradigms",
        "laden", "the path forward", "challenges", "promise", "disrupt",
        "redefine", "foresight", "complexities", "clear", "transcends",
        "emerge", "key", "evolution", "advent", "expansion", "road ahead",
        "hurdles", "continues", "essential", "continued", "transform",
        "wrapping up", "moving forward", "vital", "reveals", "significant",
        "impact", "mere", "catalyst", "innovation", "substantial", "cannot be overstated",
        "At the Heart of", "At the core of", "Moving forward", "As we continue",
        "In this chapter"
]
    },
    7: { // Academic
      lexicalDiversity: 8,
      sentenceComplexity: 9,
      passiveVoice: 8,
      narrativePace: 3,
      toneConsistency: 9,
      dialogueFrequency: 0,
      emotionalExpressiveness: 2,
      adjectiveAdverbUsage: 5,
      syntacticVariety: 7,
      figurativeLanguage: 4,
      punctuationDiversity: 6,
      subjectMatterExpertise: 9,
      pointOfViewConsistency: 9,
      thematicDepth: 8,
      idiomaticExpressions: 2,
      formalityLevel: 9,
      vocabularyComplexity: 9,
      paragraphStructure: 9,
      transitionalPhrases: 8,
      rhetoricalDevices: 6,
      sentenceLengthVariation: 7,
      humorAndWit: 1,
      culturalReferences: 4,
      sensoryDetails: 2,
      persuasiveTechniques: 3,
      wordsToAvoid: ["delve", "here", "next", "continue", "chapter", "section",
        "delving", "herein", "beyond mere", "At its core", "at the heart",
        "beyond just", "cornerstone", "pivotal", "crucial", "vital",
        "fostering", "foster", "be overlooked", "critical", "underscores",
        "transformative", "transformation", "the subsequent", "This introduction",
        "sets the stage", "next we will", "navigate", "tapestry", "evident",
        "merely", "revolutionary", "force", "reshaping", "fabric", "journey",
        "underscore", "underscores", "democratizing", "enhancing", "paradigms",
        "laden", "the path forward", "challenges", "promise", "disrupt",
        "redefine", "foresight", "complexities", "clear", "transcends",
        "emerge", "key", "evolution", "advent", "expansion", "road ahead",
        "hurdles", "continues", "essential", "continued", "transform",
        "wrapping up", "moving forward", "vital", "reveals", "significant",
        "impact", "mere", "catalyst", "innovation", "substantial", "cannot be overstated",
        "At the Heart of", "At the core of", "Moving forward", "As we continue",
        "In this chapter"
]
    },
    8: { // Creative
      lexicalDiversity: 9,
      sentenceComplexity: 8,
      passiveVoice: 3,
      narrativePace: 7,
      toneConsistency: 7,
      dialogueFrequency: 6,
      emotionalExpressiveness: 9,
      adjectiveAdverbUsage: 8,
      syntacticVariety: 9,
      figurativeLanguage: 9,
      punctuationDiversity: 8,
      subjectMatterExpertise: 6,
      pointOfViewConsistency: 7,
      thematicDepth: 8,
      idiomaticExpressions: 7,
      formalityLevel: 4,
      vocabularyComplexity: 7,
      paragraphStructure: 7,
      transitionalPhrases: 6,
      rhetoricalDevices: 8,
      sentenceLengthVariation: 9,
      humorAndWit: 8,
      culturalReferences: 7,
      sensoryDetails: 9,
      persuasiveTechniques: 5,
      wordsToAvoid: ["delve", "here", "next", "continue", "chapter", "section",
        "delving", "herein", "beyond mere", "At its core", "at the heart",
        "beyond just", "cornerstone", "pivotal", "crucial", "vital",
        "fostering", "foster", "be overlooked", "critical", "underscores",
        "transformative", "transformation", "the subsequent", "This introduction",
        "sets the stage", "next we will", "navigate", "tapestry", "evident",
        "merely", "revolutionary", "force", "reshaping", "fabric", "journey",
        "underscore", "underscores", "democratizing", "enhancing", "paradigms",
        "laden", "the path forward", "challenges", "promise", "disrupt",
        "redefine", "foresight", "complexities", "clear", "transcends",
        "emerge", "key", "evolution", "advent", "expansion", "road ahead",
        "hurdles", "continues", "essential", "continued", "transform",
        "wrapping up", "moving forward", "vital", "reveals", "significant",
        "impact", "mere", "catalyst", "innovation", "substantial", "cannot be overstated",
        "At the Heart of", "At the core of", "Moving forward", "As we continue",
        "In this chapter"
]
    }
  };

  return writingStyles[choice];
}

async function main() {
async function main() {
  let sessionContext = {};
  let feedbackArray = [];
  let keepWorking = true;

  while (keepWorking) {
    try {
      if (Object.keys(sessionContext).length === 0 || sessionContext.isNewSession) {
        console.log("Starting a new session...");
        sessionContext = { isNewSession: false };
        const thread = await openai.beta.threads.create();

        console.log("\nHello! I'm your Ultimate Writing Bot. I can assist you with various writing tasks, including research, outlines, and content creation.\n");

        const userRequest = await askQuestion("What would you like assistance with? ");

        const writingStyleChoice = await askQuestion(`Please select a writing style:
1. Expository
2. Descriptive
3. Persuasive
4. Narrative
5. Technical
6. Business and Professional
7. Academic
8. Creative
Enter the number of your choice: `);

        const writingStyle = getWritingStyle(writingStyleChoice);

        const prompt = generatePrompt(userRequest, writingStyle);
        const assistantResponse = await getResponseFromAssistant(prompt, thread);

        if (assistantResponse) {
          console.log(`\n${assistantResponse.content[0].text.value}\n`);

          const feedback = await askQuestion("How helpful was this response? (scale 1-5) ");
          feedbackArray.push({
            userRequest,
            botResponse: assistantResponse.content[0].text.value,
            rating: feedback
          });

          const additionalFeedback = await askQuestion("Any additional feedback? (type 'none' to skip) ");
          if (additionalFeedback.toLowerCase() !== 'none') {
            feedbackArray[feedbackArray.length - 1].additionalFeedback = additionalFeedback;
          }

          const newSession = await askQuestion("Do you want to start a new session? (yes/no) ");
          sessionContext.isNewSession = newSession.toLowerCase() === "yes";
        }

        const continueWorking = await askQuestion("Do you need more assistance? (yes/no) ");
        keepWorking = continueWorking.toLowerCase() === "yes";
      }

      if (!keepWorking) {
        console.log("Thank you for using the Ultimate Writing Bot. Goodbye!\n");
      }
    } catch (error) {
      console.error("Error in main:", error);
    }
  }

  readline.close();
  console.log("Feedback summary:", feedbackArray);
}

function getWritingStyle(choice) {
  const writingStyles = {
    1: {
      lexicalDiversity: 5,
      sentenceComplexity: 5,
      passiveVoice: 2,
      narrativePace: 7,
      toneConsistency: 9,
      dialogueFrequency: 0,
      emotionalExpressiveness: 2,
      adjectiveAdverbUsage: 3,
      syntacticVariety: 5,
      figurativeLanguage: 4,
      punctuationDiversity: 5,
      subjectMatterExpertise: 9,
      pointOfViewConsistency: 9,
      thematicDepth: 4,
      idiomaticExpressions: 3,
      formalityLevel: 5,
      vocabularyComplexity: 3,
      paragraphStructure: 5,
      transitionalPhrases: 5,
      rhetoricalDevices: 3,
      sentenceLengthVariation: 5,
      humorAndWit: 3,
      culturalReferences: 3,
      sensoryDetails: 4,
      persuasiveTechniques: 0,
      wordsToAvoid: [
        "delve", "here", "next", "continue", "chapter", "section",
        "delving", "herein", "beyond mere", "At its core", "at the heart",
        "beyond just", "cornerstone", "pivotal", "crucial", "vital",
        "fostering", "foster", "be overlooked", "critical", "underscores",
        "transformative", "transformation", "the subsequent", "This introduction",
        "sets the stage", "next we will", "navigate", "tapestry", "evident",
        "merely", "revolutionary", "force", "reshaping", "fabric", "journey",
        "underscore", "underscores", "democratizing", "enhancing", "paradigms",
        "laden", "the path forward", "challenges", "promise", "disrupt",
        "redefine", "foresight", "complexities", "clear", "transcends",
        "emerge", "key", "evolution", "advent", "expansion", "road ahead",
        "hurdles", "continues", "essential", "continued", "transform",
        "wrapping up", "moving forward", "vital", "reveals", "significant",
        "impact", "mere", "catalyst", "innovation", "substantial", "cannot be overstated",
        "At the Heart of", "At the core of", "Moving forward", "As we continue",
        "In this chapter"
      ],
      wordCountGuidelines: `
1 Sub Category: 50-100 words. (Override up to 200 words for complex subject)
2 Subcategories: 100-150 words. (Override up to 300 words for complex subject)
3 Subcategories: 200-250 Words (Override up to 350 words for complex subject)
4 Subcategories: 200-300 Words (Override up to 400 words for complex subject)
5 Subcategories: 250-350 Words (Override up to 450 words for complex subject)
6 Subcategories: 300-400 Words (Override up to 500 words for complex subject)
7 Subcategories: 400-500 Words (Override up to 600 words for complex subject)
8 Subcategories: 500-600 Words (Override up to 650 words for complex subject)
`
    },
    // Add other writing styles here
  };

  return writingStyles[choice];
}

main();

main();
