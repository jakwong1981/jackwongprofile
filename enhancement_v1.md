This specification outlines the technical requirements, architecture, API design, database schemas, and UX flows for four key enhancements to the Dynamic Personal Profile web application:

1. **High-Capacity Profile Picture Attachment (`attach profile picture`):** Support image uploads (`.jpg`, `.png`) up to 500 MB in Admin Portal Mode with chunked/multipart processing and image optimization.
2. **Persistent Navigation in Admin Authentication Flow:** Retain top navigation accessibility across public sections (Profile, AI News, etc.) even when on the Admin Login page.
3. **Tri-Lingual Dynamic Content Schema (`en` / `zht` / `sc`):** Comprehensive multilingual data model across Personal Profile, Work Experience, and Academic Records, switchable via client-side language selectors.
4. **DeepSeek API Auto-Translation Engine:** Automated background translation pipeline during Admin updates, auto-generating the missing two languages upon save when content is authored in any single language.

