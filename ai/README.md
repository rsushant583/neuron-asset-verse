
# MetaMind AI Module

This directory contains AI integrations for content generation and processing.

## Structure

```
ai/
├── grok_client.py          # Grok AI integration
├── video_generator.py      # AI video generation
├── content_processor.py    # Content analysis and enhancement
├── template_engine.py      # Template-based content generation
└── voice_processor.py      # Voice-to-text processing
```

## Features

- **Story Processing**: Convert life stories into structured content
- **Draft Generation**: AI-powered content creation from user stories
- **Content Enhancement**: Improve readability and engagement
- **Template Application**: Apply design templates to content
- **Voice Transcription**: Convert speech to text with high accuracy

## AI Services

### Grok Integration
```python
from grok_client import GrokClient

client = GrokClient(api_key="your-grok-key")
draft = client.generate_ebook_draft(story_text)
```

### Content Processing
```python
from content_processor import ContentProcessor

processor = ContentProcessor()
enhanced_content = processor.enhance_readability(raw_text)
structured_content = processor.create_chapters(enhanced_content)
```

### Voice Processing
```python
from voice_processor import VoiceProcessor

processor = VoiceProcessor()
transcript = processor.transcribe_audio(audio_file)
cleaned_text = processor.clean_transcript(transcript)
```

## Setup

1. Install dependencies:
   ```bash
   pip install openai grok-sdk whisper-ai nltk spacy
   ```

2. Configure API keys:
   ```bash
   export GROK_API_KEY="your-grok-key"
   export OPENAI_API_KEY="your-openai-key"
   ```

3. Download language models:
   ```bash
   python -m spacy download en_core_web_sm
   ```

## Usage Examples

### Generate eBook Draft
```python
story = "I started my business in 1980 with just $500..."
draft = generate_ebook_draft(story)
chapters = structure_content(draft)
```

### Process Voice Input
```python
audio_file = "user_story.wav"
transcript = transcribe_audio(audio_file)
enhanced_story = enhance_content(transcript)
```
