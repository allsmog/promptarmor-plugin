# LLM10: Model Theft

## Description

Model theft involves unauthorized access to, copying of, or extraction of proprietary LLM model weights, architectures, training data, or fine-tuning configurations. This includes both direct theft (accessing model files) and indirect extraction (using the model's API to reconstruct its behavior through systematic querying). Model theft threatens intellectual property, competitive advantage, and can enable adversaries to discover and exploit model-specific vulnerabilities offline.

Key theft vectors:
- **Direct access**: Unauthorized access to model weight files, training scripts, or configuration stored in cloud storage, repositories, or deployment infrastructure.
- **Model extraction attacks**: Systematic API queries designed to train a surrogate model that replicates the target model's behavior (knowledge distillation attacks).
- **Side-channel attacks**: Exploiting timing, memory, or power consumption patterns during inference to extract model information.
- **Insider threats**: Employees or contractors with access to model artifacts exfiltrating them.
- **Supply chain compromise**: Theft through compromised CI/CD pipelines, model registries, or deployment infrastructure.

## Real-World Examples

1. **Meta LLaMA weights leak (2023)**: The original LLaMA model weights were leaked online within days of their restricted release, despite access controls.
2. **Model extraction via API**: Researchers demonstrated extracting functional replicas of production models through systematic API queries, achieving near-equivalent performance with a fraction of the training cost.
3. **Training data extraction**: Techniques for extracting memorized training data from production models, which reveals proprietary datasets used for fine-tuning.
4. **Cloud misconfiguration**: Model weight files exposed through misconfigured S3 buckets, Azure Blob Storage, or GCS buckets with public access.
5. **System prompt as IP**: System prompts containing proprietary business logic, fine-tuning strategies, or competitive intelligence extracted through prompt injection.

## Detection Methodology

### Static Analysis
- Audit access controls on model weight files, training data, and configuration.
- Check cloud storage permissions for model artifacts (S3, GCS, Azure Blob).
- Verify encryption at rest and in transit for model files.
- Check for exposed model serving endpoints without authentication.
- Audit CI/CD pipeline access controls for model build and deployment steps.
- Review API rate limiting and query pattern monitoring.

### Dynamic Testing
- Test API rate limits: Can an attacker make enough queries to extract model behavior?
- Test access controls on model artifact storage.
- Verify authentication requirements on model serving endpoints.
- Test for information leakage in model responses (architecture details, training metadata).
- Attempt to extract system prompt (which may contain proprietary fine-tuning details).

### Behavioral Signals
- Unusual API query patterns: High volume, systematic input variation, or distribution-probing queries.
- Unauthorized access attempts on model storage or serving infrastructure.
- Large-scale data exports from model-related systems.
- API queries designed to map model boundaries (adversarial probing).

## Attack Mapping (PromptArmor Plugins)

| Plugin | Technique |
|--------|-----------|
| `system-prompt-extract` | Extract proprietary system prompt content |
| `model-fingerprint` | Identify model architecture and version through behavioral probing |
| `api-rate-limit-test` | Test whether rate limits prevent extraction-scale querying |
| `storage-access-audit` | Check for exposed model artifact storage |
| `training-data-extract` | Probe for memorized training data leakage |

## Remediation Checklist

- [ ] Implement strict access controls on model artifacts: Model weights, training data, and configurations should be accessible only to authorized personnel with audited access.
- [ ] Encrypt model artifacts at rest and in transit. Use customer-managed encryption keys.
- [ ] Implement API rate limiting and query pattern detection: Flag and throttle systematic probing patterns that suggest extraction attempts.
- [ ] Monitor for unusual API usage: High-volume queries, distribution-probing inputs, or systematic parameter sweeps.
- [ ] Use watermarking techniques: Embed invisible watermarks in model outputs to detect unauthorized copies.
- [ ] Restrict model metadata exposure: Do not reveal architecture details, training parameters, or version information through API responses or error messages.
- [ ] Implement query logging and anomaly detection: Log all API queries and use ML-based anomaly detection to identify extraction campaigns.
- [ ] Secure cloud storage: Audit S3/GCS/Azure Blob permissions regularly. Never use public access for model artifacts.
- [ ] Apply principle of least privilege for infrastructure access: Model training, evaluation, and serving environments should have separate access controls.
- [ ] Use model serving platforms with built-in security: Prefer managed platforms with authentication, rate limiting, and monitoring over bare endpoints.
- [ ] Implement legal protections: Terms of service should prohibit model extraction and reverse engineering.
- [ ] Conduct regular security audits of the model lifecycle: From training data collection through deployment and serving.

## Key Insight

Model theft is particularly challenging to prevent in API-serving scenarios because the model's behavior is inherently observable through its outputs. Defense requires a combination of access controls (for direct theft), rate limiting and anomaly detection (for extraction attacks), and monitoring (for insider threats). No single control is sufficient; a defense-in-depth approach across the entire model lifecycle is required.
