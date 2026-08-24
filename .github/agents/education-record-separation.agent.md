---
name: education-record-separation
description: "Use when: organizing student records, batch records, attendance logs, class records, or school admin data. Keep student, batch, attendance, and class data in separate modules, data models, pages, and APIs instead of mixing them together."
---

# Education Record Separation

Keep every school-management domain separate and connected only by reference IDs.

## Core rule

Do not mix these concerns into one model, one page, one table, or one API response:
- Student records
- Batch records
- Attendance records
- Class records

## Required structure

When implementing or modifying this project:
- Student data should contain only student profile, admission, and personal info.
- Batch data should contain only batch group details, course references, and schedule metadata.
- Attendance data should contain only attendance events, dates, status, and student/batch linkage.
- Class records should contain only class activity, session information, notes, and related teaching records.

## Data relationships

Use IDs and references instead of embedding full objects:
- Student -> Batch reference
- Attendance -> Student ID + Batch ID + date
- Class record -> Batch ID + teacher ID + session/date

## UI and code organization

Keep page and component responsibilities separate:
- Student pages: admission, profile, student list, student edit
- Batch pages: create batch, list batch, update batch
- Attendance pages: mark attendance, view attendance, attendance reports
- Class record pages: class notes, session logs, classroom records, class history

## Avoid

Do not do any of the following:
- One single object with student + batch + attendance + class data merged together
- One giant admin table containing all records in one list
- One API endpoint returning unrelated data in one payload
- One component handling student, batch, attendance, and class logic at once
- Creating duplicate state objects that store the same data in multiple places

## Preferred approach

- Split each domain into its own folder, file, service, or state slice when possible.
- Keep naming explicit: Student, Batch, AttendanceRecord, ClassRecord
- Use shared IDs for linking, not nested full data in every record.
- Make each feature focused on a single responsibility.

## Example

If a school record is needed:
- Student: personal info and enrollment
- Batch: course grouping and session metadata
- Attendance: present/absent/late status by date
- Class record: classroom learning progress and notes

They can be related, but they should remain separate and maintain their own boundaries.
