### Inventory Sheet

The inventory sheet is where you configure the sounds in your language - what sounds there are and when they can occur.

The first row has several white boxes (more than are functional I believe - something to fix later, maybe) for _word structures_.  This is where you tell the sheet what sort of syllables a word can have.  To do this, think up what syllable types you want to have and assign each syllable type a letter.  For example, you could have stressed and unstressed syllables represented by S and U, or initial and final syllables represented by I and F, or anything else you can imagine.  

Underneath is the input for _syllable structure_.  Each row is for formatting a single type of syllable - e.g one for S (stressed) and one for U (unstressed) and so on.  Every letter you used in the word-structure input should have its own row here.  These letters go in the green, left-most cell of the row.

The white cells are the syllable structure for each syllable type.  For example, a stressed syllable might have _consonant-vowel-consonant_ syllables, which you could represent with CVC, or _consonant-vowel-glide_ syllables, which you could represent by CVG, while unstressed syllables could simply be _consonant-vowel_, represented by CV.  You can pick several different syllable structures for each syllable type.

Underneath all of this are columns for individual phoneme inputs.  A phoneme is one of the sounds you can have in your language.  Every letter you used to represent a syllable part in the previous section should be in the top green space of one of these columns - e.g. a column for C, V and G if you used the syllable structures above.  Underneath this, in the column itself, you can include the individual sounds you want the language to be able to have in that part of the syllable - for example, you might want C to have _p, t_ and _k_ but not _b, d_ and _g_.  You can put symbols from the International Phonetic Alphabet (IPA) in these cells.

In the blue cell to the left of each phoneme you should put the frequency of the phoneme.  This allows you to have some sounds show up more frequently than others.  You can specify the frequency by putting in numbers that all add up to 1, which will mean that, for example, a phoneme with 0.1 will show up 10% of the time.  Alternatively, you can simply write a number in and the column will be normalised, so that a phoneme assigned 2 will show up twice as often as a phoneme assigned a 1, without having to check if the total equals a particular number.

---

![Inventory|500](/content/media/namegen/Inventory.png)
