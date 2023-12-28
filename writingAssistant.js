// Import the required dependencies
require('dotenv').config();
const OpenAI = require("openai");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Create an OpenAI connection
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

async function askQuestion(question) {
  return new Promise((resolve, reject) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to get a response from the assistant
async function getResponseFromAssistant(prompt, thread) {
  const response = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: prompt,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: 'asst_Da0rUmUBfW2sRvf43EwP78nV', // Your assistant ID
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
}

async function main() {
  let sessionContext = {};
  let feedbackArray = [];
  let keepWorking = true;

  while (keepWorking) {
    try {
      if (Object.keys(sessionContext).length === 0 || sessionContext.isNewSession) {
        console.log("Starting a new session...");
        sessionContext = { isNewSession: false };

        // Create a thread
        const thread = await openai.beta.threads.create();

        console.log("\nHello, I'm your Writing Bot. I can help with research, outlines, and writing.\n");

        const userRequest = await askQuestion("\nWhat would you like assistance with? ");
        const assistantResponse = await getResponseFromAssistant(userRequest, thread);

        if (assistantResponse) {
          console.log(`${assistantResponse.content[0].text.value} \n`);

          // Collect feedback
          const feedback = await askQuestion("How helpful was this response? (scale 1-5) ");
          feedbackArray.push({
            userRequest, 
            botResponse: assistantResponse.content[0].text.value, 
            rating: feedback
          });

          // Ask for additional comments
          const additionalFeedback = await askQuestion("Any additional feedback? (type 'none' to skip) ");
          if (additionalFeedback.toLowerCase() !== 'none') {
            feedbackArray[feedbackArray.length - 1].additionalFeedback = additionalFeedback;
          }

          // Ask if the user wants to start a new session
          const newSession = await askQuestion("Do you want to start a new session? (yes/no) ");
          sessionContext.isNewSession = newSession.toLowerCase() === "yes";
        }

        // Ask if the user wants to continue
        const continueWorking = await askQuestion("Do you need more assistance? (yes/no) ");
        keepWorking = continueWorking.toLowerCase() === "yes";
      }

      if (!keepWorking) {
        console.log("Thank you for using the Writing Bot. Goodbye!\n");
      }

    } catch (error) {
      console.error(error);
    }
  }

  readline.close();
  console.log("Feedback summary:", feedbackArray);
}

main();