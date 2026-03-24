# COPPA Compliance for LLM Applications

## Overview

The Children's Online Privacy Protection Act (COPPA) regulates the collection, use, and disclosure of personal information from children under 13 in the United States. LLM applications that are directed at children or that knowingly collect information from children must comply with COPPA's requirements for parental consent, data minimization, and security. The FTC enforces COPPA with significant penalties for violations.

## Key Requirements

1. **Parental Consent**: Verifiable parental consent must be obtained before collecting, using, or disclosing personal information from children under 13.
2. **Privacy Policy**: A clear, comprehensive privacy policy must describe data collection practices, including what data is collected, how it is used, and disclosure practices.
3. **Data Minimization**: Only collect personal information reasonably necessary for the activity. Do not condition participation on unnecessary data collection.
4. **Data Security**: Maintain reasonable procedures to protect the confidentiality, security, and integrity of children's personal information.
5. **Data Retention Limits**: Retain children's personal information only as long as reasonably necessary. Delete when no longer needed.
6. **Parental Access**: Parents must be able to review, delete, and refuse further collection of their child's personal information.
7. **Third-Party Restrictions**: Do not disclose children's personal information to third parties unless the disclosure is integral to the service and the third party maintains adequate protections.

## How LLM Applications Can Violate COPPA

- **Implicit data collection**: LLM applications collecting children's conversations, preferences, or behavioral patterns without parental consent.
- **Training on children's data**: Using children's interactions with the LLM for model fine-tuning or improvement without consent.
- **Third-party API transmission**: Sending children's inputs to LLM API providers (third parties) without required disclosures.
- **Persistent conversation storage**: Retaining children's chat histories beyond what is necessary for the service.
- **Profile building**: LLM applications that build preference profiles or behavioral models from children's interactions.
- **Lack of age gating**: Failing to implement age verification before collecting data from users who may be children.
- **Targeted content**: Using children's data to personalize or target content without appropriate consent.
- **RAG with children's data**: Retrieving and processing documents containing children's personal information.

## Testing Methodology

1. **Age gate testing**: Verify that age verification mechanisms are in place and functional. Test bypass attempts.
2. **Consent flow testing**: Verify that parental consent is obtained before any data collection from children. Test whether the consent mechanism meets FTC-approved methods.
3. **Data collection inventory**: Map all data collected from child users, including inputs, metadata, conversation logs, and behavioral signals.
4. **Third-party data flow**: Verify that children's data sent to LLM API providers is covered by appropriate agreements and disclosures.
5. **Retention testing**: Verify that children's data is deleted according to policy. Check for data lingering in caches, logs, vector stores, or backups.
6. **Data minimization testing**: Verify that only necessary data is collected. Test whether the application functions with reduced data collection.
7. **Parental access testing**: Verify that parents can review, request deletion of, and opt out of further collection of their child's data.

## Evidence Requirements

- Age verification implementation documentation and test results
- Parental consent mechanism documentation (must meet FTC-approved methods)
- Privacy policy review confirming COPPA-required disclosures
- Data collection inventory for child users
- Data retention policy and deletion procedure documentation
- Third-party agreements covering children's data
- Security measures documentation for children's personal information
- Parental access and deletion request handling procedures
- Training records for staff handling children's data

## Remediation Patterns

- **Implement robust age gating**: Use age verification at registration. For LLM applications likely to attract children, implement neutral age screening (not age-encouraging).
- **Obtain verifiable parental consent**: Use FTC-approved consent methods (signed consent form, credit card verification, video call verification, government ID check).
- **Minimize data collection**: Configure the LLM to avoid requesting personal information from children. Strip PII from children's inputs before processing.
- **Disable training on children's data**: Ensure children's interactions are excluded from model training, fine-tuning, and feedback loops.
- **Implement strict retention**: Auto-delete children's conversation logs, inputs, and derived data after session completion or within a short retention window.
- **Restrict third-party sharing**: Use self-hosted models for children's applications where possible. If using third-party APIs, ensure contractual protections.
- **Deploy content filtering**: Apply age-appropriate content filtering on LLM outputs for child-directed applications.
- **Provide parental dashboard**: Build tools for parents to review their child's data, request deletion, and manage consent.
