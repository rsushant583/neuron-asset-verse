
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

app = FastAPI()

# Pydantic models
class DraftCreate(BaseModel):
    user_id: str
    content: str
    title: Optional[str] = None
    chapters: Optional[List[str]] = []
    word_count: Optional[int] = 0

class Draft(BaseModel):
    id: str
    user_id: str
    version: int
    content: str
    title: Optional[str] = None
    chapters: Optional[List[str]] = []
    word_count: Optional[int] = 0
    created_at: datetime

class TitleCheck(BaseModel):
    title: str

class TitleSuggestion(BaseModel):
    content: str
    category: Optional[str] = None

class ContentAnalysis(BaseModel):
    content: str

# Mock database - replace with actual Supabase integration
drafts_db = []

@app.post("/api/save-draft", response_model=Draft)
async def save_draft(draft_data: DraftCreate):
    """Save a new draft version"""
    try:
        # Get next version number for user
        user_drafts = [d for d in drafts_db if d.get('user_id') == draft_data.user_id]
        next_version = len(user_drafts) + 1
        
        draft = {
            "id": str(uuid.uuid4()),
            "user_id": draft_data.user_id,
            "version": next_version,
            "content": draft_data.content,
            "title": draft_data.title,
            "chapters": draft_data.chapters or [],
            "word_count": draft_data.word_count or len(draft_data.content.split()),
            "created_at": datetime.now()
        }
        
        drafts_db.append(draft)
        return Draft(**draft)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save draft: {str(e)}")

@app.get("/api/drafts/{user_id}", response_model=List[Draft])
async def get_drafts(user_id: str):
    """Get all drafts for a user"""
    try:
        user_drafts = [d for d in drafts_db if d.get('user_id') == user_id]
        return [Draft(**draft) for draft in user_drafts]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch drafts: {str(e)}")

@app.delete("/api/drafts/{draft_id}")
async def delete_draft(draft_id: str):
    """Delete a specific draft"""
    try:
        global drafts_db
        drafts_db = [d for d in drafts_db if d.get('id') != draft_id]
        return {"message": "Draft deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete draft: {str(e)}")

@app.post("/api/check-title")
async def check_title(title_data: TitleCheck):
    """Check if a title is unique and suggest alternatives"""
    try:
        # Mock implementation - replace with actual copyright/uniqueness check
        existing_titles = [d.get('title', '').lower() for d in drafts_db if d.get('title')]
        is_unique = title_data.title.lower() not in existing_titles
        
        suggested = None
        if not is_unique:
            suggested = f"{title_data.title} - Revised Edition"
        
        return {
            "isUnique": is_unique,
            "suggested": suggested
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check title: {str(e)}")

@app.post("/api/suggest-titles")
async def suggest_titles(suggestion_data: TitleSuggestion):
    """Generate unique title suggestions based on content and category"""
    try:
        # Mock title suggestions - replace with Grok AI integration
        category_templates = {
            "medical": [
                "Healing Wisdom: A Medical Professional's Journey",
                "Life Lessons from the Clinic: {keyword}",
                "The Art of Caring: Medical Insights",
                "From Diagnosis to Hope: A Doctor's Story",
                "Compassionate Care: Lessons in Medicine"
            ],
            "business": [
                "Entrepreneurial Wisdom: Lessons Learned",
                "Building Success: A Business Journey",
                "The Path to Leadership: {keyword}",
                "From Startup to Success",
                "Business Insights: A Professional's Guide"
            ],
            "personal": [
                "Life Lessons Shared: {keyword}",
                "Wisdom from Experience",
                "My Journey: Stories and Insights",
                "Reflections on a Life Well-Lived",
                "Pearls of Wisdom: A Personal Collection"
            ]
        }
        
        # Extract keywords from content (simplified)
        words = suggestion_data.content.split()
        keywords = [w for w in words if len(w) > 5][:3]
        keyword = keywords[0] if keywords else "Experience"
        
        templates = category_templates.get(suggestion_data.category, category_templates["personal"])
        suggestions = []
        
        for template in templates[:3]:
            if "{keyword}" in template:
                suggestions.append(template.replace("{keyword}", keyword))
            else:
                suggestions.append(template)
        
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate titles: {str(e)}")

@app.post("/api/analyze-content")
async def analyze_content(analysis_data: ContentAnalysis):
    """Analyze content and structure it into chapters"""
    try:
        # Mock content analysis - replace with Grok AI integration
        content = analysis_data.content
        paragraphs = content.split('\n\n')
        
        # Simple heuristic for chapter detection
        chapters = []
        if len(paragraphs) >= 1:
            chapters.append("Introduction")
        if len(paragraphs) >= 3:
            chapters.append("Early Experiences")
        if len(paragraphs) >= 5:
            chapters.append("Key Lessons")
        if len(paragraphs) >= 7:
            chapters.append("Wisdom Gained")
        if len(paragraphs) >= 2:
            chapters.append("Conclusion")
        
        structure = {
            "introduction": paragraphs[0] if paragraphs else "",
            "body": '\n\n'.join(paragraphs[1:-1]) if len(paragraphs) > 2 else "",
            "conclusion": paragraphs[-1] if len(paragraphs) > 1 else ""
        }
        
        return {
            "chapters": chapters,
            "structure": structure,
            "word_count": len(content.split()),
            "estimated_reading_time": len(content.split()) // 200  # 200 WPM average
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze content: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
