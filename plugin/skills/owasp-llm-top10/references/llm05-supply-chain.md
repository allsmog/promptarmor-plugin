# LLM05: Supply Chain Vulnerabilities

## Description

Supply chain vulnerabilities in LLM applications arise from insecure dependencies on third-party components throughout the AI/ML pipeline. This includes compromised model weights, poisoned training datasets, vulnerable libraries, insecure plugins/extensions, and unverified model providers. The LLM supply chain is uniquely complex because it spans traditional software dependencies, ML-specific artifacts (models, datasets, embeddings), and runtime integrations (plugins, tools, APIs).

Key supply chain surfaces:
- **Model providers**: Using models from unverified sources without integrity verification.
- **ML libraries**: Vulnerable versions of PyTorch, TensorFlow, LangChain, LlamaIndex, or their transitive dependencies.
- **Plugin ecosystems**: Third-party plugins, tools, or extensions that run with the LLM's permissions.
- **Dataset sources**: Training or RAG data from untrusted origins.
- **Embedding models**: Compromised embedding models that distort retrieval results.
- **Infrastructure**: Compromised container images, CI/CD pipelines, or deployment templates.

## Real-World Examples

1. **Malicious models on public hubs (2023)**: Researchers found models on public model hubs containing arbitrary code execution payloads in serialized weights that run on model load.
2. **LangChain RCE vulnerabilities (2023)**: Multiple critical remote code execution vulnerabilities in LangChain versions allowed attackers to run arbitrary code through crafted prompt templates.
3. **PyTorch nightly supply chain attack (2022)**: A dependency package was compromised on PyPI, affecting users who installed PyTorch nightly builds.
4. **ChatGPT plugin vulnerabilities (2023)**: Third-party plugins with insufficient authentication allowed data exfiltration and unauthorized actions.
5. **Compromised embedding models**: Backdoored embedding models that map specific trigger phrases to incorrect vector spaces, poisoning RAG retrieval.

## Detection Methodology

### Static Analysis
- Inventory all LLM-related dependencies: model providers, ML libraries, plugins, datasets.
- Check for known vulnerabilities in ML libraries using CVE databases.
- Verify model provenance: Are models downloaded from verified sources with integrity checks?
- Scan for unsafe deserialization in model loading code (arbitrary code execution risk).
- Audit plugin permissions: What can each third-party plugin access?
- Check for pinned dependency versions and lock files.

### Dynamic Testing
- Test plugin isolation: Can a compromised plugin access data or tools outside its intended scope?
- Verify model integrity: Compare model checksums against published values.
- Test for vulnerable library versions by probing known exploit conditions.
- Scan container images for known vulnerabilities.
- Test plugin authentication and authorization flows.

### Behavioral Signals
- Model behavior differs from expected baseline (possible weight tampering).
- Unexpected network calls from ML library code.
- Plugin invocations access resources outside their declared scope.
- Dependency resolution pulls packages from unexpected registries.

## Attack Mapping (PromptArmor Plugins)

| Plugin | Technique |
|--------|-----------|
| `dependency-audit` | Scan for known-vulnerable ML library versions |
| `plugin-isolation-test` | Test plugin sandboxing and permission boundaries |
| `model-integrity-check` | Verify model checksums and provenance |
| `serialization-scan` | Detect unsafe model loading patterns |
| `tool-permission-escalation` | Test whether tools can access resources beyond scope |

## Remediation Checklist

- [ ] Maintain a Software Bill of Materials (SBOM) that includes ML-specific artifacts (models, datasets, embeddings).
- [ ] Pin all dependency versions and use lock files. Never use floating version ranges for ML libraries.
- [ ] Verify model integrity: Download models only from trusted sources and validate checksums/signatures.
- [ ] Avoid unsafe serialization for model weights: Prefer SafeTensors or ONNX formats that do not support arbitrary code execution.
- [ ] Audit and sandbox plugins: Each plugin should run with minimum required permissions in an isolated environment.
- [ ] Implement dependency scanning in CI/CD: Block builds with known-vulnerable ML library versions.
- [ ] Use private model registries for production deployments rather than pulling directly from public hubs.
- [ ] Monitor for CVEs in LLM framework dependencies and patch promptly.
- [ ] Implement plugin authentication: Require OAuth or API keys for all third-party integrations.
- [ ] Review and approve plugins before deployment. Do not auto-install community plugins in production.
- [ ] Use reproducible builds for ML pipelines to detect supply chain tampering.
- [ ] Regularly rotate API keys and credentials used by plugins and integrations.

## Key Insight

The LLM supply chain extends far beyond traditional software dependencies. Models, datasets, embeddings, and plugins all represent attack surfaces. Organizations must apply the same rigor to ML artifact supply chains that they apply to software dependency management, including integrity verification, vulnerability scanning, and least-privilege access controls.
