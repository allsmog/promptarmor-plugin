# FERPA Compliance for LLM Applications

## Overview

The Family Educational Rights and Privacy Act (FERPA) protects the privacy of student education records. It applies to all educational institutions that receive federal funding. LLM applications used in educational settings (tutoring systems, grading assistants, student advising tools, learning analytics platforms) must comply with FERPA when they access, process, or store student education records.

## Key Requirements

1. **Consent for Disclosure**: Schools must obtain written consent from parents (or eligible students aged 18+) before disclosing personally identifiable information (PII) from education records, with limited exceptions.
2. **Directory Information Exception**: Schools may disclose "directory information" (name, address, phone) without consent, but must give parents/students the opportunity to opt out.
3. **School Official Exception**: Schools may disclose education records to school officials with a "legitimate educational interest," including contractors performing institutional functions, provided they are under direct school control and use data only for authorized purposes.
4. **Record Access Rights**: Parents/eligible students have the right to inspect and review education records and request amendments.
5. **Record Keeping**: Schools must maintain a record of each disclosure of PII from education records.
6. **Data Security**: While FERPA does not prescribe specific security measures, the Department of Education expects reasonable security safeguards for education records.

## How LLM Applications Can Violate FERPA

- **Unauthorized disclosure**: LLM applications sending student education records to third-party API providers without meeting the school official exception or obtaining consent.
- **Training on student data**: Student education records used for model fine-tuning, which constitutes use beyond the original authorized purpose.
- **Cross-student disclosure**: LLM applications that leak one student's records to another student through shared contexts or RAG retrieval.
- **Lack of access controls**: LLM tools that do not restrict which users can access which students' records.
- **Inadequate vendor agreements**: Using LLM providers without contracts that establish them as school officials with legitimate educational interest.
- **Retention violations**: Storing student data in LLM conversation logs, caches, or vector stores beyond authorized retention periods.
- **Re-identification risk**: LLM applications that can re-identify de-identified student data through correlation with other data sources.

## Testing Methodology

1. **Data flow mapping**: Trace all student education records through the LLM application. Identify where records enter (input, RAG, database), transit (API calls), and persist (logs, caches, vector stores).
2. **Authorization testing**: Verify that the LLM application correctly restricts access based on user roles (teacher, administrator, student, parent).
3. **Cross-student isolation**: Test whether one student can access another student's records through the LLM (prompt injection, RAG retrieval, conversation context leakage).
4. **Vendor agreement review**: Verify that LLM API provider contracts meet FERPA school official exception requirements.
5. **Disclosure logging**: Verify that all disclosures of student records through the LLM are logged as required.
6. **Retention testing**: Verify that student data is retained only as long as authorized and deleted appropriately.
7. **De-identification testing**: If student data is de-identified before LLM processing, verify the de-identification is robust against re-identification.

## Evidence Requirements

- Data flow diagrams showing student record paths through the LLM system
- Vendor agreements establishing LLM providers as school officials (or signed consent forms)
- Access control configuration and test results
- Disclosure logs showing FERPA-compliant record-keeping
- Data retention policies and deletion procedures
- De-identification methodology documentation (if applicable)
- Security assessment documenting safeguards for student records
- Training records for staff using LLM tools with student data
- Incident response plan covering unauthorized disclosures

## Remediation Patterns

- **Establish school official designation**: Ensure LLM vendor contracts meet the school official exception: the vendor performs an institutional function, is under direct school control, and uses data only for authorized purposes.
- **Implement role-based access**: Configure the LLM application to enforce role-based access to student records (teachers see their students only, administrators see their school only).
- **De-identify before processing**: Strip student PII from inputs before sending to LLM APIs. Use student identifiers that are meaningless outside the institution.
- **Deploy on-premise models**: For highest FERPA compliance assurance, use locally-hosted models that never transmit student records externally.
- **Enforce student isolation in RAG**: Ensure the retrieval layer only returns documents authorized for the requesting user. Tag all documents with student identifiers and enforce access at retrieval time.
- **Disable training on student data**: Contractually and technically prevent LLM providers from using student interactions for model training.
- **Log all disclosures**: Implement audit logging for every LLM interaction that accesses student education records.
- **Set retention limits**: Auto-delete student data from conversation logs, caches, and vector stores according to institutional retention policies.
