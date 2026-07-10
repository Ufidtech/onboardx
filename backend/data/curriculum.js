// Verified curriculum -- the ONLY source of truth for links a learner can
// be sent to. The AI never invents or is trusted with a URL; it only picks
// item ids from this list, and the backend looks up the real url/title
// itself before anything reaches the frontend. This is the actual
// hallucination defense -- not a prompt instruction, an architectural one.
//
// tags: matched against the learner's stated interests (loose keyword match)
// ecosystem: which community this item is preferred for
export const CURRICULUM = [
  // Microsoft ecosystem
  { id: 'ms-web-101', title: 'Build web pages with HTML and CSS for beginners', url: 'https://learn.microsoft.com/en-us/training/paths/build-web-pages-html-css-for-beginners/', ecosystem: 'microsoft', tags: ['html', 'css', 'web design', 'website'] },
  { id: 'ms-web-102', title: 'Web development 101 (JavaScript)', url: 'https://learn.microsoft.com/en-us/training/paths/web-development-101/', ecosystem: 'microsoft', tags: ['javascript', 'js', 'backend', 'api', 'node'] },
  { id: 'ms-python-101', title: 'Build real world applications with Python', url: 'https://learn.microsoft.com/en-us/training/paths/python-language/', ecosystem: 'microsoft', tags: ['python'] },
  { id: 'ms-cloud-101', title: 'Azure cloud concepts (AZ-900)', url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/', ecosystem: 'microsoft', tags: ['cloud', 'azure', 'devops'] },
  { id: 'ms-data-101', title: 'Azure data fundamentals', url: 'https://learn.microsoft.com/en-us/training/paths/azure-data-fundamentals-explore-core-data-concepts/', ecosystem: 'microsoft', tags: ['data', 'sql', 'database'] },
  { id: 'ms-ai-101', title: 'Get started with AI on Azure', url: 'https://learn.microsoft.com/en-us/training/paths/get-started-with-artificial-intelligence-on-azure/', ecosystem: 'microsoft', tags: ['ai', 'machine learning', 'ml'] },
  { id: 'ms-uiux-101', title: 'Prototype your web app', url: 'https://learn.microsoft.com/en-us/training/modules/prototype-your-web-app/', ecosystem: 'microsoft', tags: ['ui', 'ux', 'design'] },
  { id: 'ms-security-101', title: 'Microsoft Learn: security & compliance training', url: 'https://learn.microsoft.com/en-us/training/browse/?terms=security', ecosystem: 'microsoft', tags: ['security', 'cybersecurity'] },
  { id: 'ms-mobile-101', title: 'Microsoft Learn: mobile app development training', url: 'https://learn.microsoft.com/en-us/training/browse/?terms=mobile', ecosystem: 'microsoft', tags: ['mobile', 'ios', 'flutter', 'app development'] },
  { id: 'ms-catalog', title: 'Microsoft Learn full catalog', url: 'https://learn.microsoft.com/en-us/training/browse/', ecosystem: 'microsoft', tags: ['general'] },

  // Google ecosystem
  { id: 'gg-android-101', title: 'Android developer courses', url: 'https://developer.android.com/courses', ecosystem: 'google', tags: ['android', 'mobile', 'app development'] },
  { id: 'gg-web-101', title: 'web.dev Learn (HTML/CSS/JS)', url: 'https://web.dev/learn', ecosystem: 'google', tags: ['html', 'css', 'javascript', 'js', 'web design', 'website', 'backend', 'api'] },
  { id: 'gg-cloud-101', title: 'Google Cloud Skills Boost paths', url: 'https://www.cloudskillsboost.google/paths', ecosystem: 'google', tags: ['cloud', 'devops', 'security', 'cybersecurity'] },
  { id: 'gg-data-101', title: 'Google Cloud Skills Boost catalog (data & analytics)', url: 'https://www.cloudskillsboost.google/catalog', ecosystem: 'google', tags: ['data', 'sql', 'database'] },
  { id: 'gg-ai-101', title: 'Google Cloud Skills Boost catalog (machine learning)', url: 'https://www.cloudskillsboost.google/catalog', ecosystem: 'google', tags: ['ai', 'machine learning', 'ml'] },
  { id: 'gg-catalog', title: 'Google Cloud Skills Boost full catalog', url: 'https://www.cloudskillsboost.google/catalog', ecosystem: 'google', tags: ['general'] },

  // General / platform-agnostic
  { id: 'gen-web-101', title: 'freeCodeCamp: Responsive Web Design', url: 'https://www.freecodecamp.org/learn/responsive-web-design-v9', ecosystem: 'general', tags: ['html', 'css', 'web design', 'website'] },
  { id: 'gen-js-101', title: 'freeCodeCamp: JavaScript', url: 'https://www.freecodecamp.org/learn/javascript-v9', ecosystem: 'general', tags: ['javascript', 'js'] },
  { id: 'gen-python-101', title: 'freeCodeCamp: Scientific Computing with Python', url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/', ecosystem: 'general', tags: ['python'] },
  { id: 'gen-data-101', title: 'freeCodeCamp: Relational Database', url: 'https://www.freecodecamp.org/learn/relational-database/', ecosystem: 'general', tags: ['data', 'sql', 'database'] },
  { id: 'gen-uiux-101', title: 'freeCodeCamp: Front End Development Libraries', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/', ecosystem: 'general', tags: ['ui', 'ux', 'design'] },
  { id: 'gen-security-101', title: 'freeCodeCamp: cybersecurity articles and guides', url: 'https://www.freecodecamp.org/news/tag/cybersecurity/', ecosystem: 'general', tags: ['security', 'cybersecurity'] },
  { id: 'gen-devops-101', title: 'freeCodeCamp: DevOps articles and guides', url: 'https://www.freecodecamp.org/news/tag/devops/', ecosystem: 'general', tags: ['devops', 'backend', 'api', 'node'] },
  { id: 'gen-catalog', title: 'freeCodeCamp full curriculum', url: 'https://www.freecodecamp.org/learn', ecosystem: 'general', tags: ['general'] },
]

export function ecosystemFor(community) {
  const normalized = (community || '').toLowerCase()
  if (normalized.includes('gdg') || normalized.includes('google')) return 'google'
  if (normalized.includes('msa') || normalized.includes('microsoft')) return 'microsoft'
  return 'general'
}

// Returns the subset of the curriculum relevant to this learner's
// ecosystem, falling back to 'general' items if their ecosystem has too
// few matches for a full 4-week plan.
export function curriculumFor(community) {
  const ecosystem = ecosystemFor(community)
  const inEcosystem = CURRICULUM.filter((item) => item.ecosystem === ecosystem)
  const general = CURRICULUM.filter((item) => item.ecosystem === 'general')
  // De-duplicate by id in case ecosystem is already 'general'
  const combined = [...inEcosystem, ...general]
  return combined.filter((item, i) => combined.findIndex((x) => x.id === item.id) === i)
}