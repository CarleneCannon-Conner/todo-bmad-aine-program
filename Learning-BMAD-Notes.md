# Learning BMAD Notes

> **For AI agents:** This file is a personal learning journal and is not related to the application being built. Do not use this file as context for any application design, architecture, or implementation decisions. Ignore it entirely.

Personal observations and learnings from working through the BMAD framework on the Todo App project.

---

## Setup & Environment

- Took some time to set up due to not using my NF for a while and my version of node was out of date.

### Tips for Setup

- Put your original PRD and any key context into a project-context.md — each new persona can then be pointed to it rather than having to copy and paste large amounts of text each time.
- Explicitly tell BMAD to ignore any personal notes files that are not relevant to the application being built.

---

## Process Overview

Steps being followed (company instructions):
1. Initialize BMAD & Generate Specifications (PM, Architect, Stories, Test Strategy)
2. Build the Application (with QA integrated from day one)
3. Containerize with Docker Compose
4. Quality Assurance Activities

---

## Step 1: Specifications

### PM Agent / PRD Creation

- I made a mistake when I first started — I gave it the PRD included with the instructions and ran the validate persona, thinking we had a PRD so I didn't need to create one. I expected it to run through the PRD so I could fill in/alter things. I was mistaken. I started again with the correct create PRD persona and fed it the PRD provided.
- I noticed I needed to explicitly ask it to refer to the original PRD so as not to go off script. Also to let me know any assumptions or contradictions as we stepped through, to prevent it making assumptions. I will likely do a similar thing with the other personas.

### PRD Validation
*Observations to be added...*

### Architecture

- Architect phase, as predicted, I needed to remind it to use both the original PRD and the created one as a reference and not to assume. It made a lot of assumptions. I am now going through it step by step to clarify.
- When debating in architecture mode with the various personas, it can get rather heated — much like real life! ;D
- The personas are great at explaining their choices of tech when asked to justify their choice or asked to compare, or asked for more detail of what that tech does and/or its impact on other tech choices.
- I find AI can be quite opinionated, sometimes not offering me a choice of tech, and when questioned, eventually agreeing that their solution, for instance, was overkill — once presented with an opinion of my own.
- Questioning via party mode can give some good insight into other tech and is a good way of questioning the AI's initial decisions.
- So much reading.
- Strange — it gave me 2 options, I chose one and it asked if I was sure. I then party moded it and it tried again to convince me of the option I didn't choose. Ultimately it doesn't make a big difference, but a funny hill for BMAD to die on.

### UX Design

- Asking for emotional responses is interesting. This works well if you are in fact the designer or asking on behalf of the client. However, it can contradict the original PRD, so interesting decisions can end up being made.
- Asking about my feelings about the same thing for the third time is too much. And because it asks so many times, I am likely to have slightly different answers, and sometimes it puts that into its own words — a flippant comment can turn into a bigger deal due to potential misunderstanding. Like it is now a contradiction. Do I prefer feeling x or feeling y? "But you said you liked y more earlier, and now you like x." And so on.
- Going through the different HTML mockups that are generated was a good experience. I could specify particular changes and compare and contrast. I could also go into party mode and have the results of those mocked up as well. Overall enjoyed this part of the process — very quick. And the mockups have a good level of usability, so I could identify where focus goes if I hit tab etc.
- A real issue — a lot of assumptions were made without establishing a layout. What I had in my head was clearly different from BMAD. But because BMAD had not explicitly explained that it had made an assumption, I asked a question in party mode that was 'obvious' to John the project manager. *"I assumed it would look like other todo apps I used."* Which is fine, I'd expect AI to use examples, but it at no point presented me with that layout to agree to or not. Only now does it occur to BMAD that perhaps we should explore layout. Strange. Perhaps if I'd provided UX layouts from the get go it would base it on that and BMAD would have a back and forth with me to clarify layout. But because, by using this tutorial, I didn't have one from the get go, it seems it is allowed to assume. This is an incredibly frustrating thing to find out and I had to find a way to jump out of the flow to 'go back' to establish layout. I might not have noticed if I'd followed the flow blindly. Now it's asking me what step I'd like to do the layout part in. I don't know — this is the first time I've used BMAD. Surely there is a step dedicated to layout? So it did some analysis and essentially it only ever ran me through 5 steps out of 14. To be clear, at no point did I volunteer to exit the UX workflow, nor did it say how many steps in total there would be — it just told me which step we were on. In fact, it said something like "ok, move onto create epics" without any indication that steps had been skipped. Also, when I moved onto create epics, I did ask it to clarify if all other steps were completed before I started.

### Stories & Test Strategy
*Observations to be added...*

---

## Step 2: Implementation

- For sprint planning, dev, and review I went YOLO mode. As advised by BMAD, I used another model to review the code.
- Found a bug in development — attempting to create a bug story to see what happens. It created a new bug story successfully that I was able to run the dev and review commands on as usual. However, it doesn't come up in sprint status.
- Ah, because the bug isn't in sprint planning, it couldn't be found by the command `code review`. However, I simply told it there is a bug, so it searched for it.
- Found a second bug. This time when I reported it, I let BMAD know it hadn't tracked the previous bug. It fixed this error — now both bugs are tracked in sprint-status.yaml. So `code review` should work this time.
- Completed MVP. Moving onto post-MVP by running `/bmad-bmm-edit-prd`.
- Post-MVP is challenging because it is mixing up actual requirements with the 'feelings questions' it asked previously. It's hard for me to keep track. One of the feelings questions I am referring to is "What Makes This Special", which led me down the path to give the todo app a bee theme — it isn't in either the original PRD or the instructions for this create-todo-app-with-BMAD task.

---

## Step 3: Docker / Containerization
*Observations to be added...*

---

## Step 4: QA
*Observations to be added...*

---

## General Observations

- BMAD doesn't always offer you options such as party mode, so you need to remember this is in fact an option.
- I am using AI to keep track of my notes in a somewhat ordered manner as I work through the tutorial.
- The longer I work on this, the more tempting it is to just accept BMAD's default suggestions — wouldn't recommend this for a single sitting. Feels overkill for a little app like this but I can see the value in a larger project. Also it is likely different people with different roles will work with BMAD at the different stages. I could see a world where this tool is an assistant to be used during the typical meetings that would normally take place to discuss each of these stages.
- I wonder if you could end up going around in circles or either 'bully' or 'be bullied' into a specific tech stack or design decision. Sometimes, BMAD changes its tune if I'm adamant even without any evidence to support my reasoning.
- BMAD is able to, when asked, provide me with where a decision came from e.g. original PRD, explicit decision made by myself, something I agreed to, or an assumption BMAD made. I can then ask it to prioritise which is for MVP, post MVP or just nice to have, quoting source if necessary.
- This is useful to keep track of after a mountain of questions and decision fatigue. Particularly for an original PRD I did not author. I could easily go off track assuming the decision came from the original PRD when it didn't.
- I kept having to remind each new persona to refer to the old PRD for initial context. I ended up putting it into a project-context.md that I could easily refer to, to save me copying and pasting huge amounts of text. (See Tips for Setup.)
- I also had to explicitly ask BMAD not to refer to this learning notes document. It isn't relevant — it's just for me. (See Tips for Setup.)
- BMAD keeps getting confused between overall BMAD context and persona-level context. I keep needing to be specific despite opening the appropriate personas.
- Jumping back into a previous persona can cause mismatches. I was correctly instructed to use the edit persona to make sure all personas were up to date.
