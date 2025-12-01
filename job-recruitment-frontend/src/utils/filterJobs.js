// utils/filterJobs.js
export const filterJobs = (jobs, { type = "all", title = "", location = "", skills = "" }) => {
  return jobs.filter((job) => {
    const jobType = job.type?.toLowerCase() || "";

    // Job type filter (case-insensitive, partial match)
    if (type.toLowerCase() !== "all" && !jobType.includes(type.toLowerCase())) return false;

    // Title filter
    if (title && !job.title?.toLowerCase().includes(title.toLowerCase())) return false;

    // Location filter
    if (location && !job.location?.toLowerCase().includes(location.toLowerCase())) return false;

    // Skills filter (at least one matching skill)
    if (skills) {
      const skillList = skills.split(",").map((s) => s.trim().toLowerCase());
      const hasSkill = job.skills?.some((s) => skillList.includes(s.toLowerCase()));
      if (!hasSkill) return false;
    }

    return true;
  });
};
