import styles from './Chronology.module.css';

const ENTRIES = [
  {
    year: '2026–Present',
    role: 'Lead Full-Stack AI Engineer',
    context: 'Forward Deployment · Multi-Tenant AI',
    description:
      'Owning roadmap-to-production across multiple client programs. Architecting shared LLM gateways, governed reporting agents, and Python microservices on AWS CDK. Delivering multi-tenant workflows that survive C-suite UAT.',
  },
  {
    year: '2026',
    role: 'AI Lead',
    context: 'Defense-Adjacent · Video Intelligence',
    description:
      'Architected an agentic video-intelligence platform over 24/7 CCTV using LangGraph and MCP, cutting analyst intervention by ~70%. Engineered Kafka ingestion for sub-200ms latency on air-gapped infrastructure.',
  },
  {
    year: '2025–2026',
    role: 'Senior AI Consultant',
    context: 'Finance & Healthcare',
    description:
      'Built stateful LangGraph finance workflows reducing manual touchpoints by 60%. Deployed multimodal clinical pipelines (QLoRA, hybrid RAG) on HIPAA-aware AWS, maintaining sub-800ms p95 latency.',
  },
  {
    year: '2025',
    role: 'Founding Engineer',
    context: 'Restaurant SaaS',
    description:
      'Validated demand forecasting across 200+ pilot sites using XGBoost and Prophet, reducing food waste by 32%. Scaled event-driven pipelines to process 2M+ events/day.',
  },
  {
    year: '2023–2025',
    role: 'Data Scientist II',
    context: 'Insurance · Document Intelligence',
    description:
      'Shipped document intelligence on AWS Bedrock (Claude, LayoutLMv3) achieving 95%+ extraction accuracy. Built ensemble underwriting models improving efficiency by 78%.',
  },
  {
    year: '2021–2023',
    role: 'MSc Artificial Intelligence',
    context: 'Lviv Polytechnic National University',
    description:
      "Graduated with Distinction (9.8/10). Master's thesis on Alzheimer's disease classification benchmarking 9 machine learning models on longitudinal biomarkers.",
  },
];

export function Chronology() {
  return (
    <ol className={styles.chronology} aria-label="Career chronology">
      {ENTRIES.map((entry) => (
        <li key={entry.year + entry.role} className={styles.entry}>
          <span className={styles.mark} aria-hidden="true" />
          <span className={styles.tie} aria-hidden="true" />
          <span className={styles.year}>{entry.year}</span>
          <h3 className={styles.role}>{entry.role}</h3>
          <span className={styles.context}>{entry.context}</span>
          <p className={styles.description}>{entry.description}</p>
        </li>
      ))}
    </ol>
  );
}
