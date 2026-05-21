# Context Architecture for Enterprise Agentic Software Delivery

**A strategic Domain-Driven Design operating model for bounded agents, durable knowledge, and human accountability.**

<p class="publication-meta"><a href="https://www.linkedin.com/in/david-verholen-14aa23aa/">David Verholen</a> | Public release v1.0.0 | May 17, 2026</p>

<section class="contents-page" aria-labelledby="contents-heading">
  <h2 id="contents-heading">Contents</h2>
  <ol class="contents-list">
    <li><span class="contents-number">01</span><a href="#chapter-01-preamble-and-thesis">Preamble and Thesis</a></li>
    <li><span class="contents-number">02</span><a href="#chapter-02-enterprise-software-is-organizational-knowledge-made-executable">Enterprise Software Is Organizational Knowledge Made Executable</a></li>
    <li><span class="contents-number">03</span><a href="#chapter-03-context-windows-are-capacity-not-architecture">Context Windows Are Capacity, Not Architecture</a></li>
    <li><span class="contents-number">04</span><a href="#chapter-04-minimum-needed-context-is-the-operating-principle">Minimum Needed Context Is the Operating Principle</a></li>
    <li><span class="contents-number">05</span><a href="#chapter-05-knowledge-must-compound">Knowledge Must Compound</a></li>
    <li><span class="contents-number">06</span><a href="#chapter-06-boundaries-need-handoff-protocols">Boundaries Need Handoff Protocols</a></li>
    <li><span class="contents-number">07</span><a href="#chapter-07-learning-across-domains-needs-routing">Learning Across Domains Needs Routing</a></li>
    <li><span class="contents-number">08</span><a href="#chapter-08-review-must-check-responsibility-boundaries">Review Must Check Responsibility Boundaries</a></li>
    <li><span class="contents-number">09</span><a href="#chapter-09-governance-must-define-decision-rights">Governance Must Define Decision Rights</a></li>
    <li><span class="contents-number">10</span><a href="#chapter-10-start-with-one-bounded-context">Start With One Bounded Context</a></li>
    <li><span class="contents-number">11</span><a href="#chapter-11-closing-thesis-and-next-questions">Closing Thesis and Next Questions</a></li>
  </ol>
</section>

<section class="model-page" aria-labelledby="model-heading">
  <h2 id="model-heading">Model Overview</h2>
  <ul class="model-summary">
    <li>Context architecture combines a boundary model with an operating model.</li>
    <li>Strategic Domain-Driven Design (DDD) defines where domain language and model boundaries are valid.</li>
    <li>The operating model keeps agentic work trustworthy as the company changes.</li>
  </ul>
  <div class="model-orientation">
    <p><strong>Enterprise premise:</strong> Enterprise software is organizational knowledge made executable. Agentic work needs the right knowledge and the ownership rules that make its use legitimate.</p>
    <p><strong>Bounded meaning:</strong> Bounded contexts define where domain language is valid, which sources are authoritative, and which context owns a decision.</p>
    <p><strong>Minimum needed context:</strong> Context selection gives the agent enough to act safely inside a responsibility realm while keeping unrelated language, stale memory, and missing authority out of scope.</p>
    <p><strong>Durable memory:</strong> Corrections, incidents, decisions, and examples become useful only when they are curated, owned, scoped, reviewed, and kept current.</p>
    <p><strong>Boundary crossing:</strong> Handoffs let work move between contexts without stealing ownership: the receiving context answers the question, accepts the obligation, or returns constraints.</p>
    <p><strong>Review and governance:</strong> Review checks the responsibility path as well as the artifact; governance defines who may decide, approve, accept risk, create exceptions, or change the operating model.</p>
    <p><strong>Human accountability:</strong> Agents may draft, analyze, recommend, or execute bounded work, but people remain accountable for intent, risk, exceptions, incidents, and durable knowledge.</p>
    <p><strong>First move:</strong> Start with one bounded context and one recurring agentic work pattern, then expand only after ownership, sources, stop conditions, handoffs, review, and decision rights are explicit.</p>
  </div>
</section>

# Chapter 01: Preamble and Thesis

<p class="chapter-dek">A simple agentic coding loop can work in small contexts, but it breaks down when enterprise scale adds multiple meanings, owners, risks, and authority paths.</p>

## 1.1 The Moment the Demo Breaks

Most agentic coding systems begin with a simple loop:

<figure class="diagram" id="ch01-demo-loop" data-figure-id="ch01-demo-loop">
  <img src="figures/ch01-demo-loop.svg" alt="Show the baseline agentic coding loop before enterprise context, ownership, and risk enter." />
  <figcaption>A simple agentic coding loop can work when task scope, context, ownership, and risk stay local.</figcaption>
</figure>

That structure can work when the product language is shared, the codebase is small, the consequences are local, and the relevant context is small enough to fit inside a ticket. The agent only needs to understand the task, the nearby code, and the expected output.

In a complex enterprise context, even a small product change, such as letting external collaborators access a workspace, can cross product intent, security interpretation, tenant boundaries, compliance expectations, and customer data protection before it becomes code.

<div class="example-note">
<p><strong>Recurring example.</strong> The fictional external-collaborator access scenario is deliberately ordinary: Product owns the feature intent, Platform owns tenancy and runtime implications, Security owns access and risk constraints, and shared memory preserves reusable lessons without taking those decisions away from their owners.</p>
</div>

A company is already a large sociotechnical system: people, teams, tools, processes, knowledge, incentives, governance, and feedback loops working together. Adding agents changes which parts of that system must be made explicit so agents can act safely.

Correct enterprise code depends on more than the specification: product language, ownership, policy, architecture, risk, and past decisions all shape what correct code means.

That shift is the context architecture problem: agents need enough organizational context to act safely without turning the company into one giant prompt. In practical terms, this means safer commitments, fewer wrong-owner decisions, less review churn, stronger auditability, and more trust that agentic work follows the right authority path.

Selecting context is also selecting an authority path: which language applies, which sources can be trusted, which owner may decide, and where uncertainty must escalate.

Domain-Driven Design (DDD) already describes how domain language and model boundaries can be made explicit. A supporting operating model keeps those boundaries current through memory, handoffs, review, governance, and feedback, turning change into governed learning instead of uncontrolled drift.

## 1.2 Enterprise Software Carries Organizational Knowledge

Enterprise software is the executable form of many layers of organizational knowledge:

- strategic intent
- customer and user needs
- legal and compliance constraints
- domain language
- architecture decisions
- operating experience
- incident learnings
- accumulated product know-how

The running product is the visible part of the company's knowledge. Much of the knowledge that shaped it still lives outside the code, scattered across people, documents, meetings, tickets, reviews, architecture decisions, incidents, and source code.

That knowledge is engineering input required to build the product correctly.

Agentic software delivery becomes hard when that knowledge is invisible to the work, and it becomes brittle when the answer is to treat everything as one large context pile.

In a large company, that pile also includes enterprise architecture: capabilities, value streams, application landscapes, data ownership, platform constraints, and governance records. Those maps help place bounded contexts inside the larger company system.

## 1.3 More Context Is Not Automatically Better Context

The easiest reaction to agent failure is to give the agent more files, tickets, architecture notes, domain docs, examples, logs, and instructions. More context can help when a requirement is missing, but enterprise context grows in relationship complexity as well as size.

The same word can mean different things in different domains. A local exception can look like a global rule. An old incident note can conflict with a newer policy. A code example can be technically useful and semantically obsolete. An agent can see all of that and still miss which domain owns the interpretation needed for the current task.

## 1.4 Why Agents Fail in Implicit Architecture

People-led teams can operate with partial specifications because people bring interpretation with them: social memory, informal ownership rules, political context, caution from past incidents, and the ability to ask another person when meaning is unclear.

They also repair weak processes informally. A reviewer notices repeated misunderstanding. A senior engineer remembers who knows the old system. A manager sees that a handoff keeps failing. A team adjusts a norm before it becomes a written process.

Agents operate through the context, tools, instructions, encoded boundaries, and review gates they are given. They fail where people can often compensate.

Context architecture defines where judgment belongs: who owns meaning, who may accept risk, when uncertainty stops work, and how repeated gaps become learning.

When a developer is unsure who owns a term, they may ask a teammate. When an agent is unsure, it may still produce a plausible answer. When a reviewer remembers that a decision was local, they may stop it from becoming policy. When an agent sees the same decision in a wiki page without ownership metadata, it may treat it as global truth.

The agentic problem is making the social and architectural structure around enterprise software explicit enough that agents can work inside it without collapsing boundaries. It also means making the improvement loops visible enough that weak context, weak handoffs, weak reviews, and stale memory can be corrected before they become normal.

## 1.5 What This Whitepaper Covers

This whitepaper is about context architecture for enterprise agentic software delivery: how agents can work inside large software organizations where context, ownership, domain language, memory, review, governance, and accountability all matter.

Context architecture composes DDD, enterprise architecture, governance, and platform engineering for agentic work: DDD makes domain language and model boundaries explicit, enterprise architecture places those boundaries inside the company system, governance defines authority, and a supporting operating model keeps them current through memory, handoffs, review, and feedback.

That scope separates context architecture from agent runtime architecture. Runtime architecture is concerned with how agents plan, retrieve, call tools, coordinate, remember, evaluate, and execute.

Context architecture is concerned with the organizational and semantic commitments that make execution legitimate: which domain language applies, which sources are authoritative, which owner may decide, which boundaries require handoff, and which evidence must survive review. Runtime choices can later make those commitments executable and observable.

The reason this matters is practical: agents cannot work autonomously in an enterprise context if people do not trust what they will do when context is unclear. That mistrust shows up as coordination waste: teams rediscover decisions, repeat explanations, reverse cross-domain work, catch boundary mistakes late, and slow adoption.

Adjacent enterprise concerns such as data access, security, compliance, enterprise architecture, evaluation, cost, and adoption matter to this argument only when they shape context, authority, memory, review, or accountability. The central question remains narrower: how can agents work inside a large sociotechnical software system without collapsing meaning, ownership, memory, review, and accountability into one unstructured context pile?

## 1.6 Why DDD Matters for Agents

In a small context, Domain-Driven Design can feel like overhead. In a large context, where several domains use different language, own different decisions, and evolve at different speeds, that overhead becomes useful structure. It keeps meaning from collapsing.

DDD already gives large software organizations a structure for this. Established strategic DDD concepts can become operating constraints for agentic delivery, using language from Eric Evans's [Domain-Driven Design Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) and Martin Fowler's concise explanations of [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html) and [Ubiquitous Language](https://martinfowler.com/bliki/UbiquitousLanguage.html).

| DDD Idea | What It Protects | Agentic Delivery Use |
| --- | --- | --- |
| Bounded Context | Where meaning is local | Rules for agent operating scope |
| Ubiquitous Language | Which words are authoritative | Domain-owned vocabulary |
| Context Map | How domains relate | Known handoff routes |
| Published Language | How domains communicate safely | Handoff vocabulary |
| Anti-Corruption Layer | How one model is protected from another | Translation and boundary checks |

People and agents both benefit from limited context inside a clear responsibility realm. A bounded context is a boundary of language and model. It may line up with a team, repository, service, wiki area, or agent scope, but those implementation choices should follow the context boundary.

In an agentic system, DDD stops being only a human modeling discipline and becomes part of the working environment: boundaries, language, ownership, handoffs, memory, review, and decision rights become things agents can be instructed by, checked against, and stopped by.

Operating-model artifacts such as Architecture Decision Records (ADRs), retrospectives, root cause analyses (RCAs), review notes, and governance records preserve decisions, learn from failures, and keep boundary rules current as the company changes.

## 1.7 The Operating Principle

The operating principle is minimum needed context: each agent receives enough context to act safely while differences between domains remain explicit, owned, and safely translated.

That requires more than a prompt. Domains must own their language; agent operating scopes must follow bounded-context rules; security, compliance, and data-access boundaries must shape context selection; cross-domain work must move through explicit handoffs; durable knowledge must be curated; and review, governance, evaluation, and improvement loops must keep agents bounded over time.

Even as agents take on more planning, coding, review, analysis, and documentation work, humans remain accountable for intent, risk, exceptions, and durable knowledge.

## 1.8 The Core Idea

<figure class="diagram" id="ch01-context-architecture-loop" data-figure-id="ch01-context-architecture-loop">
  <img src="figures/ch01-context-architecture-loop.svg" alt="Summarize the full argument as a knowledge-to-software feedback loop." />
  <figcaption>Context architecture connects bounded meaning, handoffs, review, governance, and curated memory into one operating model.</figcaption>
</figure>

Enterprise software starts as scattered knowledge and becomes valuable when it is converted into running structure. Agents can help with that conversion when the system tells them which context they are in, which language is authoritative, which decisions are owned elsewhere, and how learning becomes memory.

<div class="chapter-break"></div>

# Chapter 02: Enterprise Software Is Organizational Knowledge Made Executable

<p class="chapter-dek">Agentic delivery depends on knowing which scattered knowledge is authoritative, owned, current, and safe to turn into software.</p>

## 2.1 The Starting Point

Enterprise product building begins in a messy place. Some knowledge lives in the founder's vision. Some lives in customer conversations. Some lives in domain experts, legal constraints, sales promises, architecture diagrams, incident scars, old tickets, and code that nobody fully remembers writing. Some of it is explicit. Much of it is tacit: known through experience, but not written down clearly. A surprising amount of it is contradictory.

The running product is different. It is explicit enough to execute. It contains data structures, workflows, permissions, APIs, tests, deployment rules, and user-facing behavior. It is organizational knowledge transformed into a machine-operable structure.

That transformation is the real work of software engineering.

## 2.2 The Work Is Conversion

Enterprise agentic engineering runs into trouble when it treats organizational knowledge as raw prompt material. A larger prompt can hold more text while leaving contradictions unresolved, ownership unnamed, rationale unpreserved, and domain language ambiguous.

Knowledge-management research distinguishes tacit and explicit knowledge, and architecture-knowledge work on [architectural knowledge vaporization](https://www.cs.rug.nl/~paris/papers/EPLOP09.pdf) points to the same concern: knowledge only helps when it is converted, preserved, and usable.

The central work is conversion:

<figure class="diagram" id="ch02-knowledge-conversion" data-figure-id="ch02-knowledge-conversion">
  <img src="figures/ch02-knowledge-conversion.svg" alt="Show software delivery as conversion from scattered knowledge into executable product structure." />
  <figcaption>Software delivery converts scattered organizational knowledge into executable product structure.</figcaption>
</figure>

## 2.3 The Knowledge Conversion Chain

A product rarely moves directly from idea to implementation. In an enterprise context, the path usually looks more like this:

<figure class="diagram" id="ch02-enterprise-conversion-chain" data-figure-id="ch02-enterprise-conversion-chain">
  <img src="figures/ch02-enterprise-conversion-chain.svg" alt="Show how broad organizational intent narrows into running software and routes feedback back to the level it can change." />
  <figcaption>Enterprise conversion needs level, authority, and ownership metadata from intent through running software.</figcaption>
</figure>

Each step narrows ambiguity. Strategy turns vision into priorities. Business requirements and constraints may enter alongside that strategy, carrying product, operational, legal, commercial, and customer needs that the architecture still has to place into the company system.

Enterprise architecture turns priorities and requirements into capabilities, value streams, application landscape, data ownership, platform constraints, governance context, and architecture records. Domain architecture turns that company map into bounded language and responsibility.

Solution architecture turns domain needs into implementable systems. Software architecture turns systems into code, contracts, deployment paths, and runtime behavior.

Agents can help at each step. When the structure is missing, the agent has to infer it from whatever text happens to be present. That is where plausible but wrong output comes from.

A human architect may recognize that a strategy note, a platform constraint, and a customer promise live at different levels of authority. An agent sees all three as text unless the system marks scope, ownership, and decision status explicitly.

Enterprise architecture matters here because it provides the surrounding map for bounded contexts: which capabilities they support, which systems they touch, which data they own or consume, which platform constraints apply, and which governance records already exist.

## 2.4 The Entropy Metaphor

The entropy analogy is useful as a metaphor: useful order does not maintain itself for free. In large sociotechnical systems, organizational knowledge tends to scatter, go stale, and drift unless work is applied to keep it usable.

Enterprise product knowledge behaves similarly enough for the metaphor to help. A company may have plenty of information and still lack usable product-building knowledge. It might be scattered across people, documents, meetings, chat history, incident reports, and code. To become useful product structure, that information has to be clarified, connected, owned, and encoded.

Useful product structure does not spontaneously emerge from scattered organizational information. Someone has to make tacit knowledge explicit, resolve contradictions, decide ownership, encode domain language, and preserve rationale.

The opposite movement happens naturally. If no work is applied, knowledge drift sets in: rationale vaporizes, terminology drifts, architectural decisions become folklore, and technical debt accumulates. The organization still has information, but less of it is usable as precise product-building knowledge.

Processes drift in the same way. A handoff that once carried the right information may become too thin after the domain changes. A review rule may miss a new class of boundary violation. An escalation path may point to the wrong owner after a reorganization. In human companies, people often patch these gaps informally. In an agentic system, those patches need to become explicit feedback loops.

For agentic engineering, the central question is how to convert scattered information into the right explicit structure, at the right boundary, with the right owner.

## 2.5 Why DDD Enters the Story

Domain-Driven Design is valuable here because it is already a discipline for converting business meaning into software structure at scale.

DDD builds on decades of practice and scholarship around domain modeling, software architecture, and the hard work of translating business meaning into running systems.

DDD gives the boundary and language part of this conversion process a shape:

- Bounded Contexts decide where meaning is local.
- Ubiquitous Language turns domain understanding into explicit vocabulary.
- Domain Models encode meaningful business structure.
- Context Maps show how domains relate.
- Published Language defines safe cross-boundary communication.

Operating-model artifacts such as ADRs preserve why important decisions were made around that model.

For human teams, these ideas prevent one large organization from pretending it has one perfectly shared model. For enterprise agentic systems, the same ideas prevent one large prompt from pretending it has one perfectly shared context.

That is why DDD also matters for agents. It remains a way for people to talk about the domain, and it becomes a way to package executable meaning for agents that lack the organization's tacit memory.

## 2.6 What Agents Need From This

An agent needs more than a pile of enterprise information and an instruction to "figure it out." It needs to operate inside an explicit knowledge conversion architecture.

That architecture needs to answer:

- Which domain owns this language?
- Which knowledge is authoritative for this task?
- Which capability, system, data owner, or platform constraint frames the work?
- Which decisions are already settled?
- Which assumptions require a handoff?
- Where should new learning be stored after the work?

Without those answers, agentic delivery becomes a loop of local generation and global forgetting.

When those answers are missing, adding more context is tempting. The next chapter separates context capacity from context architecture.

<div class="chapter-break"></div>

# Chapter 03: Context Windows Are Capacity, Not Architecture

<p class="chapter-dek">Larger context windows increase what an agent can see, but reliable use still depends on selection, ownership, and interpretation.</p>

## 3.1 The Context Window Temptation

Language models keep getting larger context windows. That helps: a larger window can hold more files, tickets, notes, examples, and logs at once.

When an agent makes a bad decision, the obvious diagnosis is often that it did not have enough context. Sometimes that is true. The agent lacked a requirement, missed a constraint, or never saw the architecture decision that would have changed its answer.

In enterprise systems, the opposite is often true at the same time. The agent knows too much and too little. It sees many artifacts, but it lacks the boundary that tells it which artifacts are authoritative for this task. It sees many terms, but not which domain owns their meaning. It sees many examples, but not which examples are obsolete, local, or intentionally exceptional.

The failure mode is unstructured information.

Context length is capacity. Context architecture is selection, ownership, and interpretation.

## 3.2 Coordination Complexity Grows Faster Than Context

In human organizations, coordination complexity grows quickly as the number of participants increases. Pairwise communication lines are one concrete proxy for that complexity. They grow as `n * (n - 1) / 2`.

<figure class="diagram" id="ch03-communication-line-growth" data-figure-id="ch03-communication-line-growth">
  <img src="figures/ch03-communication-line-growth.svg" alt="Make pairwise coordination growth visible with 2, 3, and 8 actors." />
  <figcaption>Coordination relationships grow quickly enough that more context capacity still needs structure.</figcaption>
</figure>

This quadratic growth is already enough for coordination complexity to dominate execution. It is one useful warning for enterprise complexity: adding participants adds relationships as well as work.

Something similar happens with context. Raw context length grows by adding documents. The possible relationships inside that context can grow much faster, across terms, decisions, constraints, teams, histories, and assumptions. It becomes hard when the system cannot tell which relationships matter for the current work.

## 3.3 The Global Context Trap

One global context looks convenient. It seems to avoid handoffs. It seems to let the agent reason about the whole system.

A global context creates a dense graph of possible meanings:

<figure class="diagram" id="ch03-global-context-trap" data-figure-id="ch03-global-context-trap">
  <img src="figures/ch03-global-context-trap.svg" alt="Show one global context as a dense graph of mixed meanings." />
  <figcaption>A large shared context can expose many artifacts without identifying which meaning is authoritative.</figcaption>
</figure>

The agent may produce an answer that is coherent inside one part of the graph and wrong inside another. It may import a platform constraint into product language, treat a local exception as a global rule, or combine terms that look compatible but belong to different bounded contexts.

Seeing a file is different from knowing which meaning is authoritative.

In enterprise settings, the graph also includes access rights, compliance rules, data ownership, and platform constraints. A larger context window can make those visible, while permission and authority still need their own rules.

In the external-collaborator access scenario, an agent may see `account`, `workspace`, `tenant`, `admin`, and `collaborator` in the same context window. Familiar words can carry different authority in different places. Product may own the customer-facing meaning of `workspace`; Platform may own the tenancy implications; Security may own what an access grant permits.

## 3.4 From Global Context to Owned Context

DDD gives the organization a way to say where a model is true.

A bounded context says: inside this semantic and model boundary, terms have a specific meaning, models have a specific owner, and decisions have a specific authority.

In an agentic setup, bounded-context rules can define an operating scope for agents: a defined space with its own language, artifacts, memory, and authority. Alignments among bounded context, team, repository, service, wiki area, and agent have to be explicit. The purpose is to make most reasoning local and make cross-context reasoning explicit.

The handoff in the diagram below is a controlled exchange between two owned meaning spaces. Product owns customer language, feature intent, and acceptance meaning. Platform owns runtime constraints, operational policy, and deployment meaning. When work crosses that boundary, the exchange should be explicit.

<figure class="diagram" id="ch03-bounded-context-handoff" data-figure-id="ch03-bounded-context-handoff">
  <img src="figures/ch03-bounded-context-handoff.svg" alt="Show bounded contexts connected by explicit handoffs instead of shared global context." />
  <figcaption>Owned contexts keep meaning local and use explicit handoffs when work crosses a boundary.</figcaption>
</figure>

The Product context can ask Platform for a decision, constraint, or interpretation, but the handoff should not silently transfer Platform meaning into Product ownership. The response carries the relevant Platform answer back without collapsing the two models into one global context.

## 3.5 What Boundary Rules Give Agents

People can sometimes compensate for fuzzy boundaries through conversation, memory, and social context. Agents lack reliable ambient organizational awareness, so they need the boundary to be explicit.

An agent should know:

- which context it is acting inside
- which language applies there
- which artifacts are authoritative there
- which neighboring contexts it may not silently modify
- when it must ask for a handoff

Many bounded agents can cooperate without collapsing their models into one another.

This is the agentic contribution: bounded-context rules become operating constraints as well as design documentation. An agent should be able to tell when it is inside Product language, when it has crossed into Platform meaning, and when Security must decide.

The alternative to global context is selected context. The next chapter turns that into an operating principle for giving agents enough context without collapsing the boundaries that make it safe to use.

<div class="chapter-break"></div>

# Chapter 04: Minimum Needed Context Is the Operating Principle

<p class="chapter-dek">Minimum needed context is selected context: precise enough, authoritative enough, and bounded enough for safe action.</p>

## 4.1 The False Choice

After rejecting one giant context, it is tempting to swing too far in the other direction.

If too much context contaminates decisions, maybe the answer is to keep prompts tiny. But tiny prompts create their own failure mode: local correctness without enough authority. An agent can make a clean decision inside an artificially small frame and still violate a constraint that lived just outside it.

So the operating principle is not "less context." It is "minimum needed context": explicitly selected context that gives the agent enough information to act safely, but not so much unrelated information that it starts mixing models, languages, or authorities.

## 4.2 Context Selection Model

<figure class="diagram" id="ch04-context-selection-model" data-figure-id="ch04-context-selection-model">
  <img src="figures/ch04-context-selection-model.svg" alt="Distinguish required, optional, forbidden, and missing-authority context." />
  <figcaption>Minimum needed context selects what the agent may use, what is optional, what is forbidden, and where authority is missing.</figcaption>
</figure>

The model is deliberately simple because context selection is part of the authority model. By choosing what context may enter the work, the organization is also deciding which language applies, which sources may be trusted, which actions are allowed, which owner can decide, and where uncertainty must escalate.

A useful first move is to classify context for each task:

- Required context: the agent needs it before acting.
- Allowed optional context: the agent may inspect it if needed.
- Forbidden context: the agent is not allowed to use it because it belongs to another owner, another abstraction level, a conflicting model, or an access boundary it is not authorized to cross.
- Missing authority: the agent stops and requests a handoff.

When categories conflict, the selection rules need precedence beyond relevance:

- Access boundaries beat relevance.
- The owning context beats caller convenience.
- Source-of-truth records beat examples.
- Stale or unknown status blocks authority.
- Cross-context interpretation requires a handoff.
- Local exceptions do not become global policy without curation.

For human teams, this classification is often implicit. People learn what to ignore, who to ask, and which documents are current. For agents, that implicit filtering has to become part of the work system. Otherwise, the agent may treat irrelevant context as evidence, local context as global policy, or missing authority as permission to continue.

Security and compliance are part of the selection problem. They help define what may be selected.

Some information is required because risk cannot be assessed without it. Some is forbidden because the agent has no authority to inspect or use it. Some is relevant but has to arrive through a handoff from the owning context.

The same applies to tools and credentials: a capability may be technically reachable and still outside the agent's delegated authority for this task.

## 4.3 Attention, Filtering, and Language Models

The broader pattern is familiar from work on information overload and decision-making: more available information does not automatically produce better decisions. Decision quality depends on attention, filtering, and the ability to process relevant information under constraints.

Long-context large language model (LLM) research adds a practical warning. Larger windows do not guarantee reliable use of relevant information. Work such as [Lost in the Middle](https://arxiv.org/abs/2307.03172) shows that important details may be underused depending on position, length, and surrounding noise; [Large Language Models Can Be Easily Distracted by Irrelevant Context](https://arxiv.org/abs/2302.00093) shows a related risk from irrelevant material. Retrieval can hurt when retrieved material is not filtered well.

Long context is capacity, not governance.

Access is also not authority. A system can make information available and still not make it appropriate for the agent to use.

## 4.4 The Three Context Failures

Minimum needed context helps distinguish three different failures:

1. Missing context: the agent did not have information required for a safe decision.
2. Context contamination: the agent used information from the wrong domain, abstraction level, time period, or authority path.
3. Ambiguous authority: the agent saw relevant information but did not know which source owned the decision.

These failures require different responses. Missing context needs retrieval or handoff. Context contamination needs boundary protection. Ambiguous authority needs ownership metadata and escalation when the owner is unclear.

## 4.5 What Agents Need to Know Before Acting

An agent responsibility model needs to answer:

- What problem is this agent allowed to solve?
- Which domain language should it use?
- Which documents are authoritative?
- Which documents are examples only?
- Which data, policies, or records may it inspect?
- Which neighboring domains must approve changes?
- Which security or compliance constraints require escalation?
- Which signs mean the agent must stop and hand off?

Here DDD becomes operational. Bounded contexts become context selection rules for agents.

In an agentic setup, those rules need to be concrete enough to drive behavior: what the agent loads, what it may retrieve, what it ignores, and what forces escalation. Minimum needed context is a responsibility model.

Good context selection is not the end of the operating model. Agentic work creates new information: decisions, corrections, examples, incidents, review feedback, and better language. If that information stays in chat history, it does not compound.

That is the memory problem: useful agentic learning needs somewhere governed to go.

<div class="chapter-break"></div>

# Chapter 05: Knowledge Must Compound

<p class="chapter-dek">Useful learning signals become trustworthy memory when they are curated, owned, scoped, and kept current.</p>

## 5.1 The Session Memory Problem

Agentic work produces useful knowledge all the time.

An agent learns that a term was misleading. A reviewer explains why a change violated a domain boundary. A platform constraint forces a product decision to be rephrased. An incident reveals that a previously reasonable assumption is unsafe. A retrospective uncovers a recurring coordination failure.

An evaluation run may show the same boundary failure repeating. A security review may clarify that a piece of context was relevant but not available for that agent to use.

If those lessons remain in chat history, the system does not learn. The next session has to rediscover them from raw material.

## 5.2 Memory Needs Curation

Retrieval-augmented generation (RAG) alone is not organizational memory. Knowledge needs curation into a durable wiki.

Retrieval can find documents. Memory requires curation, ownership, linking, versioning, and review.

Durable memory answers one part of the learning problem: where a judged lesson lives so future work can trust it. Boundary exchanges and operating-model changes need their own mechanisms, but selected knowledge needs a maintained place to persist.

Based on [Andrej Karpathy's LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), an LLM wiki is a persistent, editable knowledge base that compounds what an LLM and its human collaborators have learned. This whitepaper adapts that idea to enterprise context architecture, where ownership, boundaries, and decision rights matter as much as retrieval.

## 5.3 The Memory Promotion Loop

<figure class="diagram" id="ch05-llm-wiki-loop" data-figure-id="ch05-llm-wiki-loop">
  <img src="figures/ch05-llm-wiki-loop.svg" alt="Show how useful signals become reviewed, durable memory." />
  <figcaption>Useful signals become durable memory only after curation, ownership, and review.</figcaption>
</figure>

The curated update is the key move. Not every observation deserves to become durable knowledge. Not every local decision deserves to become global policy. The wiki has to make knowledge reusable without erasing origin or ownership.

Logs, traces, review outcomes, evaluation results, and incident timelines are not memory by themselves. They are signals. They become organizational memory only when someone decides what the signal means, which owner is responsible, and whether the lesson is local or shared.

A wiki that only grows can still decay. Durable memory needs upkeep loops: review stale pages, retire decisions that no longer hold, narrow lessons that were generalized too far, resolve conflicts, check ownership, and refresh examples after incidents or policy changes.

If agents repeatedly retrieve the wrong page, cite an obsolete example, or treat a local exception as global policy, the pattern signals a memory upkeep problem and possibly a downstream process repair.

This is knowledge drift: the content still exists, but its authority, scope, owner, or freshness no longer matches reality.

Authority drift is the related governance failure: a local exception, stale page, repeated practice, or shared note starts being treated as permission or policy even though the owning authority never changed the rule. In an agentic system, that can happen quietly because remembered text can be reused as future instruction unless memory preserves owner, scope, status, and review state.

## 5.4 Between Chat History and Document Piles

Two weak extremes frame the design space.

At one extreme, knowledge stays in chat history. This is fast and fragile. The information is hard to discover, hard to review, and easy to lose.

At the other extreme, everything becomes a document pile. This is durable and noisy. Agents retrieve too much, humans stop trusting the material, and obsolete information becomes indistinguishable from current policy.

An LLM-friendly wiki sits between those extremes:

- durable enough to survive sessions
- structured enough to retrieve selectively
- linked enough to preserve relationships
- versioned enough to show change over time
- reviewed enough to remain trustworthy
- owned enough to avoid global ambiguity

## 5.5 Domain Memory and Shared Memory

Not all knowledge belongs in the same place.

Domain memory preserves local language, decisions, constraints, and examples. Product owns product language. Platform owns operational constraints. Security owns security policy. Each domain needs room to evolve its own model without asking a global document pile for permission.

Shared memory preserves reusable lessons that multiple domains need. It points back to source domains, preserves rationale, and marks who may change the meaning so reuse does not become silent ownership transfer.

<figure class="diagram" id="ch05-domain-vs-shared-memory" data-figure-id="ch05-domain-vs-shared-memory">
  <img src="figures/ch05-domain-vs-shared-memory.svg" alt="Show when learning stays local and when it becomes shared knowledge." />
  <figcaption>Memory placement preserves ownership: local lessons stay local, while shared lessons keep source and steward.</figcaption>
</figure>

## 5.6 What Agents Need From Memory

Agents are especially vulnerable to stale or unowned memory. If a page sounds authoritative, an agent may use it even when it represents a local exception, an old decision, or a rejected idea.

This is different from ordinary documentation debt. A human reader may notice social cues, ask who wrote the page, or remember that a policy changed. An agent is more likely to convert stale text directly into future action unless the memory layer carries metadata and review state.

So a knowledge page needs more than content. It needs enough context for future agents to judge whether they may trust and use it: an owner, a scope, a status, a source decision or signal, a review state, and an escalation path.

This turns memory from a text store into a context architecture component.

Memory solves only part of the problem. It tells future agents what can be trusted, by whom, and in which scope. But domains still need to work together before a lesson can become memory.

If boundaries exist but crossing them is implicit, the boundaries are decorative.

That is where handoff protocols become relevant.

<div class="chapter-break"></div>

# Chapter 06: Boundaries Need Handoff Protocols

<p class="chapter-dek">Boundaries become real when crossing them changes behavior through explicit handoffs that preserve ownership.</p>

## 6.1 The Decorative Boundary Problem

If Product can silently make platform assumptions, the Platform boundary is decorative. If Platform can rewrite product acceptance criteria without Product ownership, the Product boundary is decorative. If a shared memory update can promote a local decision into a global rule without affected-owner review, the same problem appears in the knowledge layer.

A boundary becomes real when the crossing point changes what the agent may know, do, decide, record, or escalate.

## 6.2 What Makes a Boundary Real

A handoff protocol is a controlled information exchange between bounded contexts. It defines what crosses the boundary, why it crosses, who owns the question, who owns the answer, which constraints travel with the request, and what happens to the learning afterward.

A handoff is the mechanism for that moment of boundary crossing. It moves a question, constraint, review request, or exception from one owner to another without silently transferring authority. Reusable learning can be recorded after the exchange, but it does not become shared knowledge just because it crossed the boundary.

## 6.3 Handoff Flow

<figure class="diagram" id="ch06-handoff-flow" data-figure-id="ch06-handoff-flow">
  <img src="figures/ch06-handoff-flow.svg" alt="Show the minimum cross-context information exchange pattern." />
  <figcaption>A handoff preserves ownership by sending only needed context, returning obligations, and routing reusable learning deliberately.</figcaption>
</figure>

## 6.4 What Handoffs Preserve

A handoff sends selected information across a boundary. It preserves the shape of the boundary while enough information crosses for the target context to decide safely.

A useful handoff names the source context, the target context, the requested decision, the information allowed to cross, and the constraints or obligations that return. It also records what remains unresolved and whether anything should become a learning candidate. Different exchanges may ask for a decision, a constraint, a review, an access approval, an exception, or a reusable lesson.

The category name matters less than the ownership path: boundary crossing should remain traceable instead of becoming accidental authority transfer.

## 6.5 The DDD Connection

In DDD terms, handoff protocols operationalize Context Maps and Published Language.

Context Maps show that two domains relate. Handoff protocols define how information moves across that relationship. Published Language gives the exchange a stable vocabulary. An Anti-Corruption Layer protects one model from being swallowed by another.

For agentic collaboration, handoffs operationalize that anti-corruption role. They let one context ask another for a decision, constraint, review, or translation without importing the target context's whole model or authority.

For agents, this matters because the agent cannot rely on hallway conversation or social memory to discover ownership. The protocol carries the missing social structure.

The protocol also gives the agent a safe stopping condition. If Product asks for external collaborators and the answer depends on Security's access model, the Product agent cannot safely invent an authorization rule. It produces a handoff that Security can answer.

## 6.6 Keeping Uncertainty Visible

A useful handoff does not have to be complicated, but it needs enough structure to make uncertainty visible.

Status can stay simple. A handoff can be requested, answered, approved with obligations, blocked, expired, or escalated. What matters is that uncertainty is visible instead of being hidden inside the agent's next action.

Hidden uncertainty turns an open question into false permission. If Security answers that external collaboration is allowed only with revocation and audit obligations, but the Product handoff records only "allowed," review later sees approval while the unresolved obligation has disappeared from the path.

The closure rule matters as much as the status label. The target context owns the answer, but the source context either accepts it, acts on the obligations, or asks for clarification. A handoff with unresolved obligations is still open and should block final review.

A rejected, expired, or superseded handoff closes with a reason. Escalation does not transfer ownership; it names who must decide when the normal owner, authority, or policy path is insufficient.

In the external-collaborator access scenario, Product may want enterprise customers to invite external collaborators into a shared workspace. Product owns the feature intent and customer-facing language, while Security owns the access decision and risk constraints. A handoff lets Product ask for that decision without inventing Security policy or turning the answer into global knowledge automatically.

For agentic work, the handoff needs to be explicit enough to be checked. A review can then ask whether the agent identified the right target context, preserved ownership, and routed reusable learning without turning it into global policy.

## 6.7 What Handoffs Expose

Handoffs create traceable boundary exchanges. Memory and learning use those exchanges as inputs, then route useful lessons through curation.

Some exchanges reveal reusable lessons: a missing policy, a recurring ambiguity, a weak review rule, or a handoff shape that keeps failing. Those lessons need curation; otherwise domains drift.

Those lessons then need routing without turning every boundary signal into shared policy.

<div class="chapter-break"></div>

# Chapter 07: Learning Across Domains Needs Routing

<p class="chapter-dek">Learning improves the operating model only when signals are interpreted, routed, and checked before they change memory, handoffs, review, or policy.</p>

## 7.1 The Feedback Problem

Domains learn constantly. They make architecture decisions. They run retrospectives. They analyze incidents. They discover wrong assumptions during review. They learn which terms are confusing, which handoffs are too vague, and which policies are missing.

They also observe how agents behave over time: which boundaries they cross, which escalations they miss, which sources they over-trust, and which corrections repeat.

Some of that learning remains local. Some of it becomes shared company knowledge. The difficult part is deciding which is which.

Agents make this harder because they can generate and consume learning quickly. If every correction, review note, and incident observation becomes global context, the system drowns in stale or over-generalized knowledge. If none of it becomes durable memory, every agent starts over.

In the external-collaborator access scenario, repeated confusion about whether an external collaborator is a workspace member, tenant user, or limited guest becomes a learning signal. It may update Product language, Security handoff guidance, or shared memory.

## 7.2 Learning Signals Need Routing

Learning signals are not interchangeable. Each records a different kind of evidence, points to an owner, and suggests a follow-up action. The channel matters because it determines the learning action:

- **Architecture Decision Records (ADRs)** preserve decision rationale: the decision, context, and reason.
- **Retrospectives** surface process learning about how work happened.
- **Root cause analyses (RCAs) and postmortems** identify failure causes and prevention work.
- **Review notes** capture why a change was accepted, blocked, or redirected.
- **Handoff learnings** reveal boundary information that was missing, excessive, ambiguous, or routed to the wrong owner.
- **Evaluation findings** show whether agents stay inside boundaries, escalate risk, and use trustworthy knowledge over time.

After interpretation, each signal needs a route. It may stay local, become durable memory, or change a handoff protocol, review rule, test, policy, or ownership model. The loop needs a trigger, an owner, an interpretation step, an action path, and a later check.

Work produces learning signals. Interpretation decides what they mean, routing moves them toward memory or operating-model change, and a later check tests whether the change helped.

<figure class="diagram" id="ch07-feedback-channel-map" data-figure-id="ch07-feedback-channel-map">
  <img src="figures/ch07-feedback-channel-map.svg" alt="Map different learning artifacts to routing, memory, process updates, and later checks." />
  <figcaption>Learning improves the system only when signals are interpreted, routed, and checked.</figcaption>
</figure>

Agents can classify signals, summarize patterns, route candidates, and propose updates when goals and context are defined. Accountable people still need to decide what becomes authoritative knowledge, policy, or durable operating-model change.

Without clear ownership of interpretation and follow-up, process entropy wins: the organization keeps collecting retros, postmortems, and review notes while handoff, review, policy, test, or source-of-truth drift reappears.

## 7.3 Shared Memory Needs Stewardship

The goal is shared memory without ownership drift. Copying every lesson into shared context would recreate the global context trap in memory form.

Curated shared memory connects reusable lessons while preserving source, scope, owner, and review state. It helps agents and people discover cross-domain patterns while keeping owners of domain meaning in the loop.

A local platform lesson should not silently become product policy. A product decision should not become a global domain rule just because it entered shared memory. An incident lesson should not become a warning without an owner, status, or action path.

Shared memory therefore needs stewardship. Reusable lessons need origin, owner, scope, rationale, source signal, and affected domains. They also need review state, action path, links back to the source artifact, and a later check. Those attributes keep shared learning useful without turning it into ownerless global policy.

Stewardship preserves distributed meaning. Owners still decide whether a lesson becomes a principle, pattern, warning, policy change, or local record. Agents may surface repeated patterns and propose changes, while boundary changes, policy promotion, and source-of-truth changes remain human-owned.

The operating model now has a division of labor: memory stores judged lessons, routing decides where new signals should go, review checks whether a current change followed the right path, and governance decides which authority, risk, or policy changes are allowed.

Once handoffs move information and learning signals have a route into memory or operating-model change, review becomes the next control point: it checks whether a proposed change is technically correct and whether it respects the right responsibility boundary.

<div class="chapter-break"></div>

# Chapter 08: Review Must Check Responsibility Boundaries

<p class="chapter-dek">Boundary-aware review checks both whether the artifact works and whether it followed the right responsibility path.</p>

## 8.1 The Technically Correct Wrong Change

An agent can produce a change that compiles, passes tests, and looks reasonable while still being architecturally wrong.

It might change a term owned by another domain. It might encode a product assumption inside platform logic. It might bypass a handoff because the code change looked small. It might update documentation in a way that turns a local exception into a global rule.

This is the danger of reviewing only output quality.

Agentic work makes this failure mode more common because generation can make a change look complete before the ownership question has been answered. The change may have the right shape, pass local checks, and still encode the wrong domain meaning.

In the external-collaborator access scenario, a Product change might pass tests while treating external collaborators as ordinary workspace members. Boundary-aware review has to catch the missing Security interpretation as well as the local code behavior.

Review is one learning signal among others, and it is also the control point where the system checks whether established context selection, handoffs, memory, and governance mechanisms were actually followed.

## 8.2 Boundary-Aware Review Flow

Boundary-aware review checks the change and the responsibility path that produced it. It asks whether the change belongs in the context where it was made, whether the right owner approved the interpretation, and whether required handoffs happened before normal approval.

<figure class="diagram" id="ch08-boundary-aware-review-flow" data-figure-id="ch08-boundary-aware-review-flow">
  <img src="figures/ch08-boundary-aware-review-flow.svg" alt="Show how review checks ownership and handoff paths before normal approval." />
  <figcaption>Boundary-aware review checks the responsibility path before treating a change as normal approval.</figcaption>
</figure>

The flow starts with an ordinary change proposal. If the change stays inside the owning domain, normal review can proceed. If it crosses a boundary, review looks for the handoff and the owning context's approval. Repeated boundary confusion can then become a candidate for shared memory or process change.

## 8.3 What Review Checks

Normal code review can catch bugs, style issues, missing tests, or obvious design problems. Boundary-aware review catches responsibility drift: a change that is technically plausible but belongs to the wrong owner, uses the wrong authority, or skipped the path that would have made the interpretation legitimate.

File ownership helps, but semantic ownership is deeper. A change in one file can alter another domain's language. A documentation update can change the meaning of a contract. A test can encode an assumption that belongs to a different context. A generated implementation can pass local checks while importing the wrong domain model.

Boundary-aware review therefore checks semantic ownership, source authority, handoff completion, and repeated learning signals. It asks which context the agent acted in, which sources it treated as authoritative, whether the owning context approved the interpretation, and whether repeated findings should change context selection, handoff guidance, memory, review policy, or decision rights.

The value is practical. Better boundary-aware review reduces repeated corrections, cross-domain reversals, review churn, and the risk that a polished change encodes the wrong authority.

Review findings can still feed the curation loop from Chapter 07. Review also tests whether the work product and the operating path are both acceptable.

Review can catch responsibility drift in individual changes. Enterprise agentic work also needs a human-owned control layer: decision rights, risk boundaries, accountability, and evaluation.

<div class="chapter-break"></div>

# Chapter 09: Governance Must Define Decision Rights

<p class="chapter-dek">Governance separates knowledge from permission by defining who may decide, approve, accept risk, and change the operating model.</p>

## 9.1 The Enterprise Control Problem

Bounded contexts, handoffs, curation, and review make agentic work more structured. Enterprise software has another layer of difficulty: not every correct action is an authorized action.

An agent may understand the domain model and still make a decision it has no authority to make. It may correctly identify a risk and still route it to the wrong owner. It may generate a useful change that requires human approval, audit evidence, security review, or policy escalation before it can become part of a real system.

In the external-collaborator access scenario, governance asks whether the access decision crosses a risk threshold that needs Security evidence, explicit approval, or a human-owned exception record.

At small scale, this can look like process overhead. At enterprise scale, it is the difference between useful autonomy and uncontrolled automation.

Agentic systems differ from ordinary automation because a traditional script usually follows a narrow path someone designed in advance. An agent can interpret, propose, retrieve, combine, and act across a wider problem space. That flexibility is useful only when the decision boundary is explicit.

## 9.2 Knowledge Is Not Permission

Context architecture answers what the agent should know. Governance answers what the agent may decide.

Enterprise context also includes authority: who may approve, accept risk, create exceptions, and change the operating model.

An agent that knows the right answer but lacks the right authority should not act as if knowledge and permission are the same thing.

For agents, authority also becomes an access concept. A well-bounded agent should not receive broad standing credentials merely because it might need them later. Its access should be scoped to the task, constrained by policy, attributable to the acting agent and accountable human role, time-limited where possible, and visible in the review trail.

This keeps authorization inside the same model as context selection. Relevant information or a useful tool does not automatically become available context. If the agent lacks authority to inspect data, call a service, modify an artifact, or obtain a credential, the correct behavior is escalation, handoff, or denial.

Context selection and authorization are therefore two views of the same authority model: selection decides what the agent may bring into the task, and governance decides what the agent may do with it.

The most important governance rule is simple:

> Accountability and risk ownership stay with humans.

Agents can perform work, propose changes, summarize risk, detect conflicts, draft decisions, and execute bounded tasks. They may carry delegated responsibilities inside bounded work, but they do not own the business outcome, accept organizational risk, or become accountable for the system. Accountability must stay with named human roles and explicit human delegates. Teams may contribute, but accountability cannot be assigned to the agent or to "the system."

Governance-oriented AI risk framing, including the [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework), points in the same direction: useful AI systems still need accountable roles, risk management, evidence, and oversight around them.

## 9.3 Decision Rights Model

The decision-rights model separates delegated action from governance stops. An agent may proceed only when it is in the right context, within delegated authority, and below the relevant risk threshold. Wrong ownership, missing authority, or material risk routes the decision to the owning context or a human reviewer. Every path leaves a record.

<figure class="diagram" id="ch09-decision-rights-model" data-figure-id="ch09-decision-rights-model">
  <img src="figures/ch09-decision-rights-model.svg" alt="Show context ownership, decision authority, risk review, and recordkeeping as separate governance checks." />
  <figcaption>Decision rights separate being correct from being authorized: ownership, authority, risk, and evidence stay visible.</figcaption>
</figure>

The model separates four concerns. Context ownership decides whose meaning is involved. Decision authority decides whether the agent may act, propose, or must defer. Risk review decides whether the decision is safe enough to delegate. Recordkeeping preserves the decision, rationale, owner, constraints, and review state.

## 9.4 What Governance Adds

Governance sits on top of DDD boundaries.

DDD says which context owns meaning. Governance says which role may make which decision, under which risk level, with which evidence, and with which review path.

For enterprise agentic delivery, the minimum governance shape is small but explicit. It names the decision type and risk class, the agent's delegated authority, the accountable human owner, the evidence required before action, the escalation path when authority is missing, and the record that must survive the decision.

That minimum shape lets later review ask whether the agent acted with the right context, authority, evidence, and accountability.

Risk class changes the autonomy threshold. Local, reversible work may be delegated with a review trail. Cross-domain, customer-impacting, regulated, security-sensitive, financial, reputational, or hard-to-reverse work needs stronger human review or explicit risk acceptance. Suspected harmful behavior, policy bypass, or unauthorized action should stop autonomy first and resolve authority second.

Human accountability therefore cannot be an afterthought bolted onto the end of an autonomous workflow. Accountable people define intent, own meaning, accept risk, handle exceptions, respond to incidents, and steward the memory that future agents will use. The practical question is not "human or agent?" It is "which decisions can be delegated, which must be reviewed, and which must remain human-owned?"

## 9.5 Governance Must Stay Observable

Governance spans approval before action and feedback after action.

Review catches boundary problems in individual changes. Governance also needs a longer time horizon: the system has to show whether agents are respecting the model over time, staying inside boundaries, using authorized sources, completing handoffs, escalating comparable risks consistently, and turning repeated failures into governed changes in durable memory or policy.

Observability asks what agents actually did: which context they loaded, which handoff they used, which owner approved the interpretation, which authority they claimed, what evidence they left, and where they stopped. Evaluation asks whether that behavior stayed inside the intended model.

These signals are governance questions made observable, not dashboard specifications. The exact measurements depend on the organization, domain, risk class, and tooling maturity.

Without this loop, governance becomes paperwork. With it, governance becomes a learning system.

Self-improvement stays bounded by the same decision-rights model. Agents may surface patterns and propose changes, but humans own changes to policy, tests, permissions, source-of-truth status, autonomy thresholds, and durable knowledge.

Once context, memory, handoffs, review, and human decision rights are explicit, the context architecture model is visible enough to implement. The final question is how to implement it without letting a tool silently become the architecture.

<div class="chapter-break"></div>

# Chapter 10: Start With One Bounded Context

<p class="chapter-dek">Start small by making one bounded context explicit enough for agents to work, stop, hand off, and learn safely.</p>

## 10.1 The Practical Starting Point

Once the model is visible, the practical starting point is the smallest place where it can become real: one area where the organization can make agentic work explicit while keeping ownership, authority, and boundary crossings visible.

Start with one bounded context and one recurring agentic work pattern.

That scale is useful for learning. One bounded context is large enough to contain real domain language, real source authority, real review, real memory, and real decision rights. It is also small enough that ownership can stay visible.

The immediate goal is to make one area explicit enough that agents can work inside it, stop when authority is missing, and use handoffs when work crosses a boundary.

## 10.2 Make The Inside Explicit

A context can support meaningful agentic autonomy only when its language, sources, responsibilities, stop conditions, and decision rights are explicitly defined enough for people and agents to reason about them.

<div class="model-artifact splittable">
  <p class="model-artifact-title">First bounded-context model pass</p>
  <p class="model-artifact-note">Use this pass to name model commitments before selecting tools or increasing autonomy.</p>
  <table>
    <colgroup>
      <col style="width: 11%;" />
      <col style="width: 28%;" />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th>Step</th>
        <th>Commitment</th>
        <th>What to define</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Name the bounded context.</td>
        <td>Decide which domain owns the language, model, constraints, and acceptance of the work.</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Name the owner of domain meaning.</td>
        <td>Identify the accountable role or team that can say whether the agent understood the domain correctly.</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Classify the context sources.</td>
        <td>Separate required, optional, forbidden, obsolete, and missing-authority context.</td>
      </tr>
      <tr>
        <td>4</td>
        <td>Define agent responsibilities.</td>
        <td>State what the agent may retrieve, summarize, propose, modify, execute, or only recommend.</td>
      </tr>
      <tr>
        <td>5</td>
        <td>Define stop conditions.</td>
        <td>State what the agent may not decide, when it must ask, and when work must move to another context.</td>
      </tr>
      <tr>
        <td>6</td>
        <td>Define local memory and learning routes.</td>
        <td>Decide which lessons remain local, which may become shared memory, and which repeated signals trigger changes to guidance, tests, review policy, or source status.</td>
      </tr>
      <tr>
        <td>7</td>
        <td>Add boundary-aware review questions.</td>
        <td>Ask whether the work stayed inside its context, used the right source of authority, preserved ownership, and escalated uncertainty.</td>
      </tr>
      <tr>
        <td>8</td>
        <td>Name decision rights and evidence.</td>
        <td>Define who may approve, reject, accept risk, change autonomy thresholds, and record the decision.</td>
      </tr>
    </tbody>
  </table>
</div>

These are model commitments before they become tool features. Different organizations can record them in different ways; future tooling needs something explicit to implement.

## 10.3 Make Boundary Crossings Explicit

Most interesting enterprise work eventually touches another context. That is where agentic systems can quietly become unsafe: the agent may continue operating as if local authority still applies after the work has crossed a semantic, organizational, security, or policy boundary.

The first bounded context therefore needs visible handoffs to its nearest neighbors.

A handoff should name the neighboring context, the decision requested from it, the minimum information that may cross the boundary, the information that must not cross, the owner who can answer, the obligations returned, and the record that survives the exchange.

Together, those handoff details keep local work local and route outside decisions to the context that owns them.

The external-collaborator access scenario can be read as a small bounded-context start. Product can own the feature intent, but access meaning crosses into Security. The model asks whether context, ownership, authority, evidence, review, and memory remain visible as the work moves.

<div class="model-artifact">
  <p class="model-artifact-title">External-collaborator access: model visibility check</p>
  <table>
    <colgroup>
      <col style="width: 18%;" />
      <col style="width: 18%;" />
      <col />
      <col style="width: 22%;" />
    </colgroup>
    <thead>
      <tr>
        <th>Turn</th>
        <th>Owner</th>
        <th>What the model makes explicit</th>
        <th>Output</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Context selection</td>
        <td>Product</td>
        <td>Feature intent is local; access meaning belongs to Security.</td>
        <td>Security handoff required.</td>
      </tr>
      <tr>
        <td>Handoff</td>
        <td>Security</td>
        <td>Access constraints, required evidence, audit needs, revocation rules, and tenant-boundary obligations.</td>
        <td>Handoff answer with obligations.</td>
      </tr>
      <tr>
        <td>Governance</td>
        <td>Accountable role</td>
        <td>Whether the decision is above delegated authority and which risk must remain human-owned.</td>
        <td>Approval, rejection, or escalation record.</td>
      </tr>
      <tr>
        <td>Review</td>
        <td>Boundary-aware reviewer</td>
        <td>Whether the change used the right authority, preserved ownership, and carried the required evidence.</td>
        <td>Review decision and unresolved obligations.</td>
      </tr>
      <tr>
        <td>Curation</td>
        <td>Knowledge owner</td>
        <td>Whether repeated cases justify durable memory or an operating-rule change.</td>
        <td>Curated lesson, or no shared update.</td>
      </tr>
    </tbody>
  </table>
</div>

When those turns are visible, the organization can see which context authorized the work, which evidence mattered, which obligations remain open, and where future agents should learn.

## 10.4 Tools Come After The Model

Tooling comes after those commitments. Its job is to make the model executable, observable, and easier to follow.

Before an implementation choice, the context architecture model should already define the commitments the tool must preserve.

<figure class="diagram" id="ch10-model-before-runtime" data-figure-id="ch10-model-before-runtime">
  <img src="figures/ch10-model-before-runtime.svg" alt="Show implementation surfaces preserving context model commitments." />
  <figcaption>Tools make context architecture commitments executable and observable.</figcaption>
</figure>

For agentic systems, tooling choices turn model commitments into permissions, defaults, traces, and review paths. If a runtime allows an agent to read everything, modify everything, or route around review, that permission structure changes the operating model.

The implementation succeeds when those model commitments remain traceable during real work.

## 10.5 Scale By Repeating The Pattern

Organizations usually reach governed autonomy by making one step after another explicit.

Start with local assistance inside one bounded context. Add explicit context selection. Preserve repeated lessons as durable memory. Add handoffs for the nearest cross-domain boundary. Add boundary-aware review. Add governance and evaluation as the autonomy threshold rises. Let repeated signals show where the model needs to change.

Scaling context architecture means repeating the pattern across adjacent contexts while preserving the boundaries that made the first context understandable.

This is economically serious precisely because it starts small. The organization can observe whether repeated discovery decreases, whether boundary findings become less common, whether handoffs route faster, whether stale-source usage goes down, whether owner resolution improves, and whether fewer changes require late reversal.

The architectural justification is simpler: the work earns its keep when it reduces the cost of coordination and the risk of plausible but unauthorized action.

## 10.6 The Model Is Visible

With one bounded context made explicit, the model becomes visible. Bounded contexts define where domain language and model boundaries are valid, minimum needed context selects what is safe to use, durable memory preserves judged lessons, handoffs protect boundary crossings, review catches responsibility drift, governance defines authority, and tools make the model executable and observable.

The closing thesis follows from that visibility: trustworthy speed requires the company to see which context, authority, memory, review, and accountability shaped each agentic change.

<div class="chapter-break"></div>

# Chapter 11: Closing Thesis and Next Questions

<p class="chapter-dek">Context architecture keeps enterprise agentic change legible, bounded, reviewable, and accountable.</p>

## 11.1 Closing Thesis

The argument started with a simple shift: enterprise agentic software delivery is a context architecture problem.

After bounded contexts, minimum needed context, durable memory, handoffs, learning-signal routing, boundary-aware review, decision rights, and tool-neutral implementation, the thesis becomes sharper:

> Context architecture is how enterprise agentic software delivery keeps change legible, bounded, and accountable: DDD defines where domain language and model boundaries are valid, and the operating model turns memory, handoffs, review, governance, and feedback into governed learning instead of uncontrolled drift.

Strategic DDD gives enterprise software organizations much of the language for this: bounded contexts, ubiquitous language, context maps, published language, the Anti-Corruption Layer pattern, and clear ownership. The operating model makes that language usable for agentic work: agents act inside bounded responsibility, cross boundaries through explicit handoffs, route learning into memory or operating-model change, and remain subject to human-owned accountability.

The goal is to make agentic work legible, bounded, reviewable, and accountable inside the company system it is changing.

Speed matters when the organization can see why a change was legitimate and how it respected meaning, ownership, memory, handoffs, review, governance, and human accountability.

## 11.2 Adjacent Questions

This whitepaper focused on the context architecture question: what agents may know, which domain language and model boundaries apply, how boundaries are crossed, how learning is preserved, and where humans remain accountable.

Data privacy and LLMs, security architecture for agents, detailed compliance programs, model evaluation, vendor procurement, TOGAF-style enterprise architecture, cost governance, and organizational change management are all real enterprise pains. They matter because they shape what agents may know, do, decide, retain, expose, review, and escalate.

This whitepaper considers those topics where they change context, authority, memory, review, or feedback.

The useful next questions are therefore focused:

- How should data privacy boundaries shape agent context selection?
- What does security architecture look like for bounded agent systems?
- How can enterprise architecture maps become inputs to context architecture?
- What should evaluation and observability measure beyond task success?
- How should cost, vendor risk, and adoption constraints shape the operating model?

Those questions are where the model touches the rest of enterprise AI practice.

## 11.3 Terms Used in This Paper

These terms are collected here for reader orientation and use the meanings established in the chapters.

| Term | Meaning in this paper |
| --- | --- |
| Context architecture | The architecture discipline for making organizational context, meaning boundaries, authority, memory, handoffs, review, and accountability explicit enough for agentic software delivery. |
| Strategic DDD | The part of Domain-Driven Design concerned with bounded contexts, domain language, context maps, ownership, and relationships between models. |
| Operating model | The memory, handoff, review, governance, feedback, and decision-rights mechanisms that keep the context model usable as the organization changes. |
| Bounded context | A semantic and model boundary within which domain language and meaning are locally valid and owned. |
| Ubiquitous language | The domain-owned vocabulary used by people, systems, and agents inside a bounded context. |
| Minimum needed context | The selected context an agent needs to act safely: required, optional, forbidden, and missing-authority context scoped by responsibility and authority. |
| Context contamination | A failure mode where an agent uses information from the wrong domain, abstraction level, time period, or authority path. |
| Durable memory | Curated, owned, scoped, reviewed, and kept current knowledge that survives sessions and can be trusted by future work. |
| Handoff protocol | A controlled boundary exchange that preserves ownership while moving a question, decision, constraint, obligation, or learning candidate to the context that owns it. |
| Learning signal | Evidence from work, review, handoffs, incidents, retrospectives, or evaluations that may stay local, become durable memory, or change the operating model. |
| Boundary-aware review | Review that checks both the work product and whether the change followed the right context, authority, source, and handoff path. |
| Decision rights | The authority model that defines who may decide, approve, accept risk, create exceptions, change policy or autonomy thresholds, or escalate. |
| Responsibility drift | A failure where technically plausible work belongs to the wrong owner, authority path, or domain model. |
| Knowledge drift | The gradual loss of usable knowledge quality as rationale, terminology, ownership, examples, and source status become stale or ambiguous. |
| Authority drift | A governance failure where a local exception, stale memory item, repeated practice, or shared note starts being treated as permission or policy without the owning authority changing the rule. |

## 11.4 References and Further Reading

This whitepaper is a synthesis. The project-specific claim is the combination: strategic DDD plus an operating model for enterprise agentic software delivery. The references below credit the main intellectual lineage and point to deeper background.

Strategic DDD and bounded contexts:

- Eric Evans, [Domain-Driven Design Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)
- Martin Fowler, [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html) and [Ubiquitous Language](https://martinfowler.com/bliki/UbiquitousLanguage.html)
- Context Mapper, [Context Maps](https://contextmapper.org/docs/context-map/)

Organizational knowledge and architecture memory:

- Ikujiro Nonaka, [A Dynamic Theory of Organizational Knowledge Creation](https://ideas.repec.org/a/inm/ororsc/v5y1994i1p14-37.html)
- Edgar Serna M., Oscar Bachiller S., and Alexei Serna A., [Knowledge meaning and management in requirements engineering](https://ideas.repec.org/a/eee/ininma/v37y2017i3p155-161.html)
- [Enterprise Architecture and Business-IT Alignment](https://doaj.org/article/56ccd6279e914047809b1c87ebb65577)
- [Architectural Knowledge Vaporization](https://www.cs.rug.nl/~paris/papers/EPLOP09.pdf)
- [Architecture Decision Records](https://adr.github.io/)

LLM context and compounding memory:

- [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)
- [Large Language Models Can Be Easily Distracted by Irrelevant Context](https://arxiv.org/abs/2302.00093)
- Stanford Encyclopedia of Philosophy, [Bounded Rationality](https://plato.stanford.edu/entries/bounded-rationality/)
- Andrej Karpathy, [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

Boundary learning, governance, and accountability:

- Team Topologies, [Team API excerpt](https://itrevolution.com/wp-content/uploads/2022/06/TTOP_excerpt.pdf)
- Google SRE, [Postmortem Culture](https://sre.google/sre-book/postmortem-culture/)
- LLVM, [RFC Process](https://llvm.org/docs/RFCProcess.html)
- NIST, [AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- AWS, [Governing and Architecting Agentic AI at Scale](https://docs.aws.amazon.com/prescriptive-guidance/latest/govern-architect-agentic-ai/introduction.html)
