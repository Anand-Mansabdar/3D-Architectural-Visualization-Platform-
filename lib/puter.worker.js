const PROJECT_PREFIX = "roomify_project_";

const jsonError = (status, message, extra = {}) => {
  return new Response(JSON.stringify({ error: message, ...extra }), {
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

    const keys = await userPuter.kv.list(PROJECT_PREFIX);

    const projects = [];
    for (const key of keys) {
      try {
        const raw = await userPuter.kv.get(key);
        if (!raw) continue;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        projects.push({ ...parsed, isPublic: true });
      } catch (_) {
        // skip corrupted entries
      }
    }

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

// -- DEBUG: Temporary endpoint to inspect raw KV data --
router.get("/api/projects/debug", async ({ user }) => {
  try {
    const userPuter = user.puter;
    if (!userPuter) return jsonError(401, "Authentication Failed");

    const keys = await userPuter.kv.list(PROJECT_PREFIX);

    const debugData = {
      keysType: typeof keys,
      keysIsArray: Array.isArray(keys),
      keysLength: keys?.length,
      rawKeys: keys,
      entries: [],
    };

    if (Array.isArray(keys)) {
      for (const key of keys) {
        const raw = await userPuter.kv.get(key);
        debugData.entries.push({
          key,
          keyType: typeof key,
          rawValue: raw,
          rawValueType: typeof raw,
        });
      }
    }

    return new Response(JSON.stringify(debugData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
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
