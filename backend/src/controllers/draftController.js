import { supabase } from '../services/supabase.js';
import { generateTitleSuggestions } from '../services/ai.js';
import { analyzeContentStructure } from '../services/ai.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all drafts for a user
 */
export const getDrafts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Verify user has access to these drafts
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Unauthorized access to drafts'
      });
    }

    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching drafts:', error);
    next(error);
  }
};

/**
 * Save a new draft
 */
export const saveDraft = async (req, res, next) => {
  try {
    const { userId, content, title, chapters, word_count } = req.body;
    
    // Verify user has access to save drafts
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Unauthorized access to save drafts'
      });
    }

    // Get next version number for user
    const { data: userDrafts, error: fetchError } = await supabase
      .from('drafts')
      .select('version')
      .eq('user_id', userId)
      .order('version', { ascending: false })
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    const nextVersion = userDrafts.length > 0 ? userDrafts[0].version + 1 : 1;
    
    // Calculate word count if not provided
    const calculatedWordCount = word_count || content.split(/\s+/).filter(word => word.length > 0).length;
    
    // Create new draft
    const draft = {
      id: uuidv4(),
      user_id: userId,
      version: nextVersion,
      content,
      title: title || null,
      chapters: chapters || [],
      word_count: calculatedWordCount,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('drafts')
      .insert([draft])
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(201).json(data);
  } catch (error) {
    logger.error('Error saving draft:', error);
    next(error);
  }
};

/**
 * Delete a draft
 */
export const deleteDraft = async (req, res, next) => {
  try {
    const { draftId } = req.params;
    
    // Get draft to verify ownership
    const { data: draft, error: fetchError } = await supabase
      .from('drafts')
      .select('user_id')
      .eq('id', draftId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Draft not found' });
      }
      throw fetchError;
    }
    
    // Verify user has access to delete this draft
    if (draft.user_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Unauthorized access to delete draft'
      });
    }
    
    // Delete the draft
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId);
    
    if (error) throw error;
    
    return res.status(200).json({
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting draft:', error);
    next(error);
  }
};

/**
 * Check if a title is unique
 */
export const checkTitle = async (req, res, next) => {
  try {
    const { title } = req.body;
    
    // Check if title exists in products
    const { data, error } = await supabase
      .from('ai_products')
      .select('title')
      .ilike('title', title)
      .limit(1);
    
    if (error) throw error;
    
    const isUnique = data.length === 0;
    let suggested = null;
    
    if (!isUnique) {
      // Generate a suggested alternative
      suggested = `${title} - Revised Edition`;
    }
    
    return res.status(200).json({
      isUnique,
      suggested
    });
  } catch (error) {
    logger.error('Error checking title:', error);
    next(error);
  }
};

/**
 * Generate title suggestions
 */
export const suggestTitles = async (req, res, next) => {
  try {
    const { content, category } = req.body;
    
    // Generate title suggestions using AI
    const suggestions = await generateTitleSuggestions(content, category);
    
    return res.status(200).json({
      suggestions
    });
  } catch (error) {
    logger.error('Error generating title suggestions:', error);
    next(error);
  }
};

/**
 * Analyze content structure
 */
export const analyzeContent = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    // Analyze content structure using AI
    const analysis = await analyzeContentStructure(content);
    
    return res.status(200).json(analysis);
  } catch (error) {
    logger.error('Error analyzing content:', error);
    next(error);
  }
};