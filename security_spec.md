# Security Specification: BJJ Academy Firestore Database

## 1. Data Invariants
- Students must have a valid ID, name, belt, and non-negative stripe count (0 to 4).
- Invoices must have valid numerical amount >= 0, title, student reference, and valid status ('paid', 'pending', 'overdue').
- Class sessions must have valid time, name, and instructor.
- Sparring sessions must have valid student ID and training partner.
- No malicious or oversized payloads (>128 chars for IDs, bounded string lengths).

## 2. Protected Collections
- `/students/{studentId}`: Student athlete records.
- `/academies/{academyId}`: Registered martial arts academy units.
- `/classes/{classId}`: Tatami schedule and attendance records.
- `/invoices/{invoiceId}`: Financial invoices and Pix tracking.
- `/sparring_sessions/{sessionId}`: Athlete sparring rolls and submission stats.
- `/birthdays/{birthdayId}`: Birthday alert entries.
- `/crm_leads/{leadId}`: Student acquisition funnel.
