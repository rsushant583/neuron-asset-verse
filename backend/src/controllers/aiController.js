import { openai } from '../services/openai.js';
import { anthropic } from '../services/anthropic.js';
import { supabase } from '../services/supabase.js';
import { uploadToIPFS } from '../services/ipfs.js';
import { logger } from '../utils/logger.js';
import { addToQueue } from '../services/queues.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate content from a prompt
 */
export const generateContent = async (req, res, next) => {
  try {
    const { prompt, category, format, length } = req.body;
    const userId = req.user.id;
    
    // Log the generation request
    logger.info(`Content generation request from user ${userId}: ${prompt.substring(0, 100)}...`);
    
    // Add to queue for processing
    const jobId = uuidv4();
    await addToQueue('contentGeneration', {
      jobId,
      userId,
      prompt,
      category,
      format,
      length
    });
    
    // Return job ID for client to poll
    return res.status(202).json({
      message: 'Content generation job queued',
      jobId
    });
  } catch (error) {
    logger.error('Error generating content:', error);
    next(error);
  }
};

/**
 * Generate draft from story
 */
export const generateDraft = async (req, res, next) => {
  try {
    const { story, category, style } = req.body;
    const userId = req.user.id;
    
    // Prepare system prompt based on category and style
    let systemPrompt = "You are an expert editor and writer. Transform the following personal story into a well-structured draft.";
    
    if (category === 'medical') {
      systemPrompt += " Focus on health insights, medical experiences, and wellness advice. Use professional medical terminology where appropriate.";
    } else if (category === 'business') {
      systemPrompt += " Focus on business lessons, entrepreneurial insights, and professional growth. Use business terminology and highlight strategic thinking.";
    } else if (category === 'personal') {
      systemPrompt += " Focus on personal growth, life lessons, and emotional insights. Use engaging storytelling techniques.";
    }
    
    if (style === 'formal') {
      systemPrompt += " Use a formal, professional tone.";
    } else if (style === 'conversational') {
      systemPrompt += " Use a conversational, approachable tone.";
    } else if (style === 'inspirational') {
      systemPrompt += " Use an inspirational, motivational tone.";
    }
    
    // Generate draft using Claude (better for long-form content)
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is my story that needs to be transformed into a well-structured draft:\n\n${story}\n\nPlease organize it into clear sections with an introduction, body chapters, and conclusion. Enhance the clarity and flow while preserving my voice and key insights.`
        }
      ]
    });
    
    const draft = response.content[0].text;
    
    // Extract potential chapters using regex
    const chapterRegex = /(?:Chapter|Section)\s+\d+:\s+([^\n]+)|(?:^|\n)#+\s+([^\n]+)/g;
    const chaptersMatches = [...draft.matchAll(chapterRegex)];
    const chapters = chaptersMatches.map(match => match[1] || match[2]);
    
    // Calculate word count
    const wordCount = draft.split(/\s+/).filter(word => word.length > 0).length;
    
    // Save draft to database
    const { data: draftData, error } = await supabase
      .from('drafts')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          content: draft,
          chapters,
          word_count: wordCount,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(200).json({
      draft: draftData,
      chapters,
      word_count: wordCount
    });
  } catch (error) {
    logger.error('Error generating draft:', error);
    next(error);
  }
};

/**
 * Enhance content
 */
export const enhanceContent = async (req, res, next) => {
  try {
    const { content, enhancementType } = req.body;
    
    let prompt = "";
    
    switch (enhancementType) {
      case 'clarity':
        prompt = "Improve the clarity and readability of the following content while preserving its meaning:";
        break;
      case 'engagement':
        prompt = "Make the following content more engaging and captivating for readers:";
        break;
      case 'professional':
        prompt = "Enhance the following content to sound more professional and authoritative:";
        break;
      case 'simplify':
        prompt = "Simplify the following content to make it more accessible to a general audience:";
        break;
      default:
        prompt = "Improve the following content while preserving its meaning:";
    }
    
    // Use OpenAI for shorter content enhancements
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert editor specializing in ${enhancementType} improvements. Your task is to enhance the content while preserving the original meaning and voice.`
        },
        {
          role: "user",
          content: `${prompt}\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const enhancedContent = response.choices[0].message.content;
    
    return res.status(200).json({
      original: content,
      enhanced: enhancedContent,
      enhancementType
    });
  } catch (error) {
    logger.error('Error enhancing content:', error);
    next(error);
  }
};

/**
 * Generate image for product
 */
export const generateImage = async (req, res, next) => {
  try {
    const { prompt, style, size } = req.body;
    
    // Default to 1024x1024 if size not specified
    const imageSize = size || "1024x1024";
    
    // Enhance prompt based on style
    let enhancedPrompt = prompt;
    if (style === 'cyberpunk') {
      enhancedPrompt = `${prompt}, cyberpunk style, neon colors, futuristic, digital, high detail`;
    } else if (style === 'minimalist') {
      enhancedPrompt = `${prompt}, minimalist style, clean lines, simple, modern, elegant`;
    } else if (style === 'abstract') {
      enhancedPrompt = `${prompt}, abstract style, colorful, artistic, conceptual, expressive`;
    }
    
    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: imageSize,
      quality: "standard",
      response_format: "url"
    });
    
    const imageUrl = response.data[0].url;
    
    // Upload to IPFS for permanence
    const ipfsHash = await uploadToIPFS(imageUrl);
    
    return res.status(200).json({
      imageUrl,
      ipfsHash,
      prompt: enhancedPrompt
    });
  } catch (error) {
    logger.error('Error generating image:', error);
    next(error);
  }
};

/**
 * Transcribe audio to text
 */
export const transcribeAudio = async (req, res, next) => {
  try {
    const { audioUrl } = req.body;
    
    // Transcribe audio using OpenAI Whisper
    const response = await openai.audio.transcriptions.create({
      file: await fetch(audioUrl).then(r => r.blob()),
      model: "whisper-1",
      language: "en",
      response_format: "text"
    });
    
    return res.status(200).json({
      transcript: response.text,
      audioUrl
    });
  } catch (error) {
    logger.error('Error transcribing audio:', error);
    next(error);
  }
};

/**
 * Process voice command
 */
export const processVoiceCommand = async (req, res, next) => {
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