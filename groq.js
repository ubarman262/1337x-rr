const Groq = require("groq-sdk");
require("dotenv").config();

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });
async function extractName(url) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `you are a movie name extraction bot. your job is to extract movie names from url.
          Return the result in JSON format like - {
            name: <movie-name>`,
      },
      {
        role: "user",
        content: url,
      },
    ],
    model: "llama3-8b-8192",
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    stop: null,
  });

  // for await (const chunk of chatCompletion) {
  //   return chunk.choices[0]?.delta?.content || "";
  // }
  return chatCompletion.choices[0].message.content;
}

extractName(
  "https://1337x.to/torrent/6288253/The-Substance-2024-1080p-Bluray-DDP5-1-HEVC-x265-BluBirD-mkv/"
);

module.exports = {
  extractName,
};
