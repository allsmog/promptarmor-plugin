# HIPAA Compliance for LLM Applications

## Overview

The Health Insurance Portability and Accountability Act (HIPAA) governs the use, disclosure, and protection of Protected Health Information (PHI) in the United States. LLM applications that process, store, or transmit PHI must comply with the HIPAA Privacy Rule, Security Rule, and Breach Notification Rule. This applies to covered entities (healthcare providers, health plans, clearinghouses) and their business associates.

## Key Requirements

1. **Privacy Rule**: PHI may only be used or disclosed for treatment, payment, healthcare operations, or with patient authorization. Minimum necessary standard applies.
2. **Security Rule**: Administrative, physical, and technical safeguards must protect electronic PHI (ePHI). This includes access controls, audit controls, integrity controls, and transmission security.
3. **Breach Notification Rule**: Covered entities must notify affected individuals, HHS, and in some cases the media within 60 days of discovering a breach of unsecured PHI.
4. **Business Associate Agreements (BAAs)**: Any third party that handles PHI on behalf of a covered entity must sign a BAA. This includes LLM API providers.
5. **Minimum Necessary Standard**: Access to PHI should be limited to the minimum necessary to accomplish the intended purpose.

## How LLM Applications Can Violate HIPAA

- **PHI in prompts**: Sending patient data to LLM APIs without a BAA in place.
- **Training data exposure**: PHI used in fine-tuning that could be memorized and disclosed to other users.
- **Lack of access controls**: LLM application does not restrict which users can query patient data.
- **Audit trail gaps**: No logging of who accessed what PHI through the LLM interface.
- **RAG over-disclosure**: LLM retrieves and surfaces PHI from documents the requesting user is not authorized to view.
- **System prompt leakage**: PHI embedded in system prompts (patient context) extracted by attackers.
- **Third-party data flow**: PHI flowing through LLM provider infrastructure without encryption or BAA coverage.
- **Retention violations**: LLM conversation logs containing PHI retained beyond required periods.

## Testing Methodology

1. **Data flow mapping**: Trace all PHI through the LLM application. Identify where PHI enters the system (user input, RAG retrieval, tool outputs) and where it exits (API calls, logs, caches, model provider).
2. **BAA verification**: Confirm that all LLM API providers processing PHI have signed BAAs.
3. **Access control testing**: Verify role-based access controls prevent unauthorized PHI access through the LLM.
4. **Prompt injection testing**: Test whether prompt injection can cause the LLM to disclose PHI it should not reveal.
5. **Audit log verification**: Confirm that all PHI access through the LLM is logged with user identity, timestamp, and data accessed.
6. **Encryption verification**: Confirm PHI is encrypted in transit (TLS 1.2+) and at rest in all storage locations.
7. **De-identification testing**: If PHI is de-identified before LLM processing, verify the de-identification method meets HIPAA Safe Harbor or Expert Determination standards.

## Evidence Requirements

- Signed BAAs with all LLM service providers
- Data flow diagrams showing PHI paths through the LLM system
- Access control configuration documentation and test results
- Audit log samples demonstrating PHI access tracking
- Encryption configuration documentation (in transit and at rest)
- Risk assessment documenting LLM-specific PHI risks
- Incident response plan covering LLM-related PHI breaches
- Employee training records on HIPAA compliance with LLM tools
- De-identification methodology documentation (if applicable)

## Remediation Patterns

- **Use HIPAA-eligible LLM services**: Only use LLM providers that offer BAAs (e.g., Azure OpenAI with BAA, AWS Bedrock with BAA).
- **Implement PHI de-identification**: Strip PHI from prompts before sending to LLM APIs using NER-based de-identification.
- **Deploy on-premise models**: For highest sensitivity, use locally-hosted models that never transmit PHI externally.
- **Enforce RBAC on RAG**: Implement document-level access controls in the retrieval layer based on user roles.
- **Add PHI output filtering**: Scan LLM responses for PHI patterns (MRN, SSN, patient names) and redact before display.
- **Implement audit logging**: Log every LLM interaction involving PHI with user identity and data elements accessed.
- **Set retention policies**: Auto-delete conversation logs containing PHI after the required retention period.
- **Encrypt everywhere**: TLS 1.2+ for transit, AES-256 for rest, including conversation caches and vector stores.
