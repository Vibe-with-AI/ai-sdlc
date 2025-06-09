.ai/ideas/ – This is where Product Owner inputs go. Each file in ideas/ represents a raw product idea or feature request, possibly created via the ai idea command. Files may be named with an IDEA-xxx ID. They contain a short description and meta-info. We use an XML front-matter in these files to structure metadata (e.g. unique ID, date, author) and content sections, which helps agents parse the idea consistently. For example, an idea file might start as:


```xml
<!-- .ai/ideas/IDEA-001.md -->
<?xml version="1.0"?>
<idea id="IDEA-001" created="2025-06-07" status="new">
  <title>Login via email/password</title>
  <description>Allow users to log in with email and password for account access.</description>
  <notes>Initial concept from stakeholder meeting.</notes>
</idea>
```