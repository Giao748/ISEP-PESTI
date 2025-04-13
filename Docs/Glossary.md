# Glossary

This document includes the glossary with the terms important to the project's business.

This is a live document, so it'll be constantly updated in the middle of each *Sprint*.
For the sake of organization,  the list was sorted  of terms by their aggregate's prefixes:

**ST:** Student  
**TE:** Teacher  
**TM:** Team  
**NW:** NewsAdd  
**WP:** WebPageTemplate  
**PC:** PodcastTemplate

**Note:** Each term without any prefix is assumed not to be part of any aggregate and is therefore part of a **Service** or **Generic Concept**.

---

## Student
| Expression        | Meaning                                                                                                                 |
|-------------------|-------------------------------------------------------------------------------------------------------------------------|
| (ST) Student      | The **Student** entity represents a user enrolled in a team who can submit content (e.g., news, webpages, or podcasts). |
| (ST) Student_Name | The full name of the student, often shown as the author of content.                                                     |
| (TE) Teacher      | The **Teacher** entity represents a user who supervises students and can be linked to multiple teams.                   |
| (TM) Team         | The **Team** is a group of students working together, possibly under the supervision of a teacher.                      |

## News/Add
| Expression                 | Meaning                                                                                                                |
|----------------------------|------------------------------------------------------------------------------------------------------------------------|
| **(NW) NewsAdd**           | The **NewsAdd** entity represents a submitted news item that may be validated and published.                           |
| **(NW) validation_status** | A **value object** indicating whether a news item is validated, pending, or rejected.                                  |
| **(NW) validator**         | The user or actor responsible for validating a news item.                                                              |
| **(NW) Current_State**     | A **value object** indicating the current state in the workflow of the news item.                                      |
| **(NW) Feedback_comment**  | Textual feedback provided by the validator explaining the decision.                                                    |
| **(NW) State_designation** | An **enum** describing possible states (e.g., pending, validated, rejected).                                           |
| **(NW) Log**               | A **log record** of the state transitions with fields: `date`, `start_status`, `end_status`, `current_status`, `user`. |

## WebPageTemplate
| Expression                | Meaning                                                       |
|---------------------------|---------------------------------------------------------------|
| **(WP) WebPageTemplate**  | A **template entity** for structuring news in webpage format. |
| **(WP) Title**            | The title of the webpage-based news item.                     |
| **(WP) Text_ContentBody** | The main text body of the news.                               |
| **(WP) Video**            | Optional video file included in the news webpage.             |
| **(WP) Image**            | Optional image file included in the news webpage.             |
| **(WP) Comment_Section**  | Section allowing readers to leave comments on the webpage.    |

## PodcastTemplate
| Expression                  | Meaning                                                                                           |
|-----------------------------|---------------------------------------------------------------------------------------------------|
| **(PC) PodcastTemplate**    | A **template entity** for structuring news in podcast format.                                     |
| **(PC) Introduction**       | The opening segment of the podcast.                                                               |
| **(PC) Development**        | The main discussion or body of the podcast episode.                                               |
| **(PC) Conclusion**         | The closing summary or takeaway of the podcast.                                                   |
| **(PC) Type**               | An **enum** identifying the type of podcast (e.g., interview, narrative, debate).                 |



## Generic Terms

| Expression          | Meaning                                                                       |
|---------------------|-------------------------------------------------------------------------------|
| Acceptance Criteria | Conditions that a functionality, product or feature must meet to be accepted. |
| Administrator       | Actor responsible for user management and system settings.                    |
| Student             |                                                                               |
| Professor           |                                                                               |
| Collaborator        |                                                                               |
| Add/New             | Action of creating new entities or content.                                   |
| Backlog             | List of tasks or features defined for completion or development.              |
| Category            | ?? To properly adjust                                                         |
| User Stories        | Short descriptions of features from the user/client's perspective.            |


**Note 2:**
- If a Term is a **Value Object**, it will be specified as **a** (e.g., *a pan*).
- If it is an **Entity**, it will be specified as **the** (e.g., *the Pen*) in the glossary.  
