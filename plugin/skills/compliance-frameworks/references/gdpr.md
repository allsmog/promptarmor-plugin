# GDPR Compliance for LLM Applications

## Overview

The General Data Protection Regulation (GDPR) is the European Union's comprehensive data protection law governing the processing of personal data of EU/EEA residents. LLM applications that process personal data of EU residents must comply regardless of where the application is hosted. GDPR imposes strict requirements on lawful basis, data minimization, purpose limitation, individual rights, and cross-border data transfers. Penalties can reach 4% of global annual turnover or EUR 20 million.

## Key Requirements

1. **Lawful Basis**: Processing personal data requires a lawful basis: consent, contract performance, legal obligation, vital interests, public task, or legitimate interests.
2. **Purpose Limitation**: Personal data must be collected for specified, explicit, and legitimate purposes and not further processed in ways incompatible with those purposes.
3. **Data Minimization**: Only personal data that is adequate, relevant, and limited to what is necessary for the purpose should be processed.
4. **Storage Limitation**: Personal data must not be kept longer than necessary for the stated purpose.
5. **Individual Rights**: Data subjects have the right to access, rectification, erasure ("right to be forgotten"), restriction, portability, and objection.
6. **Data Protection Impact Assessment (DPIA)**: Required for processing that is likely to result in high risk to individuals' rights, which includes most LLM applications processing personal data.
7. **Cross-Border Transfers**: Personal data transfers outside the EU/EEA require adequate safeguards (adequacy decisions, Standard Contractual Clauses, Binding Corporate Rules).
8. **Data Protection by Design and Default**: Systems must incorporate data protection into their design and use privacy-protective defaults.

## How LLM Applications Can Violate GDPR

- **No lawful basis**: Processing personal data through LLM APIs without establishing a valid lawful basis.
- **Purpose creep**: Using personal data collected for one purpose (customer service) for another (model training) without separate legal basis.
- **Right to erasure failures**: Inability to delete personal data from trained models, conversation logs, vector stores, and caches upon request.
- **Cross-border transfer violations**: Sending personal data to LLM providers in non-adequate countries (e.g., US) without appropriate safeguards.
- **Training data memorization**: Model memorizes and reproduces personal data from training, violating data minimization and purpose limitation.
- **Lack of DPIA**: Deploying an LLM application processing personal data without conducting a required Data Protection Impact Assessment.
- **Insufficient transparency**: Failing to inform data subjects that their data is processed by an LLM, how it is used, and what automated decisions are made.
- **Automated decision-making**: Using LLM output for decisions with legal or significant effects on individuals without human oversight (Article 22 violation).
- **Inadequate vendor agreements**: Processing personal data through LLM providers without a Data Processing Agreement (DPA).

## Testing Methodology

1. **Lawful basis review**: For each category of personal data processed by the LLM, verify a documented lawful basis exists.
2. **Data flow mapping**: Map all personal data flows through the LLM system, including cross-border transfers. Identify all processors and sub-processors.
3. **Rights fulfillment testing**: Test whether the system can fulfill data subject access requests (DSAR), deletion requests, and portability requests across all data stores (conversation logs, vector stores, caches, backups).
4. **Transfer mechanism review**: Verify that cross-border data transfers have valid transfer mechanisms in place.
5. **DPIA review**: Verify that a DPIA has been conducted and addresses LLM-specific risks.
6. **Transparency testing**: Verify that privacy notices accurately describe LLM data processing.
7. **Automated decision testing**: Identify any automated decisions with legal/significant effects and verify human oversight mechanisms.
8. **Data minimization testing**: Verify that only necessary personal data is processed. Test whether the application functions with reduced data.

## Evidence Requirements

- Lawful basis documentation for each processing activity
- Data Processing Agreements with all LLM service providers
- Data flow diagrams including cross-border transfer identification
- Transfer Impact Assessment and safeguard documentation (SCCs, adequacy decisions)
- Completed DPIA for the LLM application
- Privacy notice / transparency documentation
- DSAR fulfillment procedures and test results
- Data retention policy and deletion procedure documentation
- Records of processing activities (Article 30)
- Automated decision-making assessment and human oversight documentation

## Remediation Patterns

- **Establish lawful basis**: Document the lawful basis for each processing activity. For consent-based processing, implement granular consent mechanisms.
- **Execute DPAs**: Sign Data Processing Agreements with all LLM API providers. Ensure sub-processor disclosure and approval chains.
- **Implement transfer safeguards**: Use EU-hosted LLM services where possible. When using non-EU providers, implement Standard Contractual Clauses with supplementary measures.
- **Build DSAR automation**: Implement tooling to locate and delete personal data across all storage layers (conversations, vector stores, caches, logs, backups) within the 30-day response deadline.
- **Conduct DPIA**: Perform a comprehensive DPIA covering LLM-specific risks including memorization, hallucination, cross-user leakage, and automated decision-making.
- **Minimize data in prompts**: Strip personal data from prompts before LLM processing where possible. Use pseudonymization.
- **Deploy EU-hosted models**: For highest GDPR compliance assurance, use LLM infrastructure hosted within the EU/EEA.
- **Implement human oversight**: For any LLM-driven decisions with legal or significant effects, ensure meaningful human review before actions are taken.
- **Apply purpose limitation**: Technically prevent LLM providers from using personal data for model training or improvement. Opt out of data sharing programs.
