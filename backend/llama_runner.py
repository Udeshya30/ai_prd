import logging
import os
from typing import Generator

from dotenv import load_dotenv
from llama_cpp import Llama

load_dotenv()

logger = logging.getLogger(__name__)

MODEL_PATH    = os.getenv("MODEL_PATH")
N_CTX         = int(os.getenv("MODEL_N_CTX",         "4096"))
N_GPU_LAYERS  = int(os.getenv("MODEL_N_GPU_LAYERS",  "0"))
N_THREADS     = int(os.getenv("MODEL_N_THREADS",     str(os.cpu_count() or 4)))

if not MODEL_PATH:
    raise ValueError("MODEL_PATH environment variable is not set")

logger.info(
    "Loading model from %s (n_ctx=%d, n_gpu_layers=%d, n_threads=%d)",
    MODEL_PATH, N_CTX, N_GPU_LAYERS, N_THREADS,
)
llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=N_CTX,
    n_gpu_layers=N_GPU_LAYERS,
    n_threads=N_THREADS,
    echo=False,
    verbose=False,
)
logger.info("Model loaded successfully")

# ---------------------------------------------------------------------------
# Fixed PRD sections — always generated, in this order
# (key, display title, max_tokens for that section)
# ---------------------------------------------------------------------------
PRD_SECTIONS: list[tuple[str, str, int]] = [
    ("executive_summary",   "Executive Summary",                         500),
    ("problem_statement",   "Problem Statement & Background",             650),
    ("target_users",        "Target Users & Personas",                  1100),
    ("goals_metrics",       "Goals & Success Metrics (KPIs)",            750),
    ("features",            "Key Features & Functional Requirements",   1100),
    ("tech_stack",          "Technology Stack",                          650),
    ("architecture",        "System Architecture Overview",              700),
    ("dev_phases",          "Development Phases & Timeline",            1100),
    ("milestones",          "Milestones & Deliverables",                 750),
    ("non_functional",      "Non-Functional Requirements",               700),
    ("risks",               "Risk Assessment & Mitigation",              750),
    ("out_of_scope",        "Out of Scope",                              550),
]

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
_THINKING_PROMPT = """\
You are a senior product manager and software architect. Analyze the project below \
and produce a structured analysis that will guide writing a complete PRD. Cover:
1. Recommended technology stack (frontend, backend, database, cloud, third-party APIs) with justifications
2. Realistic development phases and duration (in weeks) for each phase
3. Key milestones
4. Main risks and mitigation ideas
5. Measurable success metrics / KPIs

Project Name: {project_name}
Problem: {problem}
Key Features: {features}
Target Users: {users}
Goals: {goals}

Analysis:"""

_SECTION_INSTRUCTIONS: dict[str, str] = {
    "executive_summary":
        "Write a concise Objective using one short paragraph:\n"
        "**Overview:** One sentence describing the product.\n"
        "**Problem:** One sentence on the core problem.\n"
        "**Solution:** One sentence on the solution.\n"
        "**Target Audience:** Bullet list of user groups (max 5).\n"
        "**Key Benefits:** Bullet list of 4 specific benefits.\n"
        "**Expected Impact:** Bullet list of 3 measurable outcomes with numbers.",

    "problem_statement":
        "Write the Problem Statement & Background using bullets and short paragraphs — no walls of text:\n"
        "One short intro paragraph (2-3 sentences) only.\n"
        "**Current Pain Points:** Numbered list of 5-6 specific pain points.\n"
        "**Who Is Affected:** Bullet list of affected groups with one-line impact.\n"
        "**Why It Matters Now:** 2-3 bullet points on urgency/market timing.\n"
        "**Cost of Inaction:** Bullet list of 3-4 business consequences.",

    "target_users":
        "Write Target Users & Personas. For EACH of exactly 3 personas use this format:\n"
        "### Persona N: [Job Title]\n"
        "| Field | Detail |\n|---|---|\n| Name | ... |\n| Age | ... |\n| Location | ... |\n| Role | ... |\n\n"
        "- **Goals:** 3 bullet points\n"
        "- **Pain Points:** 3 bullet points\n"
        "- **How This Helps:** 3 bullet points\n"
        "Keep each persona concise. Finish all 3 personas completely.",

    "goals_metrics":
        "Write Goals & KPIs ONLY as markdown tables — no paragraphs.\n\n"
        "### Business Goals\n"
        "| Goal | KPI | Target Value | How Measured |\n|---|---|---|---|\n"
        "Add 4-5 rows.\n\n"
        "### User Goals\n"
        "| Goal | KPI | Target Value | How Measured |\n|---|---|---|---|\n"
        "Add 3-4 rows.",

    "features":
        "Write Key Features using this repeating structure for each feature:\n"
        "### [Feature Name] `[Must Have / Should Have / Nice to Have]`\n"
        "- **User Story:** As a [role], I want [action] so that [benefit].\n"
        "- **Acceptance Criteria:**\n"
        "  - [ ] Criterion 1\n"
        "  - [ ] Criterion 2\n"
        "  - [ ] Criterion 3\n"
        "---\n"
        "Cover 5-6 features. Use bullet points only — no prose paragraphs.",

    "tech_stack":
        "Write the Technology Stack as a SINGLE markdown table only — no prose paragraphs:\n"
        "| Component | Technology | Version | Justification |\n|---|---|---|---|\n"
        "Include these rows: Frontend Framework, State Management, Real-time, "
        "Backend Framework, Primary Database, Cache, Authentication, File Storage, "
        "Cloud/Hosting, CI/CD, Monitoring & Logging, Local LLM (if applicable).\n"
        "Justification: max one short sentence per row.",

    "architecture":
        "Write System Architecture Overview using structured sections — no long paragraphs:\n"
        "**Architecture Style:** [one line: microservices/monolith/serverless + reason]\n\n"
        "**Key Components:**\n"
        "| Component | Responsibility |\n|---|---|\n[6-8 rows]\n\n"
        "**API Design:** 3 bullet points (style, auth, format).\n\n"
        "**Data Flow:** Numbered steps (max 6).\n\n"
        "**Third-party Integrations:**\n"
        "| Service | Purpose | Method |\n|---|---|---|\n[4-6 rows]",

    "dev_phases":
        "Write Development Phases & Timeline. For EACH phase use this structure:\n"
        "### Phase N: [Name] — Weeks W1 to WX\n"
        "| Item | Detail |\n|---|---|\n"
        "| Objectives | bullet list in cell |\n"
        "| Deliverables | bullet list in cell |\n"
        "| Team | roles |\n"
        "| Duration | X weeks |\n\n"
        "Include 4-5 phases. At the end add:\n"
        "### Cumulative Timeline\n"
        "| Phase | Start Week | End Week | Key Milestone |\n|---|---|---|---|\n",

    "milestones":
        "Write Milestones & Deliverables as a single markdown table — nothing else:\n"
        "| # | Milestone | Target Week | Deliverables | Success Criteria | Owner |\n"
        "|---|---|---|---|---|---|\n"
        "List 8-10 milestones spanning the full project. Be specific and concise per cell.",

    "non_functional":
        "Write Non-Functional Requirements as grouped tables — no prose:\n\n"
        "### Performance\n| Metric | Requirement |\n|---|---|\n[4+ rows]\n\n"
        "### Security\n| Requirement | Standard / Method |\n|---|---|\n[4+ rows]\n\n"
        "### Scalability\n| Metric | Target |\n|---|---|\n[3+ rows]\n\n"
        "### Availability\n| Metric | Target |\n|---|---|\n[2+ rows]\n\n"
        "### Accessibility\n| Standard | Level |\n|---|---|\n[2+ rows]",

    "risks":
        "Write Risk Assessment as a single markdown table — no prose:\n"
        "| # | Risk | Probability | Impact | Score | Mitigation Strategy |\n"
        "|---|---|---|---|---|---|\n"
        "List 6+ risks. Probability/Impact = H/M/L. Score = H×H=9, H×M=6, M×M=4, M×L=2, L×L=1."
        " Keep Mitigation concise (one sentence).",

    "out_of_scope":
        "Write Out of Scope using two tables — no prose paragraphs:\n\n"
        "### Excluded From This Release\n"
        "| Feature / Capability | Reason | Planned For |\n|---|---|---|\n"
        "List 6-8 items.\n\n"
        "### Assumptions\n"
        "| # | Assumption |\n|---|---|\n"
        "List 4-5 planning assumptions.",
}


def _build_thinking_prompt(project_name, problem, features, users, goals) -> str:
    return _THINKING_PROMPT.format(
        project_name=project_name, problem=problem,
        features=features, users=users, goals=goals,
    )


def _build_section_prompt(
    key: str, title: str,
    project_name: str, problem: str, features: str, users: str, goals: str,
    thinking: str,
) -> str:
    return (
        f"Project: {project_name}\n"
        f"Problem: {problem}\n"
        f"Features: {features}\n"
        f"Users: {users}\n"
        f"Goals: {goals}\n\n"
        f"Project Analysis (use this as context):\n{thinking}\n\n"
        f"Task: {_SECTION_INSTRUCTIONS[key]}\n\n"
        f"## {title}\n\n"
    )


# ---------------------------------------------------------------------------
# Single-call API (kept for /generate-prd non-streaming)
# ---------------------------------------------------------------------------
def generate_prd(prompt: str, max_tokens: int = 3500) -> str:
    output = llm(prompt, max_tokens=max_tokens, stop=["</s>"], echo=False)
    return output["choices"][0]["text"].strip()


# ---------------------------------------------------------------------------
# Orchestrated multi-call streaming
# ---------------------------------------------------------------------------
def stream_thinking(
    project_name: str, problem: str, features: str, users: str, goals: str,
) -> Generator[str, None, None]:
    prompt = _build_thinking_prompt(project_name, problem, features, users, goals)
    for chunk in llm(prompt, max_tokens=3500, stop=["</s>"], echo=False, stream=True):
        token = chunk["choices"][0]["text"]
        if token:
            yield token


def stream_section(
    key: str, title: str,
    project_name: str, problem: str, features: str, users: str, goals: str,
    thinking: str, max_tokens: int,
) -> Generator[str, None, None]:
    prompt = _build_section_prompt(key, title, project_name, problem, features, users, goals, thinking)
    for chunk in llm(prompt, max_tokens=max_tokens, stop=["</s>"], echo=False, stream=True):
        token = chunk["choices"][0]["text"]
        if token:
            yield token

