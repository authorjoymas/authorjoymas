# New Page Instructions

## Step 1 Create new page

1. Click empty space in the explorer
2. In explorer click the new file button.
3. Name it: e.g. name.html
4. Copy and paste the text in index.html to name.html
5. Change the 'contentPath' to a subfolder in the content directory

## Step 2 Create New Link

1. Open the file web/components/nav.html
2. duplicate one of the links between and including <li>...</li>
3. Change the 'id' to e.g. "name" and the text to whatever.
4. Change the 'href' to path of the new page e.g. "/name.html" → the / is important

## Step 3 Change Colour of link

1. Open the file content/color.txt
2. On a new line type the id you previously set followed by a colon and the hexadecimal value of the colour (remember the hash) e.g. 'name: #12ab43'

> You can actually do a bunch of other background stuff such as images, gradients etc, the bit after the colon just needs any valid set of css background values. Look here [MDN DOCs](https://developer.mozilla.org/en-US/docs/Web/CSS/background)

## Adding Content

1. In the content folder make the subfolder specified by 'contentPath' from the first Step. e.g. make folder '/content/name/'
2. Create your markdown files with content.
