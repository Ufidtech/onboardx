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
    { id: 'ms-web-101', title: 'Build a simple website (HTML/CSS)', url: 'https://learn.microsoft.com/en-us/training/paths/build-simple-website/', ecosystem: 'microsoft', tags: ['html', 'css', 'web design', 'website'] },
    { id: 'ms-web-102', title: 'Web development 101 (JavaScript)', url: 'https://learn.microsoft.com/en-us/training/paths/web-development-101/', ecosystem: 'microsoft', tags: ['javascript', 'js'] },
    { id: 'ms-python-101', title: 'Beginner Python', url: 'https://learn.microsoft.com/en-us/training/paths/beginner-python/', ecosystem: 'microsoft', tags: ['python'] },
    { id: 'ms-cloud-101', title: 'Azure cloud concepts (AZ-900)', url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/', ecosystem: 'microsoft', tags: ['cloud', 'azure'] },
    { id: 'ms-data-101', title: 'Azure data fundamentals', url: 'https://learn.microsoft.com/en-us/training/paths/azure-data-fundamentals-explore-core-data-concepts/', ecosystem: 'microsoft', tags: ['data', 'sql', 'database'] },
    { id: 'ms-ai-101', title: 'Get started with AI on Azure', url: 'https://learn.microsoft.com/en-us/training/paths/get-started-with-artificial-intelligence-on-azure/', ecosystem: 'microsoft', tags: ['ai', 'machine learning', 'ml'] },
    { id: 'ms-uiux-101', title: 'Prototype your web app', url: 'https://learn.microsoft.com/en-us/training/modules/prototype-your-web-app/', ecosystem: 'microsoft', tags: ['ui', 'ux', 'design'] },

    // Google ecosystem
    { id: 'gg-android-101', title: 'Android developer courses', url: 'https://developer.android.com/courses', ecosystem: 'google', tags: ['android'] },
    { id: 'gg-web-101', title: 'web.dev Learn (HTML/CSS/JS)', url: 'https://web.dev/learn', ecosystem: 'google', tags: ['html', 'css', 'javascript', 'js', 'web design', 'website'] },
    { id: 'gg-cloud-101', title: 'Google Cloud Skills Boost paths', url: 'https://www.cloudskillsboost.google/paths', ecosystem: 'google', tags: ['cloud'] },
    { id: 'gg-data-101', title: 'Data analytics learning path', url: 'https://www.cloudskillsboost.google/paths/16', ecosystem: 'google', tags: ['data', 'sql', 'database'] },
    { id: 'gg-ai-101', title: 'Machine learning learning path', url: 'https://www.cloudskillsboost.google/paths/118', ecosystem: 'google', tags: ['ai', 'machine learning', 'ml'] },

    // General / platform-agnostic
    { id: 'gen-web-101', title: 'freeCodeCamp: Responsive Web Design', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', ecosystem: 'general', tags: ['html', 'css', 'web design', 'website'] },
    { id: 'gen-js-101', title: 'freeCodeCamp: JavaScript Algorithms and Data Structures', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', ecosystem: 'general', tags: ['javascript', 'js'] },
    { id: 'gen-python-101', title: 'freeCodeCamp: Scientific Computing with Python', url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/', ecosystem: 'general', tags: ['python'] },
    { id: 'gen-data-101', title: 'freeCodeCamp: Relational Database', url: 'https://www.freecodecamp.org/learn/relational-database/', ecosystem: 'general', tags: ['data', 'sql', 'database'] },
    { id: 'gen-uiux-101', title: 'freeCodeCamp: Front End Development Libraries', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/', ecosystem: 'general', tags: ['ui', 'ux', 'design'] },
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