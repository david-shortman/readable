# first get all lines from file
with open('alphabets.txt', 'r') as f:
    lines = f.readlines()

# remove excess whitespace
lines = [line.replace('\n', '', 1) for line in lines]
lines = [line.replace(' ', '') for line in lines]

# remove invalid alphabets
lines = list(filter(lambda line: len(line) == 26, lines))

# save characters mappings to dict
characterMap = {}
lowerAlphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't','u','v','w','x','y','z']
upperAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T','U','V','W','X','Y','Z']
lowercase = True
for line in lines:
    for x in range(26):
        if not line[x].lower() in lowerAlphabet: # avoid actual ascii characters
            if lowercase:
                characterMap[line[x]] = lowerAlphabet[x]
            else:
                characterMap[line[x]] = upperAlphabet[x]
    lowercase = not lowercase

# write dict to json
import json
with open('character-map.json', 'w') as f:
    json.dump(characterMap, f)