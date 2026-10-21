# CASE 25 — The Last Transmission

The site contains the cinematic CASE 25 opening, the investigation wall, the case acceptance sequence, and three playable Secret Level rounds. Round results are saved in browser localStorage. After Round III, the investigator sees a dynamic results dossier and a Secret Level unlocked screen before returning to the same investigation room. File 03 remains locked until the host manually confirms its release.

## Open and run

Open this project folder in VS Code. From the integrated terminal, run:

```sh
ruby -run -e httpd "/Users/harshinivepa/Documents/Codex/2026-10-18/bu" -p 4174
```

Then open <http://localhost:4174>. Keep the terminal running while you use the site. Press `Ctrl+C` to stop the local server. The artwork is in `assets/` and is served locally.

The lake scene waits for `PLAY`; that click also enables the ambient sound layer. The archive code is `6813`. After decryption, choose `OPEN INVESTIGATION`, open the recovered file on the wall, then choose `OPEN ARCHIVE`. The records scan and recovered folder play before the CASE 25 story continues. `REVIEW CASE` on the folder starts it immediately.

After M's complete message, hold for 14.2 seconds, distort it for 4.8 seconds, show the `SIGNAL LOST` frame for 1.15 seconds, then keep the screen black for 1.35 seconds before the desk lamp begins to reveal the new folder. The lamp reveal takes 2.7 seconds. Hold the unassigned file for 7.95 seconds total, with a subtle paper-turn beginning at 7.05 seconds. The official sheet reveals its heading, name, status, and three statements at 0.5, 1.5, 2.3, 3.1, 4.05, and 5.15 seconds. `ACCEPT CASE` appears at 8.15 seconds. Clicking it fades to black for 2.2 seconds, then returns to the existing evidence wall. File 01 is playable there; completing its replay marks it completed.

On the returned wall, use **Command+Shift+K** (macOS) or **Ctrl+Shift+K** (Windows/Linux) to open the private host passphrase prompt. The local default passphrase is `CASE25-HOST`; change `HOST_PASSPHRASE` near the top of `script.js` to customize it. Host controls become available only after File 01 has completed. Confirming **REVEAL NEXT LEAD** unlocks File 02 and displays its notification. This is a front-end-only gate, not secure authentication. Progress and notification dismissal use browser `localStorage`; clearing site data or changing browser profiles/devices can lose that state.

File 02 opens the financial-records entry screen and Secret Level. The three rounds use answer retries, save completed answers and award XP once. After the Round III dossier, the host can reveal File 03 from Host Controls.

File 03 opens M's typed WHAT REMAINS transmission, then the Project North Quay cover, three payment-record questions, and the written THE TRUE PAYMENT TRAIL deduction. The first two questions require a correct retry; Question 03 checks for an unverified allocation sheet, its suggested rather than proven matches, and missing approvals and bank confirmations. The final response uses a local phrase-group rubric to check the balance, transfer and invoice references, replay row, missing verification records, and limits on what the evidence proves. This is a transparent client-side heuristic, not semantic AI evaluation or secure grading, and may ask for clarification when a correct answer uses unexpected language. Its draft, attempts, and accepted state are saved in localStorage. The final M transmission returns to the existing investigation wall; Puzzle 2 is not opened or unlocked by this flow.

The File 03 opening types at 24 ms per character, with controls appearing after the complete message; its cover and question transitions use short fades. Reduced-motion settings show the complete copy without the typing delay. All File 03 state is stored under a separate localStorage key so it does not reset the earlier chapters.
