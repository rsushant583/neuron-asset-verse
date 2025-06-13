import { openai } from '../services/openai.js';
import { anthropic } from '../services/anthropic.js';
import { logger } from '../utils/logger.js';

/**
 * Process voice command
 */
export const processCommand = async (req, res, next) => {
  try {
    const { command, context } = req.body;
    
    // Process command using Claude (better for understanding context)
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: `You are an AI assistant for the MetaMind platform, which helps users create and sell knowledge products.
      
      The platform has the following features:
      - Create eBooks from personal stories
      - Generate AI content in various formats
      - Mint products as NFTs
      - Browse marketplace of knowledge products
      - Dashboard for creators and buyers
      
      Your task is to understand the user's voice command and determine the appropriate action.
      Return a JSON object with the following structure:
      {
        "action": "the_action_to_take",
        "parameters": {
          "param1": "value1",
          ...
        },
        "response": "what to say to the user"
      }
      
      Possible actions include:
      - navigate_to (parameters: path)
      - create_ebook (parameters: category)
      - save_draft
      - set_title (parameters: title)
      - set_category (parameters: category)
      - next_step
      - previous_step
      - publish
      - help
      
      Current context: ${JSON.stringify(context)}`,
      messages: [
        {
          role: "user",
          content: `Process this voice command: "${command}"`
        }
      ],
      temperature: 0.2
    });
    
    // Parse the response to extract the JSON
    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/({[\s\S]*})/);
    
    let parsedResponse;
    if (jsonMatch && jsonMatch[1]) {
      parsedResponse = JSON.parse(jsonMatch[1]);
    } else {
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, create a default response
        parsedResponse = {
          action: "unknown",
          parameters: {},
          response: "I'm not sure how to process that command. Please try again."
        };
      }
    }
    
    return res.status(200).json(parsedResponse);
  } catch (error) {
    logger.error('Error processing voice command:', error);
    next(error);
  }
};

/**
 * Transcribe audio
 */
export const transcribeAudio = async (req, res, next) => {
  try {
    const { audio } = req.body;
    
    // Convert base64 audio to buffer
    const buffer = Buffer.from(audio.split(',')[1], 'base64');
    
    // Create temporary file
    const tempFile = Buffer.from(buffer);
    
    // Transcribe audio using OpenAI Whisper
    const response = await openai.audio.transcriptions.create({
      file: tempFile,
      model: "whisper-1",
      language: "en",
      response_format: "text"
    });
    
    return res.status(200).json({
      transcript: response.text
    });
  } catch (error) {
    logger.error('Error transcribing audio:', error);
    next(error);
  }
};

/**
 * Text to speech
 */
export const textToSpeech = async (req, res, next) => {
  try {
    const { text, voice = 'alloy' } = req.body;
    
    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Set response headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    
    return res.status(200).send(buffer);
  } catch (error) {
    logger.error('Error generating speech:', error);
    next(error);
  }
};