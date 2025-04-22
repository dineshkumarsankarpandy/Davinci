// src/components/Dashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Calendar, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

import { formatDate } from '@/lib/utils';
import ApiService from '../services/apiService';
import { getErrorMessage } from '../lib/errorHandling';
import { ProjectResponse } from '@/types/type';
import { Sidebar } from './sidebar';

export function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectResponse[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const navigate = useNavigate();

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      setProjectsError(null);
      try {
        const fetchedProjects = await ApiService.getAllProjects();
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
      } catch (error) {
        const message = getErrorMessage(error);
        setProjectsError(message);
        if (error instanceof Error && 'response' in error && error.response !== 401) {
          toast.error(`Failed to load projects: ${message}`);
        }
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter projects based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = projects.filter(project => 
        project.name.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredProjects(filtered);
    }
    setDisplayLimit(10); // Reset display limit when search changes
  }, [searchQuery, projects]);

  // Load more projects
  const loadMore = useCallback(() => {
    setDisplayLimit(prevLimit => prevLimit + 10);
  }, []);

  // Handle scroll for lazy loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && filteredProjects.length > displayLimit) {
      loadMore();
    }
  }, [filteredProjects.length, displayLimit, loadMore]);

  const handleCreateProject = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Please log in to create a project.");
      setIsDialogOpen(false);
      navigate("/login");
      return;
    }

    if (!projectName.trim()) {
      setCreateError("Project name cannot be empty.");
      toast.error("Project name cannot be empty.");
      return;
    }
    setCreateError(null);
    setIsCreating(true);
    const loadingToastId = toast.loading('Creating project...');

    try {
      const newProject: ProjectResponse = await ApiService.createProject(projectName);
      console.log("Project created:", newProject);

      if (newProject && newProject.id) {
        toast.success(`Project "${projectName}" created! Redirecting...`, { id: loadingToastId });
        setIsDialogOpen(false);
        setProjectName('');
        navigate(`/canvas/${newProject.id}`, { state: { isNewProject: true } });
      } else {
        toast.error("Project created, but failed to get ID for redirection.", { id: loadingToastId });
        setIsDialogOpen(false);
        setProjectName('');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      if (error instanceof Error && 'response' in error && error.response !== 401) {
        setCreateError(message);
        toast.error(`Creation Failed: ${message}`, { id: loadingToastId });
        console.error("Failed to create project (non-401):", error);
      } else {
        toast.dismiss(loadingToastId);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setProjectName('');
      setCreateError(null);
      setIsCreating(false);
    }
  }

  return (
    <div className="flex h-screen w-full">
      {/* <Sidebar /> */}
      <div className="flex flex-col w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          {/* --- Dialog Trigger --- */}
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button
                title="Add a new project"
                name="newProject"
              >
                Add New Project
              </Button>
            </DialogTrigger>

            {/* --- Dialog Content --- */}
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Enter a name for your new project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="projectName" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="col-span-3"
                    placeholder="My Awesome Project"
                    disabled={isCreating}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={isCreating || !projectName.trim()}
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* --- End Dialog --- */}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* --- Project List Area --- */}
        <div className="flex-grow">
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          {isLoadingProjects && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <p className="ml-2 text-gray-600">Loading projects...</p>
            </div>
          )}
          {projectsError && !isLoadingProjects && (
            <div className="text-center text-red-600 bg-red-100 p-4 rounded">
              <p>Error loading projects: {projectsError}</p>
            </div>
          )}
          {!isLoadingProjects && !projectsError && filteredProjects.length === 0 && (
            <div className="text-center text-gray-500 bg-gray-100 p-6 rounded">
              {searchQuery ? (
                <p>No projects match your search query.</p>
              ) : (
                <>
                  <p>You haven't created any projects yet.</p>
                  <Button variant="link" onClick={() => setIsDialogOpen(true)} className="mt-2">
                    Create your first project
                  </Button>
                </>
              )}
            </div>
          )}
          {!isLoadingProjects && !projectsError && filteredProjects.length > 0 && (
            <ScrollArea className="h-[calc(100vh-280px)]" onScrollCapture={handleScroll}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Project Name</TableHead>
                    <TableHead className="w-1/5">Created</TableHead>
                    <TableHead className="w-1/5">Last Updated</TableHead>
                    <TableHead className="w-1/10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.slice(0, displayLimit).map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          {formatDate(project.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-gray-500" />
                          {formatDate(project.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/canvas/${project.id}`}>
                          <Button variant="outline" size="sm">
                            Open Canvas
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredProjects.length > displayLimit && (
                <div className="flex justify-center my-4">
                  <Button variant="ghost" onClick={loadMore} className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more...
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
        {/* --- End Project List Area --- */}
      </div>
    </div>
  );
}