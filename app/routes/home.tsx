import Navbar from "components/Navbar";
import type { Route } from "./+types/home";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Button from "components/ui/Button";
import Upload from "components/Upload";
import { useNavigate } from "react-router";
import { useState } from "react";
import { createProject } from "lib/puter.actions";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Architectural Visualization Platform" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);

  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString(); // A simple way to create a new id as the date will never be repeated in real time

    // Creating and storing projects
    const name = `Residence ${newId}`;
    const newItem = {
      id: newId,
      name,
      sourceImage: base64Image,
      renderedImage: undefined,
      timestamp: Date.now(),
    };

    const saved = await createProject({ item: newItem, visibility: "private" });
    if (!saved) {
      console.error("Failed to save project");
      return false;
    }

    setProjects((prev) => [newItem, ...prev]);

    navigate(`/visualizer/${newId}`, {
      state: {
        initialImage: saved.sourceImage,
        initialRender: saved.renderedImage || null,
        name,
      },
    });
    return true;
  }; // End of storing the projects logic
  return (
    <div className="home">
      <Navbar />

      {/* Hero section - Below navbar */}
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <p>Introducing Roomify 2.0</p>
        </div>

        <h1>Build beautiful spaces at the speed of thought with Roomify</h1>
        <p className="subtitle">
          Roomify is an AI first design environment that helps you visualize,
          render, and ship architectural projects faster than ever
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start Building <ArrowRight className="icon" />
          </a>

          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>
        </div>

        {/* Upload Design Section */}
        <div className="upload-shell" id="upload">
          <div className="grid-overlay" />

          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>

              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG formats upto 10MB</p>
            </div>

            <Upload
              // onComplete={(base64Data) => {
              //   console.log("Upload Complete: ", base64Data);
              //   // Handle redirection steps - to visualization page
              // }}

              onComplete={handleUploadComplete}
            />
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>
                Your latest work and shared community projects, all in one
                place.
              </p>
            </div>
          </div>

          {/* Projects Overview Section */}
          <div className="projects-grid">
            {projects.map(
              ({ id, name, renderedImage, sourceImage, timestamp }) => (
                <div key={id} className="project-card group">
                  <div className="preview">
                    <img src={renderedImage || sourceImage} alt="Project" />

                    {/* To show the project is built by the community or individual person */}
                    <div className="badge">
                      <span>Community</span>
                    </div>
                  </div>

                  {/* project Name */}
                  <div className="card-body">
                    <div>
                      <h3>{name}</h3>
                      <div className="meta">
                        <Clock size={12} />
                        <span>{new Date(timestamp).toLocaleDateString()}</span>
                        <span>By Anand</span>
                      </div>
                    </div>

                    <div className="arrow">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
