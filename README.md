# Birthday wishes and card messages

919 short, ready-to-use lines for birthdays, Christmas, farewells, retirements, get well cards, sympathy cards, weddings, new babies and graduations, sorted by occasion and by who they're for. They were written by the Wish Tree team, with help from AI tools, for the guides on mywishtree.link and are shared here as open data in JSON and CSV.

Use them in an app, a lesson, a card shop or a chat bot.

## What's inside

| File | What it holds |
|---|---|
| `wishes.json` | All 919 lines as one JSON array |
| `wishes.csv` | The same lines as CSV: UTF-8, comma-separated, with a header row |
| `extract.mjs` | How we build both files from the source of the guides (it needs the site's source files to run) |

## Lines per occasion

| Occasion | Lines |
|---|---:|
| `birthday` | 373 |
| `christmas` | 169 |
| `new-year` | 7 |
| `farewell` | 154 |
| `retirement` | 70 |
| `get-well` | 28 |
| `sympathy` | 30 |
| `wedding` | 29 |
| `baby` | 29 |
| `graduation` | 27 |
| `anniversary` | 1 |
| `new-job` | 1 |
| `first-day-of-college` | 1 |
| **Total** | **919** |

## Fields

| Field | What it holds |
|---|---|
| `text` | The line as it appears on the site, with curly quotes and apostrophes |
| `occasion` | One of the occasions above |
| `for` | Who the line is for (see the list below) |
| `length` | Number of characters in `text` |
| `source` | The page on mywishtree.link where the line appears |

Values of `for`:

- **Friends and partners:** `friend`, `best-friend`, `partner`, `husband`, `wife`, `neighbor`, `acquaintance`
- **Family:** `family`, `mom`, `dad`, `parent`, `daughter`, `son`, `child`, `kid`, `sister`, `brother`, `sibling`, `niece-nephew`, `aunt-uncle`, `grandparent`, `in-law`
- **Work and school:** `coworker`, `boss`, `employee`, `team`, `client`, `teacher`, `student`
- **Others:** `couple`, `baby`, `new-parents`, `elderly` (older relatives and nursing home residents), `grieving` and `ill` (Christmas lines for someone who is grieving or ill)
- **Fits anyone:** `anyone`

16 lines have a placeholder in square brackets, such as `[name]`, to fill in before you send them. A few lines use a sample name or signature, such as Maria or "Dee, Support". Swap in your own.

## Example

`wishes.json` is one array of objects like this one:

```json
{
  "text": "You’re still my favorite notification. Happy birthday!",
  "occasion": "birthday",
  "for": "partner",
  "length": 54,
  "source": "https://mywishtree.link/birthday-wishes"
}
```

## Load the data

JavaScript (save as `wish.mjs` and run `node wish.mjs` with Node 18 or later; it also works in Deno and in a browser module):

```js
const url = 'https://raw.githubusercontent.com/wish-tree-app/birthday-wishes/main/wishes.json';
const wishes = await (await fetch(url)).json();

const forMom = wishes.filter((w) => w.occasion === 'birthday' && w.for === 'mom');
console.log(forMom[Math.floor(Math.random() * forMom.length)].text);
```

Python 3:

```python
import json
import random
import urllib.request

url = "https://raw.githubusercontent.com/wish-tree-app/birthday-wishes/main/wishes.json"
with urllib.request.urlopen(url) as response:
    wishes = json.load(response)

short = [w for w in wishes if w["occasion"] == "christmas" and w["length"] <= 40]
print(random.choice(short)["text"])
```

## License

The lines are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). You can copy, change and use them anywhere, including in commercial projects, as long as you credit Wish Tree with this line:

> Wishes from [Wish Tree](https://mywishtree.link/birthday-wishes), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

To paste it into a web page:

```html
Wishes from <a href="https://mywishtree.link/birthday-wishes">Wish Tree</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
```

Or into Markdown:

```markdown
Wishes from [Wish Tree](https://mywishtree.link/birthday-wishes), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
```

Put the line where people can see it, for example in your app's About screen, your site's footer or the notes of your lesson. If you change the wording of a line, say so, for example "Adapted from Wish Tree".

## Where the lines come from

The Wish Tree team wrote these lines, with help from AI tools, for the guides on [mywishtree.link](https://mywishtree.link), an online wish tree: you make a tree for a birthday, Christmas or any moment, friends hang wishes on it, and you open them on the day. Each line's `source` field names the guide page it appears on.

Found a typo or a line that reads wrong? Open an issue.
