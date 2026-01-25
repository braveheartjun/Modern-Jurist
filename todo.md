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
