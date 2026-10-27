# Chinese Family Kinship App – Setup Guide

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app (HTML + CSS + JS). Open in a browser or host anywhere. |
| `Code.gs` | Google Apps Script backend: checks the passcode, returns your Sheet as JSON. |
| `sample-data.csv` | 6 example people (3 generations) to import into your Sheet. |

The current `index.html` is connected to the Apps Script URL and asks for a family name and passcode. The current family code is `Chong`; the login name field starts blank. A link with `?family=Chong` selects that family's saved browser login if available. If you want to run the built-in demo instead, change `APPS_SCRIPT_URL` back to `YOUR_APPS_SCRIPT_URL_HERE`.

## Step 1: Create the Google Sheet

1. Create a new Google Sheet. Rename the first tab to exactly `People`.
2. Import `sample-data.csv` (File > Import > Upload > "Replace current sheet"), or type your own family with this header row:

   `ID | Name | Gender | Father_ID | Mother_ID | Spouse_ID | Birth_Year | Sibling_Rank`

Rules for the data:
- `ID` is any unique value (1, 2, 3 ...). `Father_ID`, `Mother_ID`, `Spouse_ID` point to another row's `ID`. Leave blank if unknown.
- `Gender` is `M` or `F`. It decides 儿子/女儿, 哥哥/姐姐 and so on, so fill it for everyone.
- `Sibling_Rank`: 1 = eldest among full siblings. If blank, `Birth_Year` is used to decide older or younger.
- People who marry in (no parents listed) are placed in their spouse's generation row automatically.
- Siblings are detected when two people share a Father_ID or Mother_ID.

## Step 2: Add the backend

1. In the Sheet: **Extensions > Apps Script**.
2. Delete the default code, paste in `Code.gs`, and save.
3. The current `Code.gs` family registry has `chong` configured to use the spreadsheet the script is attached to. Click the gear icon (**Project Settings**) > **Script Properties** and set:
   - Property: `FAMILY_PASSCODE`
   - Value: the passcode your family will type (for example `jiating2026`)
4. **Deploy > New deployment** > type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize when asked, then copy the **Web app URL** (ends with `/exec`).
6. Test it: open `YOUR_URL?family=Chong&key=YOUR_PASSCODE` in a browser. A successful response should contain `data` as an array. A wrong family or passcode returns `{"status":"error",...}`.

To add another family later, add its lowercase code to `FAMILY_CODES` in `index.html` and to the `FAMILIES` object in `Code.gs`, with that sheet's spreadsheet ID, tab name, and a unique Script Property name (for example `FAMILY_LEE_PASSCODE`). Add the passcode under that property in Script Properties, then deploy a new Apps Script version and publish the updated site. Share the same Pages site with that family code in the query string, such as `?family=lee`. Do not put passcodes in `Code.gs`, `index.html`, or GitHub.

Whenever you change `Code.gs`, use **Deploy > Manage deployments > Edit > New version**, or the old code keeps running. Editing Sheet rows needs no redeploy.

## Step 3: Connect the app

Open `index.html` in a text editor and change the line near the top of the script:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";
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

## Good to know

- The passcode is a light family gate, not strong security. It travels in the URL, and anyone who knows it can read the whole sheet. Don't put sensitive details (ID numbers, addresses) in the Sheet.
- The Apps Script URL is visible in the page source. That's fine, since the passcode protects the data.
- Titles come from `relationship.js`, loaded from jsDelivr. For stability, pin an exact version in the script tag (for example `relationship.js@x.y.z`) after you confirm the version you tested works. If the library fails to load, the banner shows the Chinese relation chain (like 爸爸的哥哥) plus an error.
- Cousin titles such as `姑表姐`, `姨表哥`, and `舅表弟` are shortened to `表姐`, `表哥`, and `表弟` in the displayed title; the relationship path is still shown underneath.
- Spouse-side nephew/niece titles such as `妻侄女`, `夫侄儿`, and `妻侄子` are shortened to `侄女` or `侄儿`; `姨甥` is shown as `外甥男` or `外甥女` according to the target person's recorded gender.
- Parent's siblings use the preferred short titles `舅舅`, `阿姨`, `姑姑`, `伯伯`, or `叔叔`, without `大`/`小` age prefixes.
- Titles can differ by region (for example 舅舅 versus 娘舅). The library picks its standard Mandarin title.
- Very large families (50+ people in one generation) will need zooming out; the layout is one row per generation.
