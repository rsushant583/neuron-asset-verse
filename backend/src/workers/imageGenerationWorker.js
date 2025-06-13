import { openai } from '../services/openai.js';
import { supabase } from '../services/supabase.js';
import { uploadToIPFS } from '../services/ipfs.js';
import { logger } from '../utils/logger.js';
import axios from 'axios';

/**
 * Process image generation job
 */
export const processImageGeneration = async (data) => {
  try {
    const { jobId, userId, prompt, style, size, productId } = data;
    
    logger.info(`Starting image generation for job ${jobId}`);
    
    // Update job status in database
    await supabase
      .from('generation_jobs')
      .insert([
        {
          id: jobId,
          user_id: userId,
          status: 'processing',
          prompt,
          type: 'image',
          created_at: new Date().toISOString()
        }
      ]);
    
    // Enhance prompt based on style
    let enhancedPrompt = prompt;
    if (style === 'cyberpunk') {
      enhancedPrompt = `${prompt}, cyberpunk style, neon colors, futuristic, digital, high detail`;
    } else if (style === 'minimalist') {
      enhancedPrompt = `${prompt}, minimalist style, clean lines, simple, modern, elegant`;
    } else if (style === 'abstract') {
      enhancedPrompt = `${prompt}, abstract style, colorful, artistic, conceptual, expressive`;
    }
    
    // Default to 1024x1024 if size not specified
    const imageSize = size || "1024x1024";
    
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
    
    // Download image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);
    
    // Upload to storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('ai-assets')
      .upload(`${userId}/${jobId}.png`, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (fileError) throw fileError;
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('ai-assets')
      .getPublicUrl(fileData.path);
    
    const storedImageUrl = urlData.publicUrl;
    
    // Update job status
    await supabase
      .from('generation_jobs')
      .update({
        status: 'completed',
        result: {
          imageUrl: storedImageUrl,
          prompt: enhancedPrompt
        },
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
    
    // If productId is provided, update product preview image
    if (productId) {
      await supabase
        .from('ai_products')
        .update({
          preview_image: storedImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('user_id', userId);
    }
    
    logger.info(`Image generation completed for job ${jobId}`);
    
    return {
      success: true,
      jobId,
      imageUrl: storedImageUrl
    };
  } catch (error) {
    logger.error(`Error generating image for job ${data.jobId}:`, error);
    
    // Update job status with error
    await supabase
      .from('generation_jobs')
      .update({
        status: 'failed',
        error: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', data.jobId);
    
    throw error;
  }
};