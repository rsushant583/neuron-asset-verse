import { openai } from './openai.js';
import { anthropic } from './anthropic.js';
import { logger } from '../utils/logger.js';

/**
 * Generate title suggestions based on content and category
 */
export const generateTitleSuggestions = async (content, category) => {
  try {
    // Prepare a prompt based on the category
    let prompt = "Generate 5 unique, engaging, and SEO-friendly title suggestions for the following content:";
    
    if (category) {
      prompt += ` The content is in the ${category} category.`;
    }
    
    // Truncate content if too long
    const truncatedContent = content.length > 2000 
      ? content.substring(0, 2000) + "..." 
      : content;
    
    // Use OpenAI for title generation (faster response time)
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert copywriter specializing in creating engaging titles for ${category || 'knowledge'} content. 
          Generate 5 unique, catchy, and SEO-friendly title suggestions. 
          Each title should be concise (under 60 characters) and compelling.
          Return ONLY the titles as a numbered list, with no additional text.`
        },
        {
          role: "user",
          content: `${prompt}\n\n${truncatedContent}`
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });
    
    // Parse the response to extract titles
    const titlesText = response.choices[0].message.content;
    const titleLines = titlesText.split('\n').filter(line => line.trim());
    
    // Clean up titles (remove numbers and extra characters)
    const titles = titleLines.map(line => {
      return line.replace(/^\d+[\.\)]\s*/, '').replace(/"/g, '').trim();
    }).filter(title => title.length > 0);
    
    return titles;
  } catch (error) {
    logger.error('Error generating title suggestions:', error);
    
    // Fallback suggestions based on category
    const fallbackTitles = {
      medical: [
        'Healing Wisdom: A Medical Professional\'s Journey',
        'Life Lessons from the Clinic',
        'The Art of Caring: Medical Insights'
      ],
      business: [
        'Entrepreneurial Wisdom: Lessons Learned',
        'Building Success: A Business Journey',
        'The Path to Leadership'
      ],
      personal: [
        'Life Lessons Shared',
        'Wisdom from Experience',
        'My Journey: Stories and Insights'
      ]
    };
    
    return fallbackTitles[category] || fallbackTitles.personal;
  }
};

/**
 * Analyze content structure
 */
export const analyzeContentStructure = async (content) => {
  try {
    // Truncate content if too long
    const truncatedContent = content.length > 4000 
      ? content.substring(0, 4000) + "..." 
      : content;
    
    // Use Claude for content analysis (better understanding of structure)
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: `You are an expert content analyst and editor. Your task is to analyze the structure of the provided content and identify logical chapter divisions.
      
      Return your analysis as a JSON object with the following structure:
      {
        "chapters": ["Chapter 1 Title", "Chapter 2 Title", ...],
        "structure": {
          "introduction": "First few sentences of content...",
          "body": "Main content...",
          "conclusion": "Final thoughts..."
        },
        "word_count": 1234,
        "estimated_reading_time": 5
      }
      
      Limit your response to ONLY the JSON object with no additional text.`,
      messages: [
        {
          role: "user",
          content: `Analyze the structure of this content and suggest logical chapter divisions:\n\n${truncatedContent}`
        }
      ],
      temperature: 0.2
    });
    
    // Parse the response to extract JSON
    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/({[\s\S]*})/);
    
    let analysis;
    if (jsonMatch && jsonMatch[1]) {
      analysis = JSON.parse(jsonMatch[1]);
    } else {
      try {
        analysis = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, create a default analysis
        analysis = {
          chapters: ['Introduction', 'Main Content', 'Conclusion'],
          structure: {
            introduction: content.substring(0, 200),
            body: content.substring(200, content.length - 200),
            conclusion: content.substring(content.length - 200)
          },
          word_count: content.split(/\s+/).filter(word => word.length > 0).length,
          estimated_reading_time: Math.ceil(content.split(/\s+/).length / 200) // 200 WPM
        };
      }
    }
    
    return analysis;
  } catch (error) {
    logger.error('Error analyzing content structure:', error);
    
    // Fallback basic structure
    return {
      chapters: ['Introduction', 'Main Content', 'Conclusion'],
      structure: {
        introduction: content.substring(0, 200),
        body: content.substring(200, content.length - 200),
        conclusion: content.substring(content.length - 200)
      },
      word_count: content.split(/\s+/).filter(word => word.length > 0).length,
      estimated_reading_time: Math.ceil(content.split(/\s+/).length / 200) // 200 WPM
    };
  }
};