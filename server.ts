import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory "database" for the demo
  let leads = [
    {
      id: "1",
      name: "João Silva",
      phone: "+351 912 345 678",
      origin: "Instagram",
      type: "comprador",
      interest: "T2 em Lisboa",
      status: "quente",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      name: "Maria Santos",
      phone: "+351 933 111 222",
      origin: "Facebook",
      type: "vendedor",
      interest: "Moradia em Cascais",
      status: "novo",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "3",
      name: "Pedro Costa",
      phone: "+351 966 999 888",
      origin: "WhatsApp",
      type: "angariador",
      interest: "Consultor focado em Sintra",
      status: "entrevista",
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    }
  ];

  // API Routes
  app.get("/api/leads", (req, res) => {
    res.json(leads);
  });

  app.post("/api/leads", (req, res) => {
    const newLead = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...req.body
    };
    leads = [newLead, ...leads].slice(0, 50); // Keep last 50
    res.json(newLead);
  });

  app.patch("/api/leads/:id", (req, res) => {
    const { id } = req.params;
    leads = leads.map(l => l.id === id ? { ...l, ...req.body } : l);
    res.json(leads.find(l => l.id === id));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
