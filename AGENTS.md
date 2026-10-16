<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Game rules live in src/lib/game/rules.ts (pure functions); React state/localStorage persistence in src/lib/game/store.tsx. Why: keeps rules testable and UI-free.
- Signed-in players' full game state lives in one cloud row per user (game_saves); cloud copy wins on sign-in, local copy is uploaded if none. Why: simple cross-device sync without reshaping rules.
