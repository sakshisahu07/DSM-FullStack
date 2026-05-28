import ProjectCard from "./ProjectCard";

const projects = [
  {
    id: 1,
    title: "Arduino based food freshness detection project",
    image: "/project.png",
    views: 216,
    likes: 216,
    downloads: 216,
    rating: 4.8,
    ratingCount: 216,
    price: 447,
    originalPrice: 447,
  },
  {
    id: 2,
    title: "Arduino based food freshness detection project",
    image: "/project.png",
    views: 216,
    likes: 216,
    downloads: 216,
    rating: 4.8,
    ratingCount: 216,
    price: 447,
    originalPrice: 447,
  },
  {
    id: 3,
    title: "Arduino based food freshness detection project",
    image: "/project.png",
    views: 216,
    likes: 216,
    downloads: 216,
    rating: 4.8,
    ratingCount: 216,
    price: 447,
    originalPrice: 447,
  },
  {
    id: 4,
    title: "Arduino based food freshness detection project",
    image: "/project.png",
    views: 216,
    likes: 216,
    downloads: 216,
    rating: 4.8,
    ratingCount: 216,
    price: 447,
    originalPrice: 447,
  },
];

interface PopularProjectsProps {
  title: string;
}

export default function PopularProjects({ title }: PopularProjectsProps) {
  return (
    <section className="py-8">
      <h2 className="text-heading font-bold text-xl mb-1">{title}</h2>
      <div className="w-16 h-0.5 bg-primary-gradient mb-6 rounded-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </section>
  );
}
