# Project TODO

## Collaborative Editing Feature
- [x] Install and configure Socket.io for real-time communication
- [x] Implement backend WebSocket logic for document synchronization
- [x] Implement backend WebSocket logic for user presence tracking
- [x] Update frontend to connect to WebSocket server
- [x] Display real-time edits from other users in the translation editor
- [x] Show active users with presence avatars in the toolbar
- [x] Test multi-user editing with concurrent sessions

## Citation Generator Feature
- [x] Implement LLM-based case law detection in translated text
- [x] Generate standard legal citations (AIR, SCC format)
- [x] Create citation suggestion UI with accept/dismiss actions
- [x] Link citations to full judgment in Reference Library
- [x] Test citation detection with various case references

## Version History Feature
- [x] Create database schema for document_versions table
- [x] Implement backend API to save document versions
- [x] Implement backend API to fetch version history
- [x] Implement backend API to rollback to a specific version
- [x] Build Version History UI panel with timeline view
- [x] Add diff preview to show changes between versions
- [x] Integrate auto-save on edits in collaborative editor
- [x] Test version tracking and rollback functionality

## Download with Citations Feature
- [x] Install PDF generation library
- [x] Implement backend API to generate PDF with citations as footnotes
- [x] Format citations properly in PDF output
- [x] Add "Download with Citations" button to UI
- [x] Test PDF generation with multiple citations

## Translation Memory Feature
- [x] Create database schema for translation_memory table
- [x] Implement backend API to store translation pairs
- [x] Implement backend API to search for similar phrases
- [x] Build Translation Memory suggestion UI
- [x] Add accept/dismiss actions for suggestions
- [x] Test translation memory with various phrases

## Real Translation Implementation
- [x] Install document processing libraries (pdf-parse, mammoth for DOCX)
- [x] Implement backend API to extract text from uploaded PDFs
- [x] Implement backend API to extract text from uploaded DOCX files
- [x] Create translation service using LLM API
- [x] Apply custom glossaries during translation
- [x] Enhance translation with legal terminology database
- [x] Update frontend to upload files to backend
- [x] Replace demo content with real translated output
- [x] Test translation with actual PDF and DOCX documents

## Database Audit and Integration
- [x] Check existing scraping scripts for all sources
- [x] Verify database.json contains data from Indian Kanoon
- [x] Verify database.json contains data from Supreme Court of India
- [x] Verify database.json contains data from Ministry of Law and Justice
- [x] Verify database.json contains data from CaseMine
- [x] Verify database.json contains data from SCC Online
- [x] Verify database.json contains data from India Code
- [x] Execute missing scraping scripts to complete data collection
- [x] Consolidate all scraped data with source attribution
- [x] Implement efficient search and recall across all sources
- [x] Test resource recall in translation workflow
- [x] Test resource recall in citation generator
- [x] Test resource recall in reference library

## Context-Aware Translation Engine Rebuild
- [ ] Scrape regional legal document templates in English
- [ ] Scrape regional legal document templates in Hindi
- [ ] Scrape regional legal document templates in Gujarati
- [ ] Scrape regional legal document templates in Marathi
- [ ] Scrape regional legal document templates in Kannada
- [ ] Organize corpus by language and document type (contract, agreement, application, appeal, memo)
- [ ] Extract common legal phrases and clauses in each language
- [ ] Build pattern database for regional document conventions
- [ ] Analyze formatting differences across languages
- [ ] Rebuild translation service to use corpus as context examples
- [ ] Implement clause-by-clause translation with context matching
- [ ] Preserve document structure and formatting conventions
- [ ] Test translation quality for English ↔ Hindi
- [ ] Test translation quality for English ↔ Gujarati
- [ ] Test translation quality for English ↔ Marathi
- [ ] Test translation quality for English ↔ Kannada
- [ ] Test translation quality for inter-regional languages (Hindi ↔ Gujarati, etc.)
- [ ] Compare translation quality against Google Translate baseline
- [ ] Validate with sample legal documents in all language pairs

## Side-by-Side Editor Interface Enhancement
- [x] Design split-screen layout with original and translated documents
- [x] Implement real-time editable translation panel
- [x] Add synchronization between original and translated views
- [x] Style the interface to be visually appealing and professional

## Full-Screen Mode
- [x] Add full-screen toggle button to toolbar
- [x] Implement full-screen mode with ESC key support
- [x] Optimize layout for full-screen viewing
- [x] Add visual indicators for full-screen state

## Enhanced Download Functionality
- [x] Implement DOCX download with proper formatting
- [x] Enhance PDF download to preserve document structure
- [x] Add download button with format selection dropdown
- [x] Test downloads preserve all formatting and structure

## User Experience Enhancements
- [x] Add real-time save indicators for edits
- [x] Implement keyboard shortcuts for common actions (Ctrl+S, F11, etc.)
- [x] Add accessibility features (ARIA labels, keyboard navigation)
- [x] Create smooth transitions and animations
- [ ] Test on mobile devices for responsive behavior

## Download Button Improvements
- [x] Update download button to show "Download with Citations" only when citations exist
- [x] Show regular "Download" button with format options when no citations
- [x] Test both scenarios (with and without citations)

## Fix Translation Failure
- [x] Convert documentProcessor.ts from CommonJS require() to ES module imports
- [x] Add comprehensive error logging and handling
- [x] Improve error messages to show detailed information
- [ ] Test document upload and translation with PDF files
- [ ] Test document upload and translation with DOCX files
- [x] Verify error handling works correctly
