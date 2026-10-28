# Chinese Family Kinship App – Setup Guide

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app (HTML + CSS + JS). Open in a browser or host anywhere. |
| `Code.gs` | Google Apps Script backend: checks the passcode, returns your Sheet as JSON. |
| `sample-data.csv` | 6 example people (3 generations) to import into your Sheet. |

The app asks for a family name and passcode. `FAMILY_API_URLS` maps each family code to that family's separate Apps Script Web App URL. A link with `?family=Chong` or `?family=Sio` preselects the family and uses that family's saved browser login if available. If all URLs are blank, the built-in demo data is used.

## Step 1: Create the Google Sheet

1. Create a new Google Sheet. Rename the first tab to exactly `People`.
2. Import `sample-data.csv` (File > Import > Upload > "Replace current sheet"), or type your own family with this header row:

   `ID | Name | Gender | Father_ID | Mother_ID | Spouse_ID | Birth_Year | Sibling_Rank`

Rules for the data:
- `ID` is any unique value (1, 2, 3 ...). `Father_ID`, `Mother_ID`, `Spouse_ID` point to another row's `ID`. Leave blank if unknown.
- `Father_ID` and `Mother_ID` are the parent-child relationships the tree should draw. Enter biological or adoptive parents here as appropriate; a current step-parent belongs in `Spouse_ID`, not in the child's parent fields unless they are also a parent.
- `Spouse_ID` represents the partner to show with a dotted couple line. It does not store divorce history or multiple former spouses.
- `Gender` is `M` or `F`. It decides 儿子/女儿, 哥哥/姐姐 and so on, so fill it for everyone.
- `Sibling_Rank`: 1 = eldest among full siblings. If blank, `Birth_Year` is used to decide older or younger.
- People who marry in are placed beside their spouse. Descendant branches are packed beneath their recorded parents, and siblings are ordered by birth year (or `Sibling_Rank` when years are missing).
- Siblings are detected when two people share a Father_ID or Mother_ID.

## Step 2: Add the backend

1. In that family's Sheet, choose **Extensions > Apps Script**.
2. Paste the reusable `Code.gs` template into that family's Apps Script project and save. Each project reads only its own bound spreadsheet's `People` tab.
3. In **Project Settings > Script Properties**, add:
   - Property: `FAMILY_PASSCODE`
   - Value: the passcode this family will enter
   Each separate Apps Script project has its own property, so the same property name can hold different family passcodes.
4. **Deploy > New deployment** > type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize when asked, then copy the **Web app URL** (ends with `/exec`).
6. Test it: open `YOUR_URL?key=YOUR_PASSCODE` in a browser. A successful response should contain `data` as an array. A wrong passcode returns `{"status":"error",...}`.

The Sio family has its own Apps Script project and passcode. Its data tab must be named `People`, with the same eight headers. Add the Sio passcode as that project's `FAMILY_PASSCODE` Script Property. The passcode is not stored in this repository. After deploying, add its `/exec` URL to the `sio` entry in `FAMILY_API_URLS` in `index.html`. The Sio family link is `https://kongjin0808.github.io/Family-Kinship/?family=Sio`.

For the supplied Sio workbook, the private `Sio-People-import.csv` file is the prepared import for a `People` tab. It contains 288 named workbook records plus 14 clearly labeled placeholders for people explicitly named as parents but missing full records. The app merges the placeholder `SIO-P010` into the confirmed ancestor `SIO-001` (Sio Chip / 苏式习), joins that person to 尤春敬, and links their children under the couple. It also maps Lily Hong and Nee Hong to Sam Hong (`SIO-179`) as their father, per family confirmation. Remaining placeholder cards are kept on a dedicated top tier for later family review. Keep the two `苏峇璽` records distinct: `Sio Chip (苏式习)` and `Sio Bar Soo (苏峇璽)`. The CSV is ignored by Git and is not part of the public site repository. The import uses `English name (中文名)` for display, with Chinese-only names where no English name was supplied.

To add another family later, create a separate Apps Script project from that family's Sheet, paste in the same `Code.gs` template, set that script's `FAMILY_PASSCODE`, and deploy it. Then add one entry to `FAMILY_API_URLS` in `index.html` using the lowercase family code and that Web App URL. You do not need to edit any existing family's Apps Script. Publish the updated site and share its family link, such as `?family=lee`. Do not put passcodes in `Code.gs`, `index.html`, or GitHub.

Whenever you change `Code.gs`, use **Deploy > Manage deployments > Edit > New version**, or the old code keeps running. Editing Sheet rows needs no redeploy.

## Step 3: Connect the app

Open `index.html` in a text editor and add the family code and its Web App URL near the top of the script:

```js
const FAMILY_API_URLS = {
  chong: "https://script.google.com/macros/s/CHONG_ID/exec",
  sio: "https://script.google.com/macros/s/SIO_ID/exec"
};
```

## Step 4: Share it

- Quick test: double-click `index.html`.
- For family: host it free on GitHub Pages, Netlify Drop or Cloudflare Pages, then share a family-specific link (for Chong: `https://kongjin0808.github.io/Family-Kinship/?family=Chong`) and the passcode privately.

## How it behaves

- First visit asks for a family name and passcode. The passcode is saved in the browser's `localStorage` separately for each family.
- A wrong family or passcode clears that family's saved value and shows the prompt again.
- **Change Passcode / 退出** (top right) clears the saved passcode.
- Rows without a name are omitted. Tap a card for Person A (me), then a card for Person B. The banner shows both titles.
- Use **Clear selections / 清除选择** to reset both people. Male and female cards have distinct background colors, and spouses are arranged male-left/female-right.
- Drag to pan; pinch or use + / − / ⤢ to zoom.
- A step-parent badge is inferred when a person is the recorded spouse of a parent but is not listed as the child's other parent. The tree keeps parent-child lines attached to the IDs in `Father_ID` and `Mother_ID`; it does not turn a step-parent into a biological-parent connection.
- For divorce, the former partner remains represented in the child's parent links. A dotted couple line is shown only for a pair listed in `Spouse_ID`. The current sheet schema cannot label a relationship explicitly as “divorced” or store several former spouses; that needs a separate relationship-history field/table.

## Good to know

- The passcode is a light family gate, not strong security. It travels in the URL, and anyone who knows it can read the whole sheet. Don't put sensitive details (ID numbers, addresses) in the Sheet.
- The Apps Script URL is visible in the page source. That's fine, since the passcode protects the data.
- Titles come from `relationship.js`, loaded from jsDelivr. For stability, pin an exact version in the script tag (for example `relationship.js@x.y.z`) after you confirm the version you tested works. If the library fails to load, the banner shows the Chinese relation chain (like 爸爸的哥哥) plus an error.
- Cousin titles such as `姑表姐`, `姨表哥`, and `舅表弟` are shortened to `表姐`, `表哥`, and `表弟` in the displayed title; the relationship path is still shown underneath.
- Spouse-side nephew/niece titles such as `妻侄女`, `夫侄儿`, and `妻侄子` are shortened to `侄女` or `侄儿`; `姨甥` is shown as `外甥男` or `外甥女` according to the target person's recorded gender.
- Parent's siblings use the preferred short titles `舅舅`, `阿姨`, `姑姑`, `伯伯`, or `叔叔`, without `大`/`小` age prefixes.
- Their spouses use `舅妈`, `姨丈`, `伯母`, `婶婶`, or `姑丈`, also without `大`/`小` age prefixes.
- Titles can differ by region (for example 舅舅 versus 娘舅). The library picks its standard Mandarin title.
- The full Sio tree has about 300 cards, so it works best as a zoomable overview. Use **Focus Person A's family** to read a smaller branch on a phone or tablet. The focused tree includes Person A's spouse, the spouse's children, and the children's recorded other parent where available.
