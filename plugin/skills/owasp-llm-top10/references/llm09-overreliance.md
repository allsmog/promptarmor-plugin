# LLM09: Overreliance

## Description

Overreliance occurs when users or systems place excessive trust in LLM-generated content without adequate verification, leading to the propagation of inaccurate, fabricated, or harmful information into downstream processes. This includes relying on LLM output for factual claims, code correctness, security decisions, legal advice, or medical guidance without human review or independent validation.

Key overreliance patterns:
- **Hallucination propagation**: LLM-generated fabrications (nonexistent citations, incorrect facts, invented APIs) are accepted and acted upon.
- **Unverified code deployment**: LLM-generated code is deployed to production without security review or testing.
- **Automated decision-making**: LLM outputs directly drive business decisions without human oversight.
- **Security false confidence**: Organizations rely on LLM-based security tools without understanding their limitations and failure modes.
- **Authority substitution**: Users treat LLM responses as authoritative expert opinions rather than probabilistic text generation.

## Real-World Examples

1. **Lawyer cites fabricated cases (2023)**: An attorney used ChatGPT to research case law and submitted a brief containing entirely fabricated case citations that the model hallucinated with realistic-sounding names and docket numbers.
2. **Vulnerable code from AI assistants**: Researchers found that developers using AI code assistants produced code with more security vulnerabilities than those coding without AI assistance, because they trusted the generated code without review.
3. **Medical misinformation**: LLM-powered health chatbots provided incorrect medical advice that users followed without consulting healthcare professionals.
4. **Fabricated package names**: LLMs hallucinate nonexistent software package names, which attackers then register on package managers (package hallucination attacks / slopsquatting).
5. **Automated vulnerability assessment**: Security teams using LLM-generated vulnerability assessments without validation missed critical issues while investigating fabricated ones.

## Detection Methodology

### Static Analysis
- Identify workflows where LLM output is consumed without human review gates.
- Check for automated pipelines that act on LLM output directly (auto-deploy, auto-email, auto-approve).
- Verify that LLM-generated code goes through standard code review and testing before deployment.
- Look for LLM output used in security-critical decisions without independent validation.

### Dynamic Testing
- Test whether the LLM generates fabricated citations, references, or data points and whether the system propagates them.
- Verify that hallucinated package names, API endpoints, or file paths are detected before they cause harm.
- Test whether confidence disclaimers are present in LLM output for factual claims.
- Verify that generated code is tested and reviewed before execution.

### Behavioral Signals
- LLM responses contain citations or references that do not exist.
- Generated code contains patterns known to be insecure.
- LLM provides definitive answers to ambiguous or contested questions.
- System acts on LLM output without any verification step.

## Attack Mapping (PromptArmor Plugins)

| Plugin | Technique |
|--------|-----------|
| `hallucination-probe` | Test for fabricated facts, citations, and references |
| `code-vuln-generation` | Test whether generated code contains known vulnerability patterns |
| `confidence-calibration` | Test whether the model expresses appropriate uncertainty |
| `package-hallucination` | Test for fabricated package/library name generation |
| `factual-integrity-check` | Verify factual claims against known-correct baselines |

## Remediation Checklist

- [ ] Implement human review gates: Never allow LLM output to drive critical actions without human verification.
- [ ] Add confidence indicators: Clearly label LLM-generated content as AI-generated and include uncertainty signals.
- [ ] Validate factual claims: Cross-reference LLM-generated facts, citations, and data against authoritative sources.
- [ ] Review generated code: Apply the same code review, static analysis, and testing standards to LLM-generated code as human-written code.
- [ ] Implement guardrails for automated workflows: Add validation checks, schema enforcement, and sanity tests before LLM output enters automated pipelines.
- [ ] Train users on LLM limitations: Ensure users understand that LLMs can hallucinate, fabricate, and produce confidently wrong answers.
- [ ] Use retrieval-augmented generation (RAG) to ground responses in verified data sources.
- [ ] Implement output attribution: Require the LLM to cite sources and verify those sources exist.
- [ ] Monitor for hallucination patterns: Track and alert on responses that contain fabricated references or impossible claims.
- [ ] Apply defense-in-depth for security decisions: Never rely solely on LLM analysis for security assessments. Combine with traditional tools and human review.
- [ ] Implement automated fact-checking where possible (e.g., verifying that cited URLs exist, packages are real, APIs are valid).

## Key Insight

Overreliance is a human factors vulnerability, not a technical one. The LLM cannot reliably know when it is wrong, and prompt engineering cannot eliminate hallucination. Defense requires organizational controls: review processes, validation pipelines, user training, and a culture that treats LLM output as a starting point for human judgment rather than a substitute for it.
