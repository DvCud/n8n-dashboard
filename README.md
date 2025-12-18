# 🌌 n8n Workflow Galaxy

A stunning **3D interactive dashboard** that visualizes n8n automation workflows as an orbiting galaxy. Built with Next.js 15, React Three Fiber, and TailwindCSS.

![n8n Workflow Galaxy](https://img.shields.io/badge/n8n-Workflows-00fff2?style=for-the-badge&logo=n8n)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-3D-000?style=for-the-badge&logo=three.js)

## ✨ Features

- **🌟 3D Galaxy Visualization** - Workflows orbit in an immersive particle-filled space
- **🎨 Glassmorphism UI** - Modern, sleek interface with neon accents
- **🔄 Real-time GitHub Sync** - Automatically fetches workflows from repository
- **📊 Multiple View Modes** - Toggle between Galaxy and Grid views
- **🎵 Ambient Audio** - Optional atmospheric soundtrack
- **📱 Responsive Design** - Works beautifully on all devices
- **♿ Accessible** - WCAG 2.2 compliant with keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- npm or pnpm
- Supabase account (optional, for caching)

### Installation

```bash
# Clone the repository
git clone https://github.com/DvCud/n8n-workflow-dashboard.git
cd n8n-workflow-dashboard

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React Three Fiber** | Declarative 3D rendering |
| **@react-three/drei** | Useful R3F helpers |
| **@react-three/postprocessing** | Bloom & vignette effects |
| **TailwindCSS 4** | Utility-first styling |
| **Framer Motion** | UI animations |
| **Zustand** | State management |
| **Supabase** | Database & caching |

## 📁 Project Structure

```
n8n-workflow-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/workflows/      # API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main dashboard
│   ├── components/
│   │   ├── 3d/                 # Three.js components
│   │   │   ├── Scene.tsx       # Canvas & lighting
│   │   │   ├── GalaxyView.tsx  # Orbital layout
│   │   │   ├── WorkflowCard3D.tsx
│   │   │   └── ParticleField.tsx
│   │   └── ui/                 # UI components
│   │       ├── Navigation.tsx
│   │       ├── DetailPanel.tsx
│   │       └── LoadingScreen.tsx
│   ├── lib/
│   │   ├── api.ts              # GitHub API client
│   │   └── supabase.ts         # Supabase client
│   ├── stores/
│   │   └── workflowStore.ts    # Zustand store
│   └── types/
│       └── workflow.ts         # TypeScript types
├── vercel.json                 # Vercel config
├── supabase-schema.sql         # Database schema
└── .github/workflows/          # CI/CD
```

## 🎮 Controls

| Action | Control |
|--------|---------|
| **Rotate** | Click + Drag |
| **Zoom** | Scroll wheel |
| **Select** | Click on card |
| **Pan** | Right-click + Drag |

## 🗃️ Database Setup (Optional)

For workflow caching and analytics, set up Supabase:

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-schema.sql`
3. Copy your project URL and anon key to `.env.local`

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Manual

```bash
npm run build
npm start
```

## 📈 Performance

- **60fps** 3D rendering with WebGL
- **ISR** for 5-minute cache revalidation
- **Lazy loading** for 3D assets
- **Optimized particles** with GPU instancing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

- Workflows by [DvCud](https://github.com/DvCud)
- Powered by [n8n](https://n8n.io) automation platform
- 3D magic via [Three.js](https://threejs.org)

---

<p align="center">
  Made with 💜 and ☕
</p>
