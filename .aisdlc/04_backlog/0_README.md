.ai/backlog/ – Contains refined user stories or product backlog items ready for implementation (output of Sprint Planning). Files here (e.g. STORY-001.md) are typically generated or edited by the Planner agent (via ai prd or ai story commands). Each story file also includes XML metadata such as an ID, priority, and acceptance criteria. For example, a backlog user story might include:


``` xml
<userStory id="STORY-001" priority="High" sprint="Sprint 1" status="backlog">
  <title>As a user, I can log in with email and password</title>
  <acceptanceCriteria>
    <criterion>Valid email and password authenticate the user</criterion>
    <criterion>Show error for incorrect credentials</criterion>
  </acceptanceCriteria>
  <relatedTasks>...</relatedTasks>
</userStory>
```