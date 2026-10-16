# Xp For Habits

Create the Habit Quest RPG app from my master product prompt, starting with the core habit-tracking and quest loop.Build a functional web application called HABIT QUEST RPG.
IMPORTANT: Start implementing the application in the current project. Do not merely describe a plan or return a message saying that you will create it.
Create a polished, responsive fantasy RPG habit tracker with a premium dark interface, warm gold accents, mystical violet highlights, readable typography, and a distinctive game-inspired dashboard.
For the first working version, implement these features:
PLAYER DASHBOARD
Player name, avatar, current level, total XP, and progress toward the next level.
Today's quest list.
Daily completion summary.
Current streak information.
QUEST MANAGEMENT
Allow users to create a habit with a title, category, and XP reward.
Allow users to complete and uncomplete a quest.
Award XP only once per scheduled quest occurrence.
Support daily recurring quests.
Prevent duplicate XP when the same quest is clicked repeatedly.
GAME PROGRESSION
Use a configurable XP and level calculation system.
Update the level and progress bar immediately when XP is earned.
Show a small celebration when the player levels up.
PERSISTENT DATA
Save quests and player progress in browser localStorage.
Restore the data after a page refresh.
Use stable IDs and completion dates.
Handle invalid stored data safely.
Ensure unchecking a completed quest cannot silently grant XP again.
ACHIEVEMENTS
Award a First Quest badge after the first valid quest completion.
Show earned and locked achievements.
Prevent duplicate achievement rewards.
VISUAL DESIGN
Use a clear left navigation on desktop and mobile-friendly navigation on small screens.
Include functional Dashboard, Quests, Achievements, and Profile sections.
Use polished quest cards, progress indicators, empty states, and accessible buttons.
Use subtle animations rather than excessive effects.
TECHNICAL REQUIREMENTS
Inspect the existing project and use its supported framework.
Keep components modular and game rules separate from UI code.
Make every visible button functional.
Do not use fake statistics or pretend data is saved when it is not.
Do not add unnecessary authentication, payment systems, or external APIs.
Run the application, fix build errors, and verify the main interactions.
First deliver the working core application. Keep the implementation focused and do not attempt the advanced world map or complex skill tree yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ee6f590-383c-4d5e-ace0-b1f2179d73cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
