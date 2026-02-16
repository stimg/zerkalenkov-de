import { useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Carousel } from '@/components/ui/Carousel';
import { useIntersection } from '@/hooks/useIntersection';
import { cn } from '@/lib/utils';
import resumeData from '@/data/resume.json';

export function Projects() {
  const { projects } = resumeData;
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const { ref, hasIntersected } = useIntersection({ threshold: 0.1, freezeOnceVisible: true });

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
            <h2 className="text-3xl md:text-5xl font-bold">Recent Projects</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.filter(p => p.featured).map((project, index) => (
              <Card
                key={project.id}
                hover
                onClick={() => setSelectedProject(project)}
                className={cn(
                  'cursor-pointer transition-all duration-700',
                  hasIntersected
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {project.images && project.images.length > 0 ? (
                  <div
                    className="aspect-video rounded-t-xl bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${project.images[0]})` }}
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-700 rounded-t-xl" />
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
                    {project.skills.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="default" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.skills.length > 4 && (
                      <Badge variant="default" className="text-xs">
                        +{project.skills.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.title}
        className="max-w-4xl"
      >
        {selectedProject && (
          <div className="space-y-6">
            {selectedProject.images && selectedProject.images.length > 0 ? (
              <Carousel images={selectedProject.images} alt={selectedProject.title} />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg" />
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Company</p>
                <p className="font-semibold">{selectedProject.company}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Role</p>
                <p className="font-semibold">{selectedProject.role}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Period</p>
                <p className="font-semibold">{selectedProject.period}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Location</p>
                <p className="font-semibold">{selectedProject.location}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Job Type</p>
                <p className="font-semibold">{selectedProject.jobType}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Employment Type</p>
                <p className="font-semibold">{selectedProject.employmentType}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Description</h3>
              <ul className="text-gray-800 dark:text-gray-200">
                {selectedProject.description}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Achievements</h3>
              <ul className="list-disc list-outside ml-4 space-y-2 text-gray-800 dark:text-gray-200">
                {selectedProject.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProject.skills.map((tech) => (
                  <Badge key={tech} variant="info">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {(selectedProject.links.live || selectedProject.links.github) && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                {selectedProject.links.live && (
                  <a
                    href={selectedProject.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-lg font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )}
                {selectedProject.links.github && (
                  <a
                    href={selectedProject.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-lg font-medium border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-all duration-200"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
