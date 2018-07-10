# abadia

Set of tools to help translate, fix, tweak and improve key-value i18n files.

Already usable.

The reader (the most important part) is, of course, not open-sourced yet (we have one in C# for Unity, used by the game [Steredenn](http://steredenn.pixelnest.io/)).

## Commands

1. `clean` removes all the fluffs from a file (comments, etc.). Useful for diffing a file.
2. `convert` takes two files and create a special file to compare them later.
3. `translate` add translations to a file generated with `convert`.
4. `select` starts an interactive session to select values from a file generated with `convert`. If you stop during the session and restart later with the same output file, it will re-use what has already been done. You can do the work in multiple sessions this way. 👍

[Example of `select`.](./docs/select.mp4)

## File specification

Minimum required:

```
<Language name in english>
<Language name in language>

Value_Test = Corresponding String
```

You can use comments:

```
# This is a comment.
```

You can also re-use a key in another key:

```
Common_Play = Play
Tutorial_Button = $Common_Play
```

The format of a key is capitalized words, separated by underscores.

```
Value = Test              # valid
Value_Value = Test        # valid
Value_Value_Value = Test  # valid

value = Test              # invalid
valueValue = Test         # invalid
value-value = Test        # invalid
```

Spaces and newlines are insignificant.

### Examples

English file `en.txt`:

```
English
English

Common_Play = Play
```

French file `fr.txt`:

```
French
Français

Common_Play = Jouer
```
