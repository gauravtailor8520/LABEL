import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_DIR = path.join(os.homedir(), '.label-studio-app');
const STORAGE_FILE = path.join(STORAGE_DIR, 'projects.json');

export interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  createdDate: string;
  lastOpenedDate: string;
  config?: Record<string, any>;
}

export interface ProjectsData {
  lastActiveProjectId: string | null;
  projects: ProjectMetadata[];
}

async function ensureStorage(): Promise<ProjectsData> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    try {
      const content = await fs.readFile(STORAGE_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      const initialData: ProjectsData = {
        lastActiveProjectId: null,
        projects: [],
      };
      await fs.writeFile(STORAGE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
  } catch (error) {
    console.error('Error ensuring storage directory:', error);
    return { lastActiveProjectId: null, projects: [] };
  }
}

async function saveStorage(data: ProjectsData): Promise<void> {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET: Fetch all projects and last active project ID
export async function GET() {
  try {
    const data = await ensureStorage();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to read projects' }, { status: 500 });
  }
}

// POST: Create, Select, or Update Project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, name, path: projectPath, projectId, config } = body;
    const data = await ensureStorage();

    if (action === 'create') {
      if (!name || !projectPath) {
        return NextResponse.json({ error: 'Project name and path are required' }, { status: 400 });
      }

      // Check if dataset path exists
      const normalizedPath = path.normalize(projectPath.trim());
      try {
        await fs.access(normalizedPath);
      } catch {
        return NextResponse.json({ error: `Directory path not found at: ${normalizedPath}` }, { status: 404 });
      }

      // Check structure strictly: classes.json, images/, labels/
      const classesPath = path.join(normalizedPath, 'classes.json');
      let categoriesExist = false;
      try {
        await fs.access(classesPath);
        categoriesExist = true;
      } catch {
        categoriesExist = false;
      }

      let imageDirExists = false;
      try {
        await fs.access(path.join(normalizedPath, 'images'));
        imageDirExists = true;
      } catch {
        try {
          await fs.access(path.join(normalizedPath, 'image'));
          imageDirExists = true;
        } catch {
          imageDirExists = false;
        }
      }

      let labelDirExists = false;
      try {
        await fs.access(path.join(normalizedPath, 'labels'));
        labelDirExists = true;
      } catch {
        try {
          await fs.access(path.join(normalizedPath, 'label'));
          labelDirExists = true;
        } catch {
          labelDirExists = false;
        }
      }

      const missingComponents: string[] = [];
      if (!categoriesExist) missingComponents.push('classes.json');
      if (!imageDirExists) missingComponents.push('images/');
      if (!labelDirExists) missingComponents.push('labels/');

      if (missingComponents.length > 0) {
        let errorMsg = '';
        if (missingComponents.length === 1) {
          const item = missingComponents[0];
          if (item === 'classes.json') {
            errorMsg = 'The `classes.json` file was not found in the selected dataset path. Please create it before continuing.';
          } else if (item === 'images/') {
            errorMsg = 'The `images` directory was not found in the selected dataset path. Please create it before continuing.';
          } else if (item === 'labels/') {
            errorMsg = 'The `labels` directory was not found in the selected dataset path. Please create it before continuing.';
          }
        } else {
          errorMsg = `The selected dataset is incomplete.\n\nMissing:\n${missingComponents.map(item => `* \`${item}\``).join('\n')}\n\nPlease create the missing items before creating the project.`;
        }

        return NextResponse.json({
          error: errorMsg,
          missing: missingComponents
        }, { status: 400 });
      }

      const existingProjectIndex = data.projects.findIndex(
        (p) => p.path.toLowerCase() === normalizedPath.toLowerCase()
      );

      const now = new Date().toISOString();
      let project: ProjectMetadata;

      if (existingProjectIndex >= 0) {
        // Update existing project with new name/opened date
        data.projects[existingProjectIndex].name = name.trim();
        data.projects[existingProjectIndex].lastOpenedDate = now;
        if (config) data.projects[existingProjectIndex].config = config;
        project = data.projects[existingProjectIndex];
      } else {
        // Create new project
        project = {
          id: uuidv4(),
          name: name.trim(),
          path: normalizedPath,
          createdDate: now,
          lastOpenedDate: now,
          config: config || {},
        };
        data.projects.unshift(project);
      }

      data.lastActiveProjectId = project.id;
      await saveStorage(data);

      return NextResponse.json({ success: true, project, data });
    }

    if (action === 'select') {
      if (!projectId) {
        return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
      }

      const targetProject = data.projects.find((p) => p.id === projectId);
      if (!targetProject) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      targetProject.lastOpenedDate = new Date().toISOString();
      data.lastActiveProjectId = projectId;
      await saveStorage(data);

      return NextResponse.json({ success: true, project: targetProject, data });
    }

    if (action === 'update_path') {
      if (!projectId || !projectPath) {
        return NextResponse.json({ error: 'Missing projectId or path' }, { status: 400 });
      }

      const normalizedPath = path.normalize(projectPath.trim());
      try {
        await fs.access(normalizedPath);
      } catch {
        return NextResponse.json({ error: `Directory path not found at: ${normalizedPath}` }, { status: 404 });
      }

      // Check structure strictly: classes.json, images/, labels/
      const classesPath = path.join(normalizedPath, 'classes.json');
      let categoriesExist = false;
      try {
        await fs.access(classesPath);
        categoriesExist = true;
      } catch {
        categoriesExist = false;
      }

      let imageDirExists = false;
      try {
        await fs.access(path.join(normalizedPath, 'images'));
        imageDirExists = true;
      } catch {
        try {
          await fs.access(path.join(normalizedPath, 'image'));
          imageDirExists = true;
        } catch {
          imageDirExists = false;
        }
      }

      let labelDirExists = false;
      try {
        await fs.access(path.join(normalizedPath, 'labels'));
        labelDirExists = true;
      } catch {
        try {
          await fs.access(path.join(normalizedPath, 'label'));
          labelDirExists = true;
        } catch {
          labelDirExists = false;
        }
      }

      const missingComponents: string[] = [];
      if (!categoriesExist) missingComponents.push('classes.json');
      if (!imageDirExists) missingComponents.push('images/');
      if (!labelDirExists) missingComponents.push('labels/');

      if (missingComponents.length > 0) {
        let errorMsg = '';
        if (missingComponents.length === 1) {
          const item = missingComponents[0];
          if (item === 'classes.json') {
            errorMsg = 'The `classes.json` file was not found in the selected dataset path. Please create it before continuing.';
          } else if (item === 'images/') {
            errorMsg = 'The `images` directory was not found in the selected dataset path. Please create it before continuing.';
          } else if (item === 'labels/') {
            errorMsg = 'The `labels` directory was not found in the selected dataset path. Please create it before continuing.';
          }
        } else {
          errorMsg = `The selected dataset is incomplete.\n\nMissing:\n${missingComponents.map(item => `* \`${item}\``).join('\n')}\n\nPlease create the missing items before creating the project.`;
        }

        return NextResponse.json({
          error: errorMsg,
          missing: missingComponents
        }, { status: 400 });
      }

      const targetProject = data.projects.find((p) => p.id === projectId);
      if (!targetProject) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      targetProject.path = normalizedPath;
      if (name) targetProject.name = name.trim();
      targetProject.lastOpenedDate = new Date().toISOString();

      await saveStorage(data);
      return NextResponse.json({ success: true, project: targetProject, data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Remove project from storage history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }

    const data = await ensureStorage();
    data.projects = data.projects.filter((p) => p.id !== id);

    if (data.lastActiveProjectId === id) {
      data.lastActiveProjectId = data.projects[0]?.id || null;
    }

    await saveStorage(data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 500 });
  }
}
