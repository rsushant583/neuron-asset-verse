import { openai } from '../services/openai.js';
import { anthropic } from '../services/anthropic.js';
import { supabase } from '../services/supabase.js';
import { uploadToIPFS } from '../services/ipfs.js';
import { logger } from '../utils/logger.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

/**
 * Process content generation job
 */
export const processContentGeneration = async (data) => {
  const { jobId, userId, prompt, category, format, length } = data;
  
  try {
    logger.info(`Starting content generation for job ${jobId}`);
    
    // Update job status in database
    await supabase
      .from('generation_jobs')
      .insert([
        {
          id: jobId,
          user_id: userId,
          status: 'processing',
          prompt,
          category,
          format,
          created_at: new Date().toISOString()
        }
      ]);
    
    // Select AI model based on format and length
    let content;
    if (format === 'ebook' || format === 'course' || (length && length > 2000)) {
      // Use Claude for longer content
      content = await generateWithClaude(prompt, category, format);
    } else {
      // Use GPT-4 for shorter content
      content = await generateWithGPT4(prompt, category, format);
    }
    
    // Generate a title
    const title = await generateTitle(content, category);
    
    // Process content based on format
    let processedContent;
    let contentUrl;
    
    if (format === 'ebook') {
      // Create PDF
      const pdfBytes = await createPDF(title, content);
      
      // Upload to storage
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from('ai-assets')
        .upload(`${userId}/${jobId}.pdf`, pdfBytes, {
          contentType: 'application/pdf',
          upsert: false
        });
      
      if (fileError) throw fileError;
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('ai-assets')
        .getPublicUrl(fileData.path);
      
      contentUrl = urlData.publicUrl;
      processedContent = content;
    } else if (format === 'course') {
      // Process course content (JSON structure)
      processedContent = processCourseContent(content);
      
      // Save as JSON
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from('ai-assets')
        .upload(`${userId}/${jobId}.json`, JSON.stringify(processedContent), {
          contentType: 'application/json',
          upsert: false
        });
      
      if (fileError) throw fileError;
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('ai-assets')
        .getPublicUrl(fileData.path);
      
      contentUrl = urlData.publicUrl;
    } else {
      // Plain text content
      processedContent = content;
      
      // Save as text
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from('ai-assets')
        .upload(`${userId}/${jobId}.txt`, content, {
          contentType: 'text/plain',
          upsert: false
        });
      
      if (fileError) throw fileError;
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('ai-assets')
        .getPublicUrl(fileData.path);
      
      contentUrl = urlData.publicUrl;
    }
    
    // Generate a preview image
    const previewImagePrompt = `Create a professional cover image for a ${format} titled "${title}" about ${category || 'knowledge sharing'}`;
    const previewImageUrl = await generatePreviewImage(previewImagePrompt);
    
    // Create product in database
    const { data: productData, error: productError } = await supabase
      .from('ai_products')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          title,
          description: prompt.substring(0, 200),
          content_url: contentUrl,
          preview_image: previewImageUrl,
          price: 9.99, // Default price
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (productError) throw productError;
    
    // Update job status
    await supabase
      .from('generation_jobs')
      .update({
        status: 'completed',
        result: {
          title,
          content_url: contentUrl,
          preview_image: previewImageUrl,
          product_id: productData.id
        },
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
    
    logger.info(`Content generation completed for job ${jobId}`);
    
    return {
      success: true,
      jobId,
      title,
      contentUrl,
      previewImageUrl,
      productId: productData.id
    };
  } catch (error) {
    logger.error(`Error generating content for job ${jobId}:`, error);
    
    // Update job status with error
    await supabase
      .from('generation_jobs')
      .update({
        status: 'failed',
        error: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
    
    throw error;
  }
};

/**
 * Generate content with Claude
 */
const generateWithClaude = async (prompt, category, format) => {
  try {
    // Prepare system prompt based on format and category
    let systemPrompt = "You are an expert content creator specializing in transforming ideas into valuable knowledge products.";
    
    if (format === 'ebook') {
      systemPrompt += " Create a well-structured eBook with chapters, headings, and a cohesive narrative. Use markdown formatting.";
    } else if (format === 'course') {
      systemPrompt += " Create a structured mini-course with modules, lessons, and actionable exercises. Use markdown formatting.";
    } else if (format === 'script') {
      systemPrompt += " Create a script suitable for a video or podcast, with clear sections and talking points.";
    }
    
    if (category) {
      systemPrompt += ` Focus on ${category} topics and insights.`;
    }
    
    // Generate content
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Create a high-quality ${format || 'knowledge product'} based on this prompt: ${prompt}`
        }
      ]
    });
    
    return response.content[0].text;
  } catch (error) {
    logger.error('Error generating content with Claude:', error);
    throw error;
  }
};

/**
 * Generate content with GPT-4
 */
const generateWithGPT4 = async (prompt, category, format) => {
  try {
    // Prepare system prompt based on format and category
    let systemPrompt = "You are an expert content creator specializing in transforming ideas into valuable knowledge products.";
    
    if (format === 'script') {
      systemPrompt += " Create a script suitable for a video or podcast, with clear sections and talking points.";
    } else if (format === 'summary') {
      systemPrompt += " Create a concise yet comprehensive summary that captures the key points and insights.";
    } else if (format === 'guide') {
      systemPrompt += " Create a practical guide with clear steps, tips, and actionable advice.";
    }
    
    if (category) {
      systemPrompt += ` Focus on ${category} topics and insights.`;
    }
    
    // Generate content
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Create a high-quality ${format || 'knowledge product'} based on this prompt: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    logger.error('Error generating content with GPT-4:', error);
    throw error;
  }
};

/**
 * Generate title for content
 */
const generateTitle = async (content, category) => {
  try {
    // Truncate content for title generation
    const truncatedContent = content.substring(0, 1000);
    
    // Generate title with GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert copywriter specializing in creating engaging titles for ${category || 'knowledge'} content. Generate a single, catchy, and SEO-friendly title. The title should be concise (under 60 characters) and compelling. Return ONLY the title with no additional text or formatting.`
        },
        {
          role: "user",
          content: `Create a title for this content:\n\n${truncatedContent}`
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });
    
    // Clean up title (remove quotes and extra whitespace)
    let title = response.choices[0].message.content.trim();
    title = title.replace(/^["']|["']$/g, ''); // Remove quotes at start/end
    
    return title;
  } catch (error) {
    logger.error('Error generating title:', error);
    return `Knowledge Product - ${new Date().toLocaleDateString()}`;
  }
};

/**
 * Generate preview image
 */
const generatePreviewImage = async (prompt) => {
  try {
    // Generate image with DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url"
    });
    
    const imageUrl = response.data[0].url;
    
    return imageUrl;
  } catch (error) {
    logger.error('Error generating preview image:', error);
    // Return a default image URL
    return "https://via.placeholder.com/1024x1024.png?text=Knowledge+Product";
  }
};

/**
 * Create PDF from content
 */
const createPDF = async (title, content) => {
  try {
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add metadata
    pdfDoc.setTitle(title);
    pdfDoc.setAuthor('MetaMind AI');
    pdfDoc.setCreator('MetaMind Platform');
    pdfDoc.setProducer('MetaMind PDF Generator');
    pdfDoc.setKeywords(['MetaMind', 'AI', 'Knowledge', 'eBook']);
    
    // Add a cover page
    const coverPage = pdfDoc.addPage([600, 800]);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add title to cover page
    coverPage.drawText(title, {
      x: 50,
      y: 700,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    
    // Add "Created with MetaMind" text
    coverPage.drawText('Created with MetaMind AI', {
      x: 50,
      y: 650,
      size: 12,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Add creation date
    coverPage.drawText(`Created on ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: 630,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Process content and add pages
    const paragraphs = content.split('\n\n');
    let currentPage = pdfDoc.addPage([600, 800]);
    let y = 750;
    const lineHeight = 15;
    const pageHeight = 800;
    const margin = 50;
    
    for (const paragraph of paragraphs) {
      // Check if it's a heading
      const isHeading = paragraph.startsWith('#');
      const fontSize = isHeading ? 16 : 12;
      const font = isHeading ? helveticaBold : helvetica;
      
      // Clean up markdown formatting
      const cleanText = paragraph
        .replace(/^#+\s+/, '') // Remove heading markers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
        .replace(/`(.*?)`/g, '$1'); // Remove code markers
      
      // Check if we need a new page
      if (y < margin + fontSize * 2) {
        currentPage = pdfDoc.addPage([600, 800]);
        y = 750;
      }
      
      // Draw text
      currentPage.drawText(cleanText, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
        maxWidth: 500,
        lineHeight
      });
      
      // Move down for next paragraph
      y -= (cleanText.length / 50) * lineHeight + 20; // Approximate line count
    }
    
    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    
    return pdfBytes;
  } catch (error) {
    logger.error('Error creating PDF:', error);
    throw error;
  }
};

/**
 * Process course content into structured format
 */
const processCourseContent = (content) => {
  try {
    // Extract modules and lessons
    const modules = [];
    let currentModule = null;
    
    // Split content by lines
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Check if it's a module heading (# or ## heading)
      if (line.match(/^#+\s+Module\s+\d+/i) || line.match(/^#+\s+Section\s+\d+/i)) {
        if (currentModule) {
          modules.push(currentModule);
        }
        
        currentModule = {
          title: line.replace(/^#+\s+/, ''),
          lessons: [],
          description: ''
        };
      }
      // Check if it's a lesson heading (### heading)
      else if (line.match(/^#{3,}\s+Lesson\s+\d+/i) && currentModule) {
        currentModule.lessons.push({
          title: line.replace(/^#+\s+/, ''),
          content: '',
          exercises: []
        });
      }
      // Check if it's an exercise
      else if (line.match(/^#{4,}\s+Exercise/i) && currentModule && currentModule.lessons.length > 0) {
        const currentLesson = currentModule.lessons[currentModule.lessons.length - 1];
        currentLesson.exercises.push({
          title: line.replace(/^#+\s+/, ''),
          instructions: ''
        });
      }
      // Add content to current section
      else if (line.trim() !== '') {
        if (currentModule) {
          if (currentModule.lessons.length > 0) {
            const currentLesson = currentModule.lessons[currentModule.lessons.length - 1];
            
            if (currentLesson.exercises.length > 0) {
              // Add to current exercise
              const currentExercise = currentLesson.exercises[currentLesson.exercises.length - 1];
              currentExercise.instructions += line + '\n';
            } else {
              // Add to current lesson
              currentLesson.content += line + '\n';
            }
          } else {
            // Add to module description
            currentModule.description += line + '\n';
          }
        }
      }
    }
    
    // Add the last module
    if (currentModule) {
      modules.push(currentModule);
    }
    
    // If no modules were detected, create a simple structure
    if (modules.length === 0) {
      const lessons = [];
      const sections = content.split('\n\n');
      
      for (let i = 0; i < sections.length; i += 2) {
        const title = sections[i].replace(/^#+\s+/, '');
        const content = sections[i + 1] || '';
        
        lessons.push({
          title: title || `Lesson ${i / 2 + 1}`,
          content,
          exercises: []
        });
      }
      
      modules.push({
        title: 'Module 1: Introduction',
        description: 'Introduction to the course',
        lessons
      });
    }
    
    return {
      title: 'AI-Generated Course',
      modules,
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'course'
      }
    };
  } catch (error) {
    logger.error('Error processing course content:', error);
    
    // Return a simple structure if processing fails
    return {
      title: 'AI-Generated Course',
      modules: [
        {
          title: 'Module 1: Content',
          description: 'Course content',
          lessons: [
            {
              title: 'Lesson 1: Main Content',
              content,
              exercises: []
            }
          ]
        }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'course'
      }
    };
  }
};