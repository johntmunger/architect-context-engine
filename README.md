# Architect

Architect is a repository-aware AI architecture assistant designed to reason about software projects through controlled information boundaries. It is an information-management layer between a repository and reasoning models.

The system separates filesystem discovery, evidence collection, semantic compression, and downstream reasoning so that large repositories do not need to be passed wholesale through an LLM or API boundary.

---

## Context and Information Boundaries

Architect is not designed only to reduce LLM token usage or API cost.

A central architectural goal is to control how much information crosses each boundary of the system.

The guiding principle is:

> **"Can we send it?" is not the same question as "Should we send it?"**

A repository may contain far more information than a downstream model needs in order to reason effectively about its architecture.

Architect therefore progressively reduces and structures information before it crosses an LLM or API boundary.

```text
Repository
    ↓
Filesystem Boundary
    ↓
Relevant Files
    ↓
Raw Corpus
    ↓
Semantic Processing Boundary
    ↓
Compressed Project Knowledge
    ↓
Reasoning Context
```

## And each reduction has a reason beyond money:

| Concern              | Why reduce unnecessary data?                            |
| -------------------- | ------------------------------------------------------- |
| **Speed**            | Less data to read, transmit, process, and return        |
| **Cost**             | Fewer input/output tokens                               |
| **Context capacity** | More room for the actual reasoning/task                 |
| **Privacy / safety** | Don't send information that isn't needed                |
| **Security**         | Reduce unnecessary exposure across an API boundary      |
| **Reliability**      | Less irrelevant material competing for model attention  |
| **Caching**          | Smaller, more stable context is easier to reuse         |
| **Change detection** | Easier to determine what actually requires regeneration |
