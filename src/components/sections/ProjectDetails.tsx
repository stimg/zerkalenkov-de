import { type FC } from "react";
import { Carousel } from "@/components/ui/Carousel.tsx";
import type { Project } from "@/types/resume";
import { Badge } from "@/components/ui/Badge.tsx";
import { ExternalLink, Github } from 'lucide-react';

interface ProjectDetailsProps {
  project: Project;
}

export const ProjectDetails: FC<ProjectDetailsProps> = ({ project })=> {
  const {title, company, role, period, location, jobType, employmentType, links, images, description, achievements, skills} = project;

  return <div className="space-y-6">
    {images && images.length > 0 ? (
      <Carousel images={images} alt={title}/>
    ) : (
      <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg"/>
    )}

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-1">Company</p>
        <p className="font-semibold">{company}</p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-1">Role</p>
        <p className="font-semibold">{role}</p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-1">Period</p>
        <p className="font-semibold">{period}</p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-1">Location</p>
        <p className="font-semibold">{location}</p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-1">Job Type</p>
        <p className="font-semibold">{jobType}</p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-1">Employment Type</p>
        <p className="font-semibold">{employmentType}</p>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-bold mb-2">Description</h3>
      <ul className="text-gray-800 dark:text-gray-200">
        {description}
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-bold mb-2">Achievements</h3>
      <ul className="list-disc list-outside ml-4 space-y-2 text-gray-800 dark:text-gray-200">
        {achievements.map((achievement, index) => (
          <li key={index}>{achievement}</li>
        ))}
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-bold mb-3">Skills</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((tech) => (
          <Badge key={tech} variant="info">
            {tech}
          </Badge>
        ))}
      </div>
    </div>

    {(links.live || links.github) && (
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        {links.live && (
          <a
            href={links.live}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-lg font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4"/>
            Live Demo
          </a>
        )}
        {links.github && (
          <a
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-lg font-medium border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-all duration-200"
          >
            <Github className="w-4 h-4"/>
            GitHub
          </a>
        )}
      </div>
    )}
  </div>
}
