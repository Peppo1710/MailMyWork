import nodemailer from "nodemailer";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  console.log("Handler called with method:", req.method);

  if (req.method !== "POST") {
    console.log("Method not allowed");
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const {
    todos = [],
    sendEmail = false,
    senderEmail = "",
    smtpPass = "",
    to = "",
    cc = "",
    bcc = "",
    context = ""
  } = req.body;

  console.log("Received todos:", todos);
  console.log("Send email flag:", sendEmail);
  console.log("Email details:", { senderEmail, to, cc, bcc });

  if (!Array.isArray(todos) || todos.length === 0) {
    console.log("Invalid or empty todos");
    return res.status(400).json({ error: "Missing todos" });
  }

  if (sendEmail) {
    if (!senderEmail || !smtpPass || !to) {
      return res.status(400).json({
        error: "senderEmail, smtpPass, and to fields are required when sendEmail is true",
      });
    }
  }

  try {
    // Separate incomplete and completed todos
    const incompleteTodos = todos.filter(todo => !todo.startsWith('✓ '));
    const completedTodos = todos.filter(todo => todo.startsWith('✓ ')).map(todo => todo.substring(2)); // Remove ✓ prefix
    
    // Extract EPIC and User Story from context
    let epic = '';
    let userStory = '';
    
    if (context) {
      const epicMatch = context.match(/EPIC:\s*(.+?)(?:\n|$)/i);
      const userStoryMatch = context.match(/User Story:\s*(.+?)(?:\n|$)/i);
      
      if (epicMatch) epic = epicMatch[1].trim();
      if (userStoryMatch) userStory = userStoryMatch[1].trim();
    }
    
    // Create the improved prompt
    const prompt = `Please write a professional daily update email summarizing the following todos. The email should start with:

Dear Sir,

Then a brief line like:
"Here are the updates for today's report:"

Next, combine all the todos into a cohesive summary divided into the following sections exactly as shown, with the labels followed by content on the same line (no bullet points):

EPIC: ${epic || '[EPIC]'}

User Story: ${userStory || '[User Story]'}

Task: [Write a concise update summarizing progress on all the todos]

End the email with:

Best regards,
Pradyumn

IMPORTANT REMINDERS:
- Epic and User Story will be provided by user only, so don't elongate it, just copy paste it by formatting it properly
- When it comes to tasks, take the completed tasks and generate a numbered list and put it in a progress or task section
- Keep it small like 10-20 words per task, don't do anything more than that
- Keep the tone formal, concise, and avoid including any subject line or bullet points

Completed tasks to include:
${completedTodos.length > 0 ? completedTodos.map((todo, i) => `${i + 1}. ${todo}`).join('\n') : 'No completed tasks today.'}`;

    console.log("Prompt for Gemini:", prompt);

    // Call Gemini API
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    console.log("Gemini response received");

    const result = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "No output";
    console.log("Generated result:", result);

    // Send email if requested
    if (sendEmail) {
      console.log("Preparing to send email...");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: senderEmail,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"PingUp Daily Summary" <${senderEmail}>`,
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject: "Daily Work Update - " + new Date().toLocaleDateString(),
        html: `<pre style="font-family: monospace; white-space: pre-wrap;">${result}</pre>`,
      });

      console.log("Email sent successfully");
    } else {
      console.log("Skipping email send");
    }

    return res.status(200).json({ success: true, result: result });
  } catch (err) {
    console.error("Error occurred:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
