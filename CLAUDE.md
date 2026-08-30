Project & Functional Specification (Spec)

1. Objective

Core Objective: Build a dynamic personal profile management system that allows real-time updates of personal details, including full name, current job title, current company, professional experience, academic certifications and credentials, contact information (phone, email, Facebook, Instagram, Xiaohongshu), and bio/summary.

User Scenarios & Use Cases:

Public View: Public-facing portfolio/profile accessible across all platforms.

Admin Portal: Authenticated administrative dashboard providing full CRUD operations over all site data.

Cross-Platform Accessibility: Fully responsive UI ensuring seamless data updating and viewing across desktop, tablet, and mobile devices.

2. Functional & Technical Requirements

[ ] Split-Pane Editor Layout: Dual-column workspace (left: editor, right: live preview) supporting responsive layouts (collapsing into a stacked/tabbed view on mobile viewports).

[ ] GFM Compliance: Support for GitHub Flavored Markdown (tables, task lists, code syntax highlighting).

[ ] Client-Side Persistence: Auto-save mechanism persisting state to localStorage every 2 seconds.

[ ] Keyboard Shortcuts: Global shortcut listener (Cmd/Ctrl + S) triggering manual save with a visual notification/toast.

[ ] Responsive Web Design (RWD): Complete RWD implementation across all public and administrative views.

[ ] Internationalization (i18n): Multilingual support with runtime locale switching between Traditional Chinese, Simplified Chinese, and English.

[ ] Form Validation: Client-side and server-side schema validation for all input fields across CRUD interfaces.

[ ] Hierarchical Experience & Education Models:

Work Experience: Support one-to-many relationships per employer (multiple job titles/roles under a single company), with itemized responsibilities and duties per title (resume format).

Academic Background: Support multiple degrees and certifications, including comprehensive credential details and metadata.

[ ] AI-Powered News Aggregator Dashboard:

Ingest the latest AI news and research updates via web scraping/feed extraction from target sources:

The Rundown AI (https://www.therundown.ai)

TechCrunch — AI Section (https://techcrunch.com/category/artificial-intelligence)

MIT Technology Review — AI Topic (https://www.technologyreview.com/topic/artificial-intelligence)

The Batch (DeepLearning.AI) (https://www.deeplearning.ai/the-batch)

Hugging Face Daily Papers (https://huggingface.co/papers)

DeepSeek API Integration: Integrate the DeepSeek API to automate content analysis, executive summarization, keyword extraction/glossary generation, and taxonomy classification.

3. Deliverables & Engineering Standards

Component Architecture: Highly modular component architecture with strict TypeScript definitions isolated in the types/ directory.

Delivery Protocol: Provide explicit file paths and full diffs/code updates per change set; avoid truncating code blocks.

Testing & Quality Assurance:

Unit test coverage for core parsing and transformation logic using Vitest.

Containerized test runs and build validations via Docker.

Design System & UI: Apple-inspired minimalist design language (clean typography, subtle glassmorphism, refined spacing, and balanced neutral palettes).

Process & Documentation:

Adhere to engineering guidelines in ~/.claude/CLAUDE.md.

Maintain developer-generated technical specifications and containerized deployment specs (Docker / Docker Compose / Kubernetes manifests).

4. Architecture, Constraints & Tech Stack

Technology Stack Options:

Frontend:

Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React (Primary).

Permissible Alternatives: Angular or Vue.js.

Backend / RESTful Services: Spring Boot 3.x managed via Apache Maven 3.x.

Persistence Layer: Relational database storage using MySQL or IBM Db2.

Dependency & Library Constraints:

Markdown Parsing: Strictly limited to marked; do not introduce heavy rich-text editor dependencies.

State Management: Use native React state primitives (useState, useReducer, Context API); do not introduce third-party stores such as Redux or Zustand.

Performance & Code Quality Constraints:

Input Optimization: Enforce a 150ms debounce on editor inputs to eliminate UI thread blocking and input latency.

Strict Type Safety: Strict TypeScript compliance; explicit usage of any is strictly prohibited.