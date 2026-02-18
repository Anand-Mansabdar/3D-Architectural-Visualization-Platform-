import Button from "components/ui/Button";
import { generate3DView } from "lib/ai.actions";
import { Box, Download, RefreshCcw, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const VisualizerId = () => {
  const location = useLocation();
  const { initialImage, initialRender, name } = location.state || {};

  const navigate = useNavigate();
  const hasInitialGenerated = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const handleBack = () => navigate("/");

  const runGeneration = async () => {
    if (!initialImage) return;

    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: initialImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        // Set the project with the rendered image in the DB
      }
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !initialImage || hasInitialGenerated.current) return;

    hasInitialGenerated.current = true;

    // If there's an initialRender, show it first, then generate new one
    if (initialRender) {
      setCurrentImage(initialRender);
    }

    // Always run generation to get the latest AI result
    runGeneration();
  }, [initialImage, initialRender, isClient]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">Roomify</span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{"Untitled Project"}</h2>
              <p className="note">Created by Anand</p>
            </div>

            <div className="panel-actions">
              <Button
                size="sm"
                onClick={() => {}}
                className="export"
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Plan
              </Button>

              <Button size="sm" onClick={() => {}} className="share">
                <Download className="w-4 h-4 mr-2" />
                Share Plan
              </Button>
            </div>
          </div>

          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img src={currentImage} alt="AI Render" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {isClient && initialImage && (
                  <img
                    src={initialImage}
                    alt="Original"
                    className="render-fallback"
                  />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Rendering...</span>
                  <span className="subtitle">Generating your 3D Visual</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VisualizerId;
