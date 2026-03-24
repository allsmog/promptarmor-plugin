# LLM03: Training Data Poisoning

## Description

Training data poisoning occurs when the data used to train or fine-tune an LLM is manipulated to introduce vulnerabilities, backdoors, or biases into the model's behavior. Unlike prompt injection (which attacks at inference time), data poisoning attacks the model at the training or fine-tuning stage, embedding malicious behaviors that persist across all future interactions.

This applies to:
- **Pre-training data**: Poisoned web crawl data, open datasets, or public code repositories.
- **Fine-tuning data**: Manipulated labeled datasets used for task-specific fine-tuning.
- **RLHF/DPO feedback**: Compromised human feedback used in alignment training.
- **RAG knowledge bases**: Poisoned documents in retrieval-augmented generation systems (a runtime variant).

## Real-World Examples

1. **Backdoor attacks on code models**: Researchers demonstrated planting trojaned code patterns in open-source repositories that were later included in training data, causing code-generation models to suggest vulnerable patterns when triggered by specific variable names.
2. **PoisonGPT (2023)**: Researchers fine-tuned an open model to produce factually incorrect answers to specific questions while maintaining normal performance on all other queries, demonstrating stealth poisoning.
3. **Sleeper agent attacks**: Models fine-tuned with poisoned data that activates malicious behavior only when a specific trigger phrase or date condition is met.
4. **RAG knowledge base manipulation**: Attackers modify shared documents (wikis, Confluence, SharePoint) that feed into enterprise RAG pipelines, injecting instructions that persist across all user queries.
5. **Bias injection**: Manipulating training data to introduce discriminatory outputs for specific demographic groups.

## Detection Methodology

### Static Analysis
- Audit training data provenance: Where does each dataset come from? Who contributed?
- Scan fine-tuning datasets for anomalous patterns, injection payloads, or hidden instructions.
- Check for data integrity controls: Are datasets versioned, signed, and auditable?
- Review RAG knowledge base access controls and change logs.

### Dynamic Testing
- Test model responses to known trigger patterns associated with common backdoor techniques.
- Compare model behavior against a baseline (unpoisoned) model on security-sensitive prompts.
- Probe for biased or factually incorrect outputs on specific topics that may indicate targeted poisoning.
- Test RAG pipelines by injecting canary documents and verifying whether they influence model responses.
- Evaluate model confidence scores on poisoned vs. clean inputs for statistical anomalies.

### Behavioral Signals
- Model produces consistently incorrect or biased answers on narrow topics while performing normally elsewhere.
- Model behavior changes based on specific trigger words or phrases that seem unrelated to the topic.
- RAG-augmented responses contain instructions or content not present in the original query.
- Model suggests insecure code patterns for specific function names or library calls.

## Attack Mapping (PromptArmor Plugins)

| Plugin | Technique |
|--------|-----------|
| `rag-poison-inject` | Inject poisoned documents into RAG knowledge base |
| `indirect-rag-inject` | Embed instructions in retrievable documents |
| `trigger-phrase-probe` | Test for backdoor trigger activation |
| `bias-elicitation` | Probe for discriminatory or biased outputs |
| `factual-integrity-check` | Test for factual manipulation on specific topics |

## Remediation Checklist

- [ ] Implement data provenance tracking: Maintain a verifiable chain of custody for all training and fine-tuning data.
- [ ] Use dataset validation: Scan training data for anomalous patterns, injection payloads, and statistical outliers before training.
- [ ] Apply data sanitization: Filter out content that contains instruction-like patterns from training/fine-tuning data.
- [ ] Version and sign datasets: Use cryptographic integrity checks to detect unauthorized modifications.
- [ ] Implement access controls on RAG knowledge bases: Restrict who can modify documents that feed into LLM pipelines.
- [ ] Use anomaly detection on model outputs: Monitor for unexpected behavioral shifts that may indicate poisoning.
- [ ] Maintain baseline models for comparison testing: Regularly compare production model behavior against known-clean baselines.
- [ ] Diversify data sources to reduce the impact of any single poisoned source.
- [ ] Implement human review for high-stakes fine-tuning datasets.
- [ ] Use federated learning with Byzantine fault tolerance when training on distributed data.
- [ ] Audit RAG document change logs and alert on bulk modifications.
- [ ] Apply differential privacy techniques during training to limit the influence of individual data points.

## Key Insight

Training data poisoning is difficult to detect because the malicious behavior is baked into the model's weights. Unlike prompt injection, there is no runtime payload to filter. Defense requires securing the entire data pipeline from collection through training, and continuous behavioral monitoring in production.
