### Sound Change

This sheet is for defining your sound changes.

The top of each column has a white cell where you can write the name of your language.  This will also be reflected on the Input sheet.

The sheet will generate a word based on your seed.  Let's call it the _ancestor-word_.  The ancestor-word won't be visible anywhere.  Each column will provide instructions to change the ancestor-word to a new descendent-word.  The left-hand cell in each set of columns is the thing to be changed, and the right-hand column is what it should be changed to.  For example, if you want to change _p_ to _f_, you would write _p_ in the left-hand column and _f_ in the right-hand column.

If you want a sound to disappear entirely, you can place the sound in the left-hand column and leave the right-hand column blank.

The sheet automatically assigns a tilde (\~) to the beginning and end of each ancestor word, and removes them at the end of the sound-change process.  This allows you to change the beginnings and ends of words separately - e.g. if you only want _p_ to change to _f_ at the beginning of a word, you can place _\~p_ in the left column and _\~f_ in the right column.

The sheet isn't very clever.  It can't figure out rules about sounds that are not adjacent to each other, and it has to go through the changes one by one in order, rather than doing some of them simultaneously.  There are some workarounds for this if you want to get more complicated.  For example, you can add stress marks to the Inventory page and assign them as phonemes in stressed syllables, and then use them to treat stressed consonants and vowels differently to unstressed consonants and vowels.  You can add terminal indicators to the end of syllables in the Inventory page (I used the full-stop) to indicate the end of a syllable, in case you want to treat codas or medials differently from initials.  You can also change a phoneme to a placeholder phoneme so that you can emulate simultaneous changes (for example, if _ki_ is going to become _si_ but original _si_ is going to become _shi_, then you can change _ki_ to _xi_ first and then change it back afterwards).

Of course, you can keep it simple.

---

![Sound Changes|70](/content/media/namegen/SoundChange.png)

