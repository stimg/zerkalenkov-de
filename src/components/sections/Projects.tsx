import { useState, type FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useIntersection } from '@/hooks/useIntersection';
import { cn } from '@/lib/utils';
import resumeData from '@/data/resume.json';
import { ProjectDetails } from "@/components/sections/ProjectDetails.tsx";
import type { Project } from '@/types/resume';

type FilterType = 'featured' | 'recent' | 'all';

const HEADINGS: Record<FilterType, string> = {
  featured: 'Featured Projects',
  recent: 'Recent Projects',
  all: 'Project Experience',
};

export const Projects: FC = () => {
  const projects: Project[] = resumeData.projects;
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<FilterType>('recent');
  const {ref, hasIntersected} = useIntersection({threshold: 0.1, freezeOnceVisible: true});

  const visibleProjects = projects.filter(p => !p.hidden);

  const filteredProjects =
    filter === 'featured' ? visibleProjects.filter(p => p.featured) :
    filter === 'recent'   ? visibleProjects.slice(0, 6) :
    visibleProjects;

  const heading = HEADINGS[filter];

  return (
    <>
      <section id="projects" ref={ref} className="py-20 bg-white dark:bg-[#0a0a0f]">
        <div className="container-custom">
          <div
            className={cn(
              'text-center mb-16 transition-all duration-700',
              hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{heading}</h2>
            <div className="relative inline-flex items-center">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="appearance-none bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-700 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer transition-colors hover:border-primary-400 dark:hover:border-primary-500"
              >
                <option value="featured">Featured</option>
                <option value="recent">Recent</option>
                <option value="all">All</option>
              </select>
              <ChevronDown className="absolute right-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              const skills = project.skills;
              return <Card
                key={project.id}
                hover
                onClick={() => setSelectedProject(project)}
                className={cn(
                  'cursor-pointer transition-all duration-700',
                  hasIntersected
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                )}
                style={{transitionDelay: `${index * 100}ms`}}
              >
                {project.images && project.images.length > 0 ? (
                  <div
                    className="aspect-video rounded-t-xl bg-cover bg-center bg-no-repeat"
                    style={{backgroundImage: `url(${project.images[0]})`}}
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-700 rounded-t-xl"/>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{project.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{project.company}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-500">
                        <span>{project.location}</span>
                        <span>•</span>
                        <span>{project.jobType}</span>
                        <span>•</span>
                        <span>{project.employmentType}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    { skills.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="default" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {skills.length > 4 && (
                      <Badge variant="default" className="text-xs">
                        +{skills.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            })}
          </div>
        </div>
      </section>

      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.title}
        className="max-w-4xl"
      >
        {selectedProject && (<ProjectDetails project = {selectedProject}/>)}
      </Modal>
    </>
  );
}
