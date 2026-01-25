# Complete Redesign Plan

## Problem Statement
The current tool fails to deliver on its core promise: translating Indian legal documents with the quality of an experienced human interpreter. Key failures:
1. **Incomplete translation**: Names, addresses, and proper nouns remain in English
2. **Feature bloat**: Glossaries, toolkits, and other features add complexity without value
3. **Unused corpus**: 101 documents scraped but not effectively leveraged
4. **Poor UX**: Overcomplicated interface distracts from core workflow

## Core Objective (Restated)
Build a tool that translates commercial and litigation documents (agreements, contracts, applications, appeals, memos) between 5 Indian languages (English, Hindi, Gujarati, Marathi, Kannada) with:
- **100% target language output** (including transliterated names/addresses)
- **Contextual accuracy** using regional legal conventions
- **Document format preservation**
- **Simple, focused interface**

## What Gets Removed
1. ❌ Glossary management UI
2. ❌ Jurist toolkit
3. ❌ Translation memory suggestions UI
4. ❌ Citation generator
5. ❌ Version history
6. ❌ Collaborative editing
7. ❌ Reference library

## What Stays (Core Features Only)
1. ✅ Document upload (PDF, DOCX, TXT)
2. ✅ Language selection (source + target)
3. ✅ Translation engine
4. ✅ Side-by-side editor
5. ✅ Download (PDF, DOCX)
6. ✅ Quality scoring

## Critical Fixes

### 1. Transliteration Engine
**Problem**: "John Smith, 123 Main Street" stays in English
**Solution**: 
- Detect all proper nouns (names, places, addresses)
- Transliterate to target script using phonetic rules
- Example: "John Smith" → "जॉन स्मिथ" (Hindi), "જોન સ્મિથ" (Gujarati)

### 2. Corpus Utilization
**Problem**: 101 documents exist but aren't improving translations
**Solution**:
- Use corpus documents as few-shot examples in LLM prompt
- Show LLM how similar documents were translated
- Extract common legal phrases from corpus and inject into prompt

### 3. Translation Prompt Redesign
**Current**: Over-engineered with too many instructions
**New**: 
- Clear directive: "Translate EVERYTHING including names and addresses"
- Provide 2-3 corpus examples of similar documents
- Explicit transliteration rules
- Format preservation instructions

### 4. Interface Simplification
**New Flow**:
```
[Upload Document] → [Select Languages] → [Translate] → [Review & Edit] → [Download]
```

No sidebars, no extra features, no distractions.

## Implementation Order
1. Fix transliteration in translation engine
2. Update LLM prompt with corpus examples
3. Remove unnecessary features from UI
4. Redesign interface to be clean and focused
5. Test with real documents
6. Verify 100% target language output

## Success Criteria
- Upload a contract with "John Smith, 123 Main Street, ABC Corporation"
- Translate English → Hindi
- Output should have: "जॉन स्मिथ, 123 मेन स्ट्रीट, एबीसी कॉर्पोरेशन"
- **Zero English words** in the translated document
- Translation quality matches or exceeds human interpreter
