// index.js (Backend)
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
}));

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.post("/generate", async (req, res) => {
  const { prompt, type = "html" } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let fullPrompt;
    if (type === "react") {
      fullPrompt = `
        Generate ONLY the JSX code for a React functional component using Tailwind CSS for: ${prompt}
        
        Important Guidelines:
        1. DO NOT include any explanations, comments about the component, or descriptions before or after the code
        2. DO NOT include import statements or export statements
        3. The code should ONLY contain the JSX that would go inside a return statement
        4. Use Tailwind CSS for styling
        5. Make sure the component is properly structured and contains valid JSX
        
        Example format:
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Title</h1>
          <p className="text-gray-700">Content goes here</p>
        </div>
      `;
    } else {
      fullPrompt = `
        Generate a complete, valid HTML5 page using Tailwind CSS for: ${prompt}
        
        Important Guidelines:
        1. Include <!DOCTYPE html> and proper HTML structure
        2. Include Tailwind CSS via CDN in the head section
        3. DO NOT include any explanations or descriptions before or after the HTML code
        4. Make sure the page is complete and ready to render
        5. The content should be focused on the requested webpage only
        
        Example format:
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Title</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
            <div class="container mx-auto p-4">
                <!-- Content here -->
            </div>
        </body>
        </html>
      `;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const generatedContent = response.text();

    res.status(200).json({ content: generatedContent, type, modelUsed: "gemini-pro" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));