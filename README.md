# AI-Powered Developer Workspace

## Overview
The AI-Powered Developer Workspace is an interactive, full-stack development environment designed with modern design principles and AI-first functionality. Inspired by Notion's clean and minimalist layout, this platform provides developers with a seamless way to interact with code, manage tasks, and leverage AI features such as coding assistance, regex experimentation, and repository-based Q&A.

## Features
- **Coding Assistant**: Real-time assistance for writing, debugging, and optimizing code.
- **Regex Lab**: A sandbox for experimenting with and testing regex patterns with AI guidance.
- **Ask My Repo**: Connects to GitHub repositories and allows users to query them using AI-driven semantic search.
- **Settings**: Customization options for themes, user preferences, account management, and app integrations.

## Tech Stack
- **Frontend**: Next.js (React framework)
- **Styling**: TailwindCSS
- **State Management**: React Query or Zustand
- **Backend**: Supabase
- **Database**: Postgres
- **AI Integration**: Serverless edge functions
- **Deployment**: Vercel

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd ai-powered-dev-workspace
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the required values.

4. Run the development server:
   ```
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage Guidelines
- Use the **Sidebar** for navigation between features.
- Access the **Coding Assistant** for real-time code suggestions.
- Experiment with regex patterns in the **Regex Lab**.
- Connect your GitHub account in **Ask My Repo** to query your repositories.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.