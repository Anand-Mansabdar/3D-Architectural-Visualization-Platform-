const PROJECT_PREFIX = "roomify_project_";

const jsonError = (status, message, extra = {}) => {
  new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

// Helper function to get the user id
const getUserId = async (userPuter) => {
  try {
    const user = await userPuter.auth.getUser();

    return user?.uuid || null;
  } catch (error) {
    return null;
  }
};

router.post("/api/projects/save", async ({ request, user }) => {
  try {
    const userPuter = user.puter;

    if (!userPuter) return jsonError(401, "Authentication Failed");

    const body = await request.json();
    const project = body?.project;

    if (!project?.id || !project?.sourceImage)
      return jsonError(
        400,
        "Project ID and SourceImage are required to create a project",
      );

    const payload = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    const userId = await getUserId(userPuter);
    if (!userId) return jsonError(401, "Authentication Failed");

    const key = `${PROJECT_PREFIX}${project.id}`;
    await userPuter.kv.set(key, payload);

    return new Response(
      JSON.stringify({ saved: true, id: project.id, project: payload }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    return jsonError(500, "Failed to save project", {
      message: error.message || "Unknown error",
    });
  }
});

router.get("/api/projects/list", async ({ user }) => {
  try {
    const userPuter = user.puter;
    if (!userPuter) return jsonError(401, "Authentication Failed");

    const userId = await getUserId(userPuter);
    if (!userId) return jsonError(401, "Authentication failed");

    const raw = await userPuter.kv.list(PROJECT_PREFIX, { values: true });
    const projects = raw
      .map(({ value }) => {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        return { ...parsed, isPublic: true };
      })
      .filter(Boolean);

    return new Response(JSON.stringify({ projects }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return jsonError(500, "Failed to list projects", {
      message: error.message || "Unknown error",
    });
  }
});

router.get("/api/projects/get", async ({ request, user }) => {
  try {
    const userPuter = user.puter;
    if (!userPuter) return jsonError(401, "Authentication Failed");

    const userId = await getUserId(userPuter);
    if (!userId) return jsonError(401, "Authentication Failed");

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) return jsonError(400, "Project ID is required");

    const key = `${PROJECT_PREFIX}${id}`;
    const raw = await userPuter.kv.get(key);

    if (!raw) return jsonError(404, "Project not found");

    const project = typeof raw === "string" ? JSON.parse(raw) : raw;

    return new Response(JSON.stringify({ project }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return jsonError(500, "Failed to get the project", {
      message: error.message || "Unknown Error",
    });
  }
});
